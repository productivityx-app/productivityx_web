import * as React from "react"
import flatpickr from "flatpickr"
import "flatpickr/dist/themes/dark.css"
import { Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  use24Hour?: boolean
  showQuickActions?: boolean
}

function formatDisplay(value: string, use24: boolean): string {
  const [h, m] = value.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return value
  if (use24) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`
}

export function TimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  use24Hour = true,
  showQuickActions = true,
}: TimePickerProps) {
  const { t } = useTranslation()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fpRef = React.useRef<flatpickr.Instance | null>(null)
  const quickActionsInjectedRef = React.useRef(false)

  const displayLabel = value ? formatDisplay(value, use24Hour) : ""

  const openPicker = () => {
    if (!disabled) inputRef.current?.focus()
  }

  React.useEffect(() => {
    if (!inputRef.current || fpRef.current) return

    const fp = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      defaultDate: value || undefined,
      disableMobile: true,
      clickOpens: true,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates[0]) {
          const d = selectedDates[0]
          const h = d.getHours().toString().padStart(2, "0")
          const m = d.getMinutes().toString().padStart(2, "0")
          onChange(`${h}:${m}`)
          fp.close()
        }
      },
      onReady: (_a, _b, instance) => {
        if (!showQuickActions || quickActionsInjectedRef.current) return
        quickActionsInjectedRef.current = true

        const bar = document.createElement("div")
        bar.className =
          "flex items-center gap-1 border-b border-[hsl(var(--border))] p-2"
        bar.innerHTML = `
          <button type="button" data-fp-action="now" class="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--accent))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer">${t("common.now", "Now")}</button>
          <button type="button" data-fp-action="clear" class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)-/10)] transition-colors cursor-pointer">${t("common.clear")}</button>
        `

        bar.addEventListener("click", (e) => {
          const target = (e.target as HTMLElement).closest("[data-fp-action]")
          if (!target) return
          const act = target.getAttribute("data-fp-action")
          if (act === "now") {
            const now = new Date()
            const h = now.getHours().toString().padStart(2, "0")
            const m = now.getMinutes().toString().padStart(2, "0")
            onChange(`${h}:${m}`)
            instance.close()
          } else if (act === "clear") {
            onChange("")
            instance.clear()
            instance.close()
          }
        })

        instance.calendarContainer.prepend(bar)
      },
    })

    fpRef.current = fp

    return () => {
      fp.destroy()
      fpRef.current = null
      quickActionsInjectedRef.current = false
    }
  }, [])

  React.useEffect(() => {
    if (fpRef.current) {
      fpRef.current.set("clickOpens", !disabled)
    }
  }, [disabled])

  React.useEffect(() => {
    if (!fpRef.current) return
    if (value) {
      fpRef.current.setDate(new Date(`2000-01-01T${value}:00`), false)
    } else {
      fpRef.current.clear(false)
    }
  }, [value])

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        className={cn(
          "w-full cursor-pointer bg-card border border-border rounded-xl py-2 pl-9 pr-8 text-sm text-left tabular-nums",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
          "transition-colors hover:border-muted-foreground/30",
          disabled && "opacity-50 cursor-not-allowed hover:border-border",
          !value && "text-muted-foreground"
        )}
      >
        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <span className="truncate">
          {displayLabel || placeholder || t("common.selectTime")}
        </span>
      </button>
      {value && !disabled && (
        <span
          role="button"
          tabIndex={-1}
          aria-label={t("common.clear")}
          onClick={(e) => {
            e.stopPropagation()
            onChange("")
            fpRef.current?.clear()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}

export { TimePicker as RadialTimePicker }
