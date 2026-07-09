import * as React from "react"
import flatpickr from "flatpickr"
import "flatpickr/dist/themes/dark.css"
import { format, addDays, isValid } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface DateRangePickerProps {
  start?: string
  end?: string
  onChange: (start: string, end: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  start,
  end,
  onChange,
  placeholder,
  disabled,
  className,
}: DateRangePickerProps) {
  const { t } = useTranslation()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fpRef = React.useRef<flatpickr.Instance | null>(null)
  const presetsInjectedRef = React.useRef(false)

  const startDate = start ? new Date(start + "T00:00:00") : undefined
  const endDate = end ? new Date(end + "T00:00:00") : undefined
  const validStart = startDate && isValid(startDate) ? startDate : undefined
  const validEnd = endDate && isValid(endDate) ? endDate : undefined

  const displayLabel = validStart
    ? validEnd
      ? `${format(validStart, "MMM d")} - ${format(validEnd, "MMM d, yyyy")}`
      : `${format(validStart, "MMM d, yyyy")} - ...`
    : placeholder || t("common.selectDateRange", "Select date range")

  const openPicker = () => {
    if (!disabled) inputRef.current?.focus()
  }

  React.useEffect(() => {
    if (!inputRef.current || fpRef.current) return

    const initialDate =
      validStart && validEnd
        ? [validStart, validEnd]
        : validStart
          ? validStart
          : undefined

    const fp = flatpickr(inputRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      defaultDate: initialDate,
      disableMobile: true,
      clickOpens: true,
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length === 2) {
          const [s, e] = selectedDates
          onChange(format(s, "yyyy-MM-dd"), format(e, "yyyy-MM-dd"))
          fp.close()
        }
      },
      onReady: (_a, _b, instance) => {
        if (presetsInjectedRef.current) return
        presetsInjectedRef.current = true

        const presets = [
          {
            label: "Today",
            getValue: () => {
              const d = new Date()
              return { start: d, end: d }
            },
          },
          {
            label: "Tomorrow",
            getValue: () => {
              const d = addDays(new Date(), 1)
              return { start: d, end: d }
            },
          },
          {
            label: "This Weekend",
            getValue: () => {
              const nextSat = addDays(
                new Date(),
                (6 - new Date().getDay() + 7) % 7 || 7
              )
              return { start: nextSat, end: addDays(nextSat, 1) }
            },
          },
          {
            label: "Next 3 Days",
            getValue: () => {
              const d = new Date()
              return { start: d, end: addDays(d, 2) }
            },
          },
        ]

        const bar = document.createElement("div")
        bar.className =
          "flex items-center gap-1 border-b border-[hsl(var(--border))] p-2 flex-wrap"
        bar.innerHTML = presets
          .map(
            (p) =>
              `<button type="button" data-fp-preset="${p.label}" class="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--accent))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer">${p.label}</button>`
          )
          .join("")

        bar.addEventListener("click", (e) => {
          const target = (e.target as HTMLElement).closest("[data-fp-preset]")
          if (!target) return
          const label = target.getAttribute("data-fp-preset")
          const preset = presets.find((p) => p.label === label)
          if (!preset) return
          const { start: s2, end: e2 } = preset.getValue()
          onChange(format(s2, "yyyy-MM-dd"), format(e2, "yyyy-MM-dd"))
          instance.setDate([s2, e2], false)
          instance.close()
        })

        instance.calendarContainer.prepend(bar)
      },
    })

    fpRef.current = fp

    return () => {
      fp.destroy()
      fpRef.current = null
      presetsInjectedRef.current = false
    }
  }, [])

  React.useEffect(() => {
    if (fpRef.current) {
      fpRef.current.set("clickOpens", !disabled)
    }
  }, [disabled])

  React.useEffect(() => {
    if (!fpRef.current) return
    if (validStart && validEnd) {
      fpRef.current.setDate([validStart, validEnd], false)
    } else if (validStart) {
      fpRef.current.setDate(validStart, false)
    } else {
      fpRef.current.clear(false)
    }
  }, [start, end])

  const hasValue = validStart || validEnd

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
          "w-full cursor-pointer bg-card border border-border rounded-xl py-2 pl-9 pr-8 text-sm text-left",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
          "transition-colors hover:border-muted-foreground/30",
          disabled && "opacity-50 cursor-not-allowed hover:border-border",
          !hasValue && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <span className="truncate">
          {displayLabel}
        </span>
      </button>
      {hasValue && !disabled && (
        <span
          role="button"
          tabIndex={-1}
          aria-label={t("common.clear")}
          onClick={(e) => {
            e.stopPropagation()
            onChange("", "")
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
