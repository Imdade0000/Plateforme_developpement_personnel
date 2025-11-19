// src/app/api/admin/content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { ContentFormat, ContentType, ContentStatus, DifficultyLevel } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
   
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    console.log('Body reçu:', body)
   
    // Générer un slug unique
    const baseSlug = body.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    let slug = baseSlug
    let counter = 1
    while (await prisma.content.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Valider le format (type de fichier)
    const validFormats = ['ARTICLE', 'VIDEO', 'EBOOK', 'AUDIO', 'PODCAST', 'COURSE']
    const contentFormat = body.contentType || 'ARTICLE'
    
    if (!validFormats.includes(contentFormat)) {
      return NextResponse.json(
        { error: `Format invalide. Valeurs acceptées: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Mapper les formats
    const formatMap: { [key: string]: ContentFormat } = {
      'ARTICLE': ContentFormat.ARTICLE,
      'VIDEO': ContentFormat.VIDEO,
      'PDF': ContentFormat.EBOOK, // PDF devient EBOOK
      'EBOOK': ContentFormat.EBOOK,
      'AUDIO': ContentFormat.AUDIO,
      'PODCAST': ContentFormat.PODCAST,
      'COURSE': ContentFormat.COURSE
    }
    
    // ContentType représente la catégorie thématique
    const contentTypeMap: { [key: string]: ContentType } = {
      'MEDITATION': ContentType.MEDITATION,
      'PRODUCTIVITY': ContentType.PRODUCTIVITY,
      'RELATIONSHIP': ContentType.RELATIONSHIP,
      'HEALTH': ContentType.HEALTH,
      'FINANCE': ContentType.FINANCE,
      'CAREER': ContentType.CAREER,
      'SPIRITUALITY': ContentType.SPIRITUALITY,
      'MINDSET': ContentType.MINDSET,
      'PARENTING': ContentType.PARENTING,
      'OTHER': ContentType.OTHER
    }

    const statusMap: { [key: string]: ContentStatus } = {
      'DRAFT': ContentStatus.DRAFT,
      'PUBLISHED': ContentStatus.PUBLISHED
    }

    const difficultyMap: { [key: string]: DifficultyLevel } = {
      'ALL_LEVELS': DifficultyLevel.ALL_LEVELS,
      'BEGINNER': DifficultyLevel.BEGINNER,
      'INTERMEDIATE': DifficultyLevel.INTERMEDIATE,
      'ADVANCED': DifficultyLevel.ADVANCED
    }
   
    // Construire les données selon votre schéma exact
    const contentData = {
      // Champs texte obligatoires
      title: body.title,
      slug: slug,
      excerpt: body.excerpt,
      description: body.description || body.excerpt || '',
      
      // Enums requis
      contentType: contentTypeMap[body.category || 'OTHER'] || ContentType.OTHER,
      format: formatMap[contentFormat] || ContentFormat.ARTICLE,
      
      // Contenu (seulement pour les articles)
      content: contentFormat === 'ARTICLE' ? body.content : null,
      
      // Fichiers
      fileUrl: body.fileUrl || null,
      thumbnail: body.thumbnail || null,
      previewUrl: body.previewUrl || null,
      
      // Prix et accès
      isFree: body.isFree,
      price: body.isFree ? 0 : (parseFloat(body.price) || 0),
      currency: 'XOF',
      isFeatured: body.isFeatured || false,
      isPromoted: false,
      
      // Statut
      status: statusMap[body.status] || ContentStatus.DRAFT,
      
      // Auteur
      authorId: session.user.id,
      
      // Métadonnées
      difficulty: difficultyMap[body.difficulty || 'ALL_LEVELS'] || DifficultyLevel.ALL_LEVELS,
      language: body.language || 'fr',
      ageRating: body.ageRating || 'ALL',
      
      // Métadonnées optionnelles
      durationMinutes: body.duration ? parseInt(body.duration) : null,
      pagesCount: body.pagesCount ? parseInt(body.pagesCount) : null,
      fileSize: body.fileSize ? parseInt(body.fileSize) : null,
      
      // Promotions
      discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : 0,
      discountExpires: body.discountExpires ? new Date(body.discountExpires) : null,
      
      // Dates
      publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      featuredUntil: body.featuredUntil ? new Date(body.featuredUntil) : null,
      promotedUntil: null,
      
      // Statistiques par défaut
      views: 0,
      likes: 0,
      downloads: 0,
      shares: 0,
      rating: 0,
      totalReviews: 0,
      totalSales: 0,
      totalEarnings: 0,
      
      // SEO - Utiliser Prisma.JsonNull au lieu de null
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      keywords: body.keywords || undefined,
    }

    console.log('Données à insérer:', contentData)

    const content = await prisma.content.create({
      data: contentData,
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      content
    })

  } catch (error: any) {
    console.error('Error creating content:', error)
    
    // Erreur de contrainte unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un contenu avec ce slug existe déjà' },
        { status: 400 }
      )
    }
    
    // Erreur de validation
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Référence invalide (auteur introuvable)' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du contenu',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
   
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const format = searchParams.get('format')
    const contentType = searchParams.get('contentType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (format && format !== 'all') {
      where.format = format
    }
    
    if (contentType && contentType !== 'all') {
      where.contentType = contentType
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true,
              image: true
            }
          },
          _count: {
            select: {
              purchases: true,
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.content.count({ where })
    ])

    return NextResponse.json({
      success: true,
      contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contenus' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
   
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Si format est modifié
    if (updateData.format) {
      const formatMap: { [key: string]: ContentFormat } = {
        'ARTICLE': ContentFormat.ARTICLE,
        'VIDEO': ContentFormat.VIDEO,
        'PDF': ContentFormat.EBOOK,
        'EBOOK': ContentFormat.EBOOK,
        'AUDIO': ContentFormat.AUDIO,
        'PODCAST': ContentFormat.PODCAST,
        'COURSE': ContentFormat.COURSE
      }
      updateData.format = formatMap[updateData.format] || ContentFormat.ARTICLE
    }

    // Si contentType (catégorie) est modifié
    if (updateData.contentType) {
      const contentTypeMap: { [key: string]: ContentType } = {
        'MEDITATION': ContentType.MEDITATION,
        'PRODUCTIVITY': ContentType.PRODUCTIVITY,
        'RELATIONSHIP': ContentType.RELATIONSHIP,
        'HEALTH': ContentType.HEALTH,
        'FINANCE': ContentType.FINANCE,
        'CAREER': ContentType.CAREER,
        'SPIRITUALITY': ContentType.SPIRITUALITY,
        'MINDSET': ContentType.MINDSET,
        'PARENTING': ContentType.PARENTING,
        'OTHER': ContentType.OTHER
      }
      updateData.contentType = contentTypeMap[updateData.contentType] || ContentType.OTHER
    }

    // Nettoyer les champs null pour keywords
    if (updateData.keywords === null) {
      updateData.keywords = undefined
    }

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      content
    })

  } catch (error: any) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
   
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Contenu supprimé'
    })

  } catch (error: any) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}