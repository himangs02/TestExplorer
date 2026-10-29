import React from 'react'
import { MathRenderer } from '@/components/MathRenderer'

export interface FormattedContentProps {
  content?: string | null
  className?: string
  imageClassName?: string
  inline?: boolean
}

export function FormattedContent({
  content,
  className = '',
  imageClassName = 'max-w-full max-h-96 w-auto h-auto object-contain rounded-xl my-3 border border-gray-200 shadow-md bg-white p-2 block',
  inline = false,
}: FormattedContentProps) {
  if (!content) return null

  // Tokenize text into text chunks and image chunks
  // Handles:
  // 1) Markdown: ![Alt Text](url)
  // 2) HTML: <img src="url" ... />
  // 3) Plain image paths/URLs: /uploads/... or http(s)://...png/jpg
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
    return `\n\n${key}\n\n`
  })

  // Replace HTML images
  workingText = workingText.replace(htmlImgRegex, (_, src) => {
    const key = `__IMG_TOKEN_${counter++}__`
    placeholderMap.set(key, { src: src.trim(), alt: 'Figure' })
    return `\n\n${key}\n\n`
  })

  // Replace standalone raw image URLs that are not part of other tags
  workingText = workingText.replace(rawUrlRegex, (rawUrl) => {
    const key = `__IMG_TOKEN_${counter++}__`
    placeholderMap.set(key, { src: rawUrl.trim(), alt: 'Figure' })
    return `\n\n${key}\n\n`
  })

  // Step 2: Split by image tokens so multi-line block math ($$ ... $$) remains intact
  const parts = workingText.split(/(__IMG_TOKEN_\d+__)/g)

  const Container = inline ? 'span' : 'div'

  return (
    <Container className={`formatted-content ${inline ? 'inline' : 'w-full'} ${className}`}>
      {parts.map((part, idx) => {
        const trimmed = part.trim()
        if (!trimmed) return null

        if (placeholderMap.has(trimmed)) {
          const imgInfo = placeholderMap.get(trimmed)!
          return (
            <span key={idx} className="block my-3 clear-both">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgInfo.src}
                alt={imgInfo.alt || 'Question Figure'}
                className={imageClassName}
                loading="eager"
              />
            </span>
          )
        }

        return (
          <MathRenderer
            key={idx}
            content={part}
            inline={inline}
          />
        )
      })}
    </Container>
  )
}

export default FormattedContent
