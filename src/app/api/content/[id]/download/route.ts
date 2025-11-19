// src/app/api/content/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params
    const session = await getServerSession(authOptions)

    if (!contentId) {
      return NextResponse.json({ error: 'ID du contenu manquant' }, { status: 400 })
    }

    // CORRECTION : Vérifier que l'utilisateur est connecté
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          error: 'Connexion requise',
          redirectUrl: `/auth/signin?callbackUrl=/content/${contentId}`
        },
        { status: 401 }
      )
    }

    // Récupérer le contenu
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        purchases: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!content) {
      return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 })
    }

    // CORRECTION : Vérifier l'accès (même pour le contenu gratuit, l'utilisateur doit être connecté)
    const hasPurchased = content.purchases && content.purchases.length > 0
    const isAdmin = session.user.role === 'ADMIN'
    const hasAccess = content.isFree || hasPurchased || isAdmin

    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Accès non autorisé',
          needsPurchase: !content.isFree,
          redirectUrl: `/content/${content.slug}`
        },
        { status: 403 }
      )
    }

    // Pour les articles, générer un HTML
    if (content.format === 'ARTICLE' && content.content) {
      const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.8;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        .excerpt {
            color: #666;
            font-style: italic;
            background: #f3f4f6;
            padding: 15px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
        }
        .content {
            margin-top: 30px;
        }
        p {
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <h1>${content.title}</h1>
    <div class="excerpt">${content.excerpt}</div>
    <hr>
    <div class="content">${content.content}</div>
</body>
</html>
      `
      
      // CORRECTION : Incrémenter les téléchargements
      await prisma.content.update({
        where: { id: contentId },
        data: { downloads: { increment: 1 } }
      })

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${content.slug}.html"`,
        },
      })
    }

    // Si pas de fileUrl, erreur
    if (!content.fileUrl) {
      return NextResponse.json(
        { error: 'Fichier non disponible pour ce contenu' },
        { status: 404 }
      )
    }

    // Déterminer si c'est un fichier local ou distant
    const isLocalFile = content.fileUrl.startsWith('/uploads/') || 
                       content.fileUrl.startsWith('./') ||
                       content.fileUrl.includes('localhost')

    if (isLocalFile) {
      // FICHIER LOCAL - Lire depuis le système de fichiers
      try {
        let filePath: string
        
        if (content.fileUrl.startsWith('/uploads/')) {
          // Chemin relatif depuis public/
          filePath = join(process.cwd(), 'public', content.fileUrl)
        } else if (content.fileUrl.includes('localhost')) {
          // URL localhost complète
          const urlPath = new URL(content.fileUrl).pathname
          filePath = join(process.cwd(), 'public', urlPath)
        } else {
          // Chemin relatif
          filePath = join(process.cwd(), content.fileUrl)
        }

        console.log('📁 Lecture du fichier local:', filePath)

        const fileBuffer = await readFile(filePath)
        
        if (fileBuffer.length === 0) {
          throw new Error('Fichier vide')
        }

        const contentType = getContentTypeFromFormat(content.format)
        const extension = getFileExtension(content.fileUrl) || getDefaultExtension(content.format)
        const filename = `${content.slug}${extension}`

        console.log('✅ Fichier lu avec succès, taille:', fileBuffer.length, 'bytes')

        // CORRECTION : Incrémenter le compteur de téléchargements
        await prisma.content.update({
          where: { id: contentId },
          data: { downloads: { increment: 1 } }
        })

        // Convertir Buffer en Uint8Array pour NextResponse
        const uint8Array = new Uint8Array(fileBuffer)

        return new NextResponse(uint8Array, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        })

      } catch (fsError: any) {
        console.error('❌ Erreur lecture fichier local:', fsError)
        return NextResponse.json(
          { 
            error: 'Fichier introuvable sur le serveur',
            details: fsError.message,
            path: content.fileUrl
          },
          { status: 404 }
        )
      }
    } else {
      // FICHIER DISTANT - Fetch depuis URL externe (Cloudinary, etc.)
      try {
        console.log('🌐 Téléchargement depuis URL distante:', content.fileUrl)

        const response = await fetch(content.fileUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        if (buffer.length === 0) {
          throw new Error('Fichier distant vide')
        }

        console.log('✅ Fichier distant téléchargé, taille:', buffer.length, 'bytes')

        const contentType = response.headers.get('content-type') || getContentTypeFromFormat(content.format)
        const extension = getFileExtension(content.fileUrl) || getDefaultExtension(content.format)
        const filename = `${content.slug}${extension}`

        // CORRECTION : Incrémenter le compteur de téléchargements
        await prisma.content.update({
          where: { id: contentId },
          data: { downloads: { increment: 1 } }
        })

        // Convertir Buffer en Uint8Array pour NextResponse
        const uint8Array = new Uint8Array(buffer)

        return new NextResponse(uint8Array, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length.toString(),
          },
        })

      } catch (fetchError: any) {
        console.error('❌ Erreur téléchargement distant:', fetchError)
        return NextResponse.json(
          { 
            error: 'Impossible de télécharger le fichier distant',
            details: fetchError.message,
            url: content.fileUrl
          },
          { status: 500 }
        )
      }
    }

  } catch (error: any) {
    console.error('❌ Erreur générale:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error.message
      },
      { status: 500 }
    )
  }
}

function getContentTypeFromFormat(format: string): string {
  const typeMap: { [key: string]: string } = {
    'ARTICLE': 'text/html',
    'EBOOK': 'application/pdf',
    'VIDEO': 'video/mp4',
    'AUDIO': 'audio/mpeg',
    'PODCAST': 'audio/mpeg',
    'COURSE': 'application/zip'
  }
  return typeMap[format] || 'application/octet-stream'
}

function getFileExtension(url: string): string {
  if (!url) return ''
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  return match ? `.${match[1]}` : ''
}

function getDefaultExtension(format: string): string {
  const extensionMap: { [key: string]: string } = {
    'ARTICLE': '.html',
    'EBOOK': '.pdf',
    'VIDEO': '.mp4',
    'AUDIO': '.mp3',
    'PODCAST': '.mp3',
    'COURSE': '.zip'
  }
  return extensionMap[format] || '.txt'
}