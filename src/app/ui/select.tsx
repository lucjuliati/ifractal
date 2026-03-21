"use client"

import { useState, useRef, useEffect, useCallback } from "react"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  id?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  label,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [close])

  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const el = listboxRef.current.children[highlightedIndex] as HTMLElement
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [highlightedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    const enabledIndices = options
      .map((o, i) => (!o.disabled ? i : -1))
      .filter((i) => i !== -1)

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else if (highlightedIndex >= 0 && !options[highlightedIndex]?.disabled) {
          onChange?.(options[highlightedIndex].value)
          close()
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          const nextIdx = enabledIndices.find((i) => i > highlightedIndex)
          setHighlightedIndex(nextIdx ?? enabledIndices[0] ?? -1)
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (isOpen) {
          const prevIdx = [...enabledIndices].reverse().find((i) => i < highlightedIndex)
          setHighlightedIndex(prevIdx ?? enabledIndices[enabledIndices.length - 1] ?? -1)
        }
        break
      case "Escape":
        close()
        break
      case "Tab":
        close()
        break
    }
  }

  const selectId = id ?? "custom-select"
  const listboxId = `${selectId}-listbox`

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-foreground/70">
          {label}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={label ?? placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`
          flex w-full items-center justify-between rounded-md border px-4 py-2.5
          text-sm transition-all duration-200 outline-none
          bg-background border-foreground/15
          hover:border-foreground/30
          focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 bg-black/30
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${isOpen ? "border-foreground/40 ring-2 ring-foreground/10" : ""}
        `}>
        <span className={selectedOption ? "text-foreground" : "text-foreground/40"}>
          {selectedOption?.label ?? placeholder}
        </span>

        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          aria-label={label ?? placeholder}
          style={{background:"#101010"}}
          className={`
            absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-md border 
            border-foreground/15 bg-background p-1 shadow-lg shadow-foreground/5
            animate-in fade-in slide-in-from-top-1 duration-150
          `}>
          {options.map((option, i) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              onMouseEnter={() => !option.disabled && setHighlightedIndex(i)}
              onClick={() => {
                if (option.disabled) return
                onChange?.(option.value)
                close()
              }}
              className={`
                flex items-center rounded-md px-3 py-2 text-sm transition-colors
                ${option.disabled
                  ? "cursor-not-allowed text-foreground/25"
                  : "cursor-pointer"
                }
                ${i === highlightedIndex && !option.disabled
                  ? "bg-foreground/8 text-foreground"
                  : "text-foreground/70"
                }
                ${option.value === value && !option.disabled
                  ? "font-medium text-foreground"
                  : ""
                }
              `}>
              <span className="flex-1">{option.label}</span>
              {option.value === value && (
                <svg
                  className="h-4 w-4 shrink-0 text-foreground/50"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4-4a.75.75 0 011.06-1.06l3.366 3.365 7.506-9.875a.75.75 0 011.052-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
