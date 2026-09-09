import React from 'react'

interface FormattedContentProps {
  content?: string | null
  className?: string
  imageClassName?: string
}

export function FormattedContent({
  content,
  className = '',
  imageClassName = 'max-w-full max-h-96 w-auto h-auto object-contain rounded-xl my-3 border border-gray-200 shadow-md bg-white p-2 block'
}: FormattedContentProps) {
  if (!content) return null

  // Tokenize text into text chunks and image chunks
  // Handles:
  // 1) Markdown: ![Alt Text](url)
  // 2) HTML: <img src="url" ... />
  // 3) Plain image paths/URLs: /uploads/... or http(s)://...png/jpg
  const tokens: { type: 'text' | 'image'; text?: string; src?: string; alt?: string }[] = []
  
  const markdownImgRegex = /!\[(.*?)\]\((.+?)\)/gi
  const htmlImgRegex = /<img\b[^>]*src=['"]([^'"]+)['"][^>]*>/gi
  const rawUrlRegex = /((?:https?:\/\/[^\s"'<>]+|\/uploads\/[^\s"'<>]+)\.(?:png|jpg|jpeg|webp|gif|svg|PNG|JPG|JPEG|WEBP|GIF|SVG)(?:\?[^\s"'<>]*)?)/gi

  // Step 1: Replace markdown and HTML images with unique placeholders
  let workingText = content
  const placeholderMap = new Map<string, { src: string; alt: string }>()
  let counter = 0

  // Replace Markdown images
  workingText = workingText.replace(markdownImgRegex, (_, alt, src) => {
    const key = `__IMG_TOKEN_${counter++}__`
    placeholderMap.set(key, { src: src.trim(), alt: alt.trim() || 'Figure' })
    return `\n${key}\n`
  })

  // Replace HTML images
  workingText = workingText.replace(htmlImgRegex, (_, src) => {
    const key = `__IMG_TOKEN_${counter++}__`
    placeholderMap.set(key, { src: src.trim(), alt: 'Figure' })
    return `\n${key}\n`
  })

  // Replace standalone raw image URLs that are not part of other tags
  workingText = workingText.replace(rawUrlRegex, (rawUrl) => {
    const key = `__IMG_TOKEN_${counter++}__`
    placeholderMap.set(key, { src: rawUrl.trim(), alt: 'Figure' })
    return `\n${key}\n`
  })

  // Step 2: Split by newline and tokens
  const lines = workingText.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      // Empty line -> add spacing if previous token was text
      if (tokens.length > 0 && tokens[tokens.length - 1].type === 'text') {
        tokens.push({ type: 'text', text: '\n' })
      }
      continue
    }

    if (placeholderMap.has(line)) {
      const imgInfo = placeholderMap.get(line)!
      tokens.push({ type: 'image', src: imgInfo.src, alt: imgInfo.alt })
    } else {
      // Check if line contains a placeholder inside
      let foundPlaceholder = false
      for (const [key, imgInfo] of placeholderMap.entries()) {
        if (line.includes(key)) {
          foundPlaceholder = true
          const parts = line.split(key)
          for (let p = 0; p < parts.length; p++) {
            if (parts[p]) {
              tokens.push({ type: 'text', text: parts[p] })
            }
            if (p < parts.length - 1) {
              tokens.push({ type: 'image', src: imgInfo.src, alt: imgInfo.alt })
            }
          }
          break
        }
      }

      if (!foundPlaceholder) {
        tokens.push({ type: 'text', text: line })
      }
    }
  }

  return (
    <div className={`formatted-content w-full ${className}`}>
      {tokens.map((token, idx) => {
        if (token.type === 'image' && token.src) {
          return (
            <span key={idx} className="block my-3 clear-both">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={token.src}
                alt={token.alt || 'Question Figure'}
                className={imageClassName}
                loading="eager"
              />
            </span>
          )
        }

        if (token.text === '\n') {
          return <br key={idx} />
        }

        return (
          <span key={idx} className="inline leading-relaxed">
            {token.text}{' '}
          </span>
        )
      })}
    </div>
  )
}

export default FormattedContent
