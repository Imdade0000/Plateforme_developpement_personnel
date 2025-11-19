// src/hooks/useContentView.ts
"use client"

import { useEffect } from 'react'

type GlobalSent = Record<string, 'pending' | 'sent' | undefined>

function getGlobalSent(): GlobalSent {
  const g = (globalThis as any)
  if (!g.__contentViewSent) g.__contentViewSent = {}
  return g.__contentViewSent as GlobalSent
}

export default function useContentView(contentId?: string, hasAccess?: boolean, userId?: string) {
  useEffect(() => {
    if (!contentId || !hasAccess || !userId) return

    const globalSent = getGlobalSent()
    // If already fully sent, skip
    if (globalSent[contentId] === 'sent') return
    // If already pending (another concurrent send in-flight), skip
    if (globalSent[contentId] === 'pending') return

  let didCancel = false
  let timeoutId: any = null

    const sendView = async () => {
      try {
        // mark pending immediately to avoid concurrent requests
        globalSent[contentId] = 'pending'
        // clear pending after 30s in case the request hangs
        timeoutId = setTimeout(() => {
          const g2 = getGlobalSent()
          if (g2[contentId] === 'pending') delete g2[contentId]
        }, 30000)

        const res = await fetch(`/api/content/${contentId}/view`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, contentId }),
        })

        const text = await res.text().catch(() => '')
        if (res.ok) {
          // mark as sent globally even if the component unmounted during the request
          globalSent[contentId] = 'sent'
          console.log(`useContentView: view registered for ${contentId}`, res.status, text)
          if (timeoutId) clearTimeout(timeoutId)
        } else {
          // clear pending so future attempts can retry
          delete globalSent[contentId]
          if (timeoutId) clearTimeout(timeoutId)
          if (res.status === 401 || res.status === 403) {
            console.warn('useContentView: auth error while registering view', res.status, text)
          } else {
            console.warn('useContentView: failed to register view', res.status, text)
          }
        }
      } catch (err) {
        // clear pending so future attempts can retry
        const globalAgain = getGlobalSent()
        delete globalAgain[contentId]
        if (timeoutId) clearTimeout(timeoutId)
        console.error('useContentView: error registering view', err)
      }
    }

    sendView()

    return () => {
      didCancel = true
      // do NOT delete the pending flag on unmount (avoids double-send in React Strict Mode)
      // allow the pending timeout to clear it if the request hangs
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [contentId, hasAccess, userId])
}
