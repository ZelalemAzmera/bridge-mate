'use client'

import { useEffect } from 'react'

interface BridgeMateEmbedProps {
  apiUrl?: string
  lang?: string
}

export function BridgeMateEmbed({ apiUrl = '/api/v1', lang = 'am' }: BridgeMateEmbedProps) {
  useEffect(() => {
    // Load the script if not already loaded
    if (!document.getElementById('bridgemate-script')) {
      const script = document.createElement('script')
      script.id = 'bridgemate-script'
      script.src = '/bridgemate-plugin.js'
      script.async = true
      document.body.appendChild(script)
    }
    // The custom element auto-registers when script loads
  }, [])

  // Render using dangerouslySetInnerHTML to avoid React's unknown element warning
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<bridgemate-assistant api-url="${apiUrl}" lang="${lang}"></bridgemate-assistant>`,
      }}
    />
  )
}
