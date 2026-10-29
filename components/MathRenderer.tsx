'use client'

import React, { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export interface MathRendererProps {
  content?: string | null
  children?: React.ReactNode
  className?: string
  inline?: boolean
}

export function MathRenderer({
  content,
  children,
  className = '',
  inline = false,
}: MathRendererProps) {
  const rawText = content ?? (typeof children === 'string' ? children : '')

  if (!rawText || (typeof rawText === 'string' && !rawText.trim())) {
    return null
  }

  const stringContent = typeof rawText === 'string' ? rawText : String(rawText)

  // Custom component mappings to prevent invalid HTML nesting
  // (e.g. <p> inside <button> or <span> causing hydration mismatches)
  const components: Partial<Components> = {
    p: (allProps: ComponentPropsWithoutRef<'p'> & { node?: unknown }) => {
      const { node: _node, children: pChildren, ...props } = allProps
      void _node
      if (inline) {
        return (
          <span className="inline" {...props}>
            {pChildren}
          </span>
        )
      }
      return (
        <span className="block leading-relaxed my-1 first:mt-0 last:mb-0" {...props}>
          {pChildren}
        </span>
      )
    },
    img: (allProps: ComponentPropsWithoutRef<'img'> & { node?: unknown }) => {
      const { node: _node, ...props } = allProps
      void _node
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...props}
          alt={props.alt || ''}
          className="max-w-full max-h-96 w-auto h-auto object-contain rounded-xl my-3 border border-gray-200 shadow-md bg-white p-2 block"
          loading="eager"
        />
      )
    },
  }

  const Container = inline ? 'span' : 'div'

  return (
    <Container className={`math-renderer ${inline ? 'inline' : 'w-full'} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={components}
      >
        {stringContent}
      </ReactMarkdown>
    </Container>
  )
}

export default MathRenderer
