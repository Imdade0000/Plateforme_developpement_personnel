// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 100MB)' }, { status: 400 })
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public/uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const originalName = file.name
    const fileExtension = originalName.split('.').pop()
    const fileName = `file_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Retourner l'URL publique du fichier
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      success: true, 
      fileUrl: fileUrl,
      fileName: originalName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}