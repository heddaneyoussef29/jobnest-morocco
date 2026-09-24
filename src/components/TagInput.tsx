import { useState, useRef, KeyboardEvent } from 'react'

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  hint?: string
}

export default function TagInput({ value, onChange, placeholder = 'اكتب الكلمة واضغط Enter', label, hint }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed]
      onChange(newTags.join(', '))
    }
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove)
    onChange(newTags.join(', '))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div 
        className="flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 min-h-[48px] cursor-text transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
          >
            <span># {tag}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-emerald-200 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue) }}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
          placeholder={tags.length === 0 ? placeholder : 'أضف كلمة أخرى...'}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
    </div>
  )
}
