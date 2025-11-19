// app/api/content/[id]/view/route.ts - VERSION SIMPLIFIÉE
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('>>> /api/content/[id]/view POST called')
    const session = await getServerSession(authOptions);
    console.log('Session:', !!session, session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('⛔ Request unauthenticated')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (userId !== session.user.id) {
      console.log('⛔ userId mismatch:', userId, session.user.id)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Short-circuit: check if a ContentView already exists for this user+content
    // This avoids incrementing the counter twice in common cases.
    const existing = await prisma.contentView.findFirst({
      where: {
        userId: session.user.id,
        contentId: id,
      },
    })

    if (existing) {
      console.log('ℹ️ Vue déjà enregistrée (check existant) for', session.user.id, id)
      // Do not increment here: only increment when a new ContentView is created.
      return NextResponse.json({ message: 'Déjà vu' })
    }

    const processingKey = `${session.user.id}:${id}`
    const g = globalThis as any
    if (!g.__contentViewProcessing) g.__contentViewProcessing = {}
    if (g.__contentViewProcessing[processingKey]) {
      console.log('⏳ Duplicate request in flight, skipping processing for', processingKey)
      return NextResponse.json({ message: 'Processing' })
    }

    g.__contentViewProcessing[processingKey] = true
    try {
      // Create the view record atomically (skip duplicates) and increment the counter only if inserted
      console.log('⏳ Creating contentView (createMany skipDuplicates) for', session.user.id, id)
      const result = await prisma.contentView.createMany({
        data: [{
          userId: session.user.id,
          contentId: id,
          viewedAt: new Date(),
        }],
        skipDuplicates: true,
      })

      // result.count is number of rows inserted
      if (result.count && result.count > 0) {
        await prisma.content.update({ where: { id }, data: { views: { increment: 1 } } })
        console.log('✅ Nouvelle vue enregistrée et compteur incrémenté for', id)
      } else {
        console.log('ℹ️ Aucun nouvel enregistrement (déjà existant) — pas d\'incrément pour', id)
      }
    } catch (createError: any) {
      // If there's a unique constraint error or other conflict, log and continue
      if (createError.code === 'P2002') {
        console.log("ℹ️ Vue déjà enregistrée (contrainte d'unicité) for", session.user.id, id)
        return NextResponse.json({ message: 'Déjà vu' })
      }

      if (createError.code === 'P2034') {
        console.log('🔄 Conflit de transaction, réessai...', id)
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          await prisma.content.update({ where: { id }, data: { views: { increment: 1 } } })
          console.log('✅ Compteur mis à jour après réessai for', id)
        } catch (retryError) {
          console.error('❌ Échec du réessai:', retryError)
        }
        return NextResponse.json({ success: true })
      }

      throw createError
    } finally {
      // cleanup in-memory guard
      try { delete (globalThis as any).__contentViewProcessing[processingKey] } catch {}
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Erreur incrémentation vue:', error);
    
    // Ne pas bloquer l'utilisateur pour des erreurs de compteur
    if (error.code === 'P2025') {
      // Contenu non trouvé
      return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
    }
    
    // Pour les autres erreurs, on retourne un succès partiel
    return NextResponse.json({ 
      success: true,
      warning: 'Vue enregistrée avec avertissement'
    });
  }
}