import { useRef } from 'react'
import { Bold, Italic, Heading2, List, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}

/**
 * Lightweight markdown editor: a plain textarea plus a toolbar that wraps the
 * current selection with markdown syntax. Keeps the bundle small while still
 * giving admins basic formatting controls for blog content.
 */
export function RichTextEditor({ value, onChange, rows = 14, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wrapSelection = (before: string, after = before) => {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart, selectionEnd } = el
    const selected = value.slice(selectionStart, selectionEnd)
    const next = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(selectionStart + before.length, selectionEnd + before.length)
    })
  }

  const tools = [
    { icon: Bold, label: 'Bold', action: () => wrapSelection('**') },
    { icon: Italic, label: 'Italic', action: () => wrapSelection('_') },
    { icon: Heading2, label: 'Heading', action: () => wrapSelection('\n## ', '') },
    { icon: List, label: 'List item', action: () => wrapSelection('\n- ', '') },
    { icon: Link2, label: 'Link', action: () => wrapSelection('[', '](https://)') },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-black/10">
      <div className="flex gap-1 border-b border-black/10 bg-surface-light p-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.label}
            onClick={tool.action}
            className={cn('rounded-lg p-2 text-ink/70 hover:bg-white hover:text-primary')}
          >
            <tool.icon size={16} />
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y px-4 py-3 text-sm text-ink outline-none"
      />
    </div>
  )
}
