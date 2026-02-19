import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * On-demand revalidation API endpoint.
 * Called by Django admin when content is updated to refresh cached pages.
 *
 * POST /_internal/revalidate
 * Headers:
 *   x-revalidation-secret: <secret>
 * Body:
 *   { "paths": ["/", "/products"], "tags": ["homepage"] }
 */

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET

export async function POST(request: NextRequest) {
  // Verify secret token
  const secret = request.headers.get('x-revalidation-secret')

  if (!REVALIDATION_SECRET) {
    console.error('REVALIDATION_SECRET not configured')
    return NextResponse.json(
      { error: 'Revalidation not configured' },
      { status: 500 }
    )
  }

  if (secret !== REVALIDATION_SECRET) {
    console.warn('Invalid revalidation secret received')
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { paths = [], tags = [] } = body as {
      paths?: string[]
      tags?: string[]
    }

    const revalidated: { paths: string[]; tags: string[] } = {
      paths: [],
      tags: [],
    }

    // Revalidate specific paths
    for (const path of paths) {
      try {
        revalidatePath(path)
        revalidated.paths.push(path)
        console.log(`Revalidated path: ${path}`)
      } catch (e) {
        console.error(`Failed to revalidate path ${path}:`, e)
      }
    }

    // Revalidate cache tags
    for (const tag of tags) {
      try {
        revalidateTag(tag, 'max')
        revalidated.tags.push(tag)
        console.log(`Revalidated tag: ${tag}`)
      } catch (e) {
        console.error(`Failed to revalidate tag ${tag}:`, e)
      }
    }

    // If no specific paths/tags provided, revalidate homepage by default
    if (paths.length === 0 && tags.length === 0) {
      revalidatePath('/')
      revalidated.paths.push('/')
      console.log('Revalidated homepage (default)')
    }

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(error) },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    configured: !!REVALIDATION_SECRET,
  })
}
