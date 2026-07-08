import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "react-i18next"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromYear?: number
  toYear?: number
}

export function DatePicker({ value, onChange, placeholder, disabled, className, fromYear, toYear }: DatePickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const date = value ? new Date(value + "T00:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal gap-2",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {date ? format(date, "MMM d, yyyy") : placeholder || t("common.selectDate")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout={fromYear && toYear ? "dropdown" : "label"}
        />
      </PopoverContent>
    </Popover>
  )
}

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  use24Hour?: boolean
}

export function TimePicker({ value, onChange, placeholder, disabled, className, use24Hour = true }: TimePickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const minutes = value ? parseInt(value.split(":")[1], 10) : 0
  const hours = value ? parseInt(value.split(":")[0], 10) : 0
  const isPM = hours >= 12
  const displayHour = use24Hour ? hours : (hours % 12 || 12)

  const [selHour, setSelHour] = React.useState(displayHour)
  const [selMinute, setSelMinute] = React.useState(minutes)
  const [selAmPm, setSelAmPm] = React.useState(isPM ? "PM" : "AM")

  React.useEffect(() => {
    if (open) {
      setSelHour(displayHour)
      setSelMinute(minutes)
      setSelAmPm(isPM ? "PM" : "AM")
    }
  }, [open])

  const handleConfirm = () => {
    let h = selHour
    if (!use24Hour) {
      if (selAmPm === "PM" && selHour !== 12) h = selHour + 12
      else if (selAmPm === "AM" && selHour === 12) h = 0
    }
    onChange(`${h.toString().padStart(2, "0")}:${selMinute.toString().padStart(2, "0")}`)
    setOpen(false)
  }

  const hoursList = use24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1)

  const hourRef = React.useRef<HTMLDivElement>(null)
  const minuteRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        hourRef.current?.scrollIntoView({ behavior: "auto", block: "center" })
        minuteRef.current?.scrollIntoView({ behavior: "auto", block: "center" })
      }, 10)
    }
  }, [open])

  const displayLabel = value
    ? use24Hour
      ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      : `${displayHour}:${minutes.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`
    : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal gap-2",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {displayLabel || placeholder || t("common.selectTime")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-start gap-0 p-3 pb-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              {t("common.hour")}
            </span>
            <div className="h-48 overflow-hidden relative w-14">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-accent/50 rounded-md pointer-events-none z-10 border-y border-border/50" />
              <ScrollArea className="h-full">
                <div className="flex flex-col py-[72px] items-center">
                  {hoursList.map((h) => (
                    <div key={h} ref={selHour === h ? hourRef : undefined}>
                      <button
                        type="button"
                        onClick={() => setSelHour(h)}
                        className={cn(
                          "h-8 w-12 text-sm transition-colors rounded-md",
                          selHour === h
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {h.toString().padStart(2, "0")}
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <span className="text-lg font-medium text-foreground mt-8 px-0.5">:</span>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              {t("common.minute")}
            </span>
            <div className="h-48 overflow-hidden relative w-14">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-accent/50 rounded-md pointer-events-none z-10 border-y border-border/50" />
              <ScrollArea className="h-full">
                <div className="flex flex-col py-[72px] items-center">
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <div key={m} ref={selMinute === m ? minuteRef : undefined}>
                      <button
                        type="button"
                        onClick={() => setSelMinute(m)}
                        className={cn(
                          "h-8 w-12 text-sm transition-colors rounded-md",
                          selMinute === m
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {m.toString().padStart(2, "0")}
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          {!use24Hour && (
            <div className="flex flex-col items-center ml-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">&nbsp;</span>
              <div className="flex flex-col gap-1 mt-[72px]">
                {["AM", "PM"].map((ap) => (
                  <button
                    key={ap}
                    type="button"
                    onClick={() => setSelAmPm(ap)}
                    className={cn(
                      "w-10 h-8 rounded-md text-xs font-semibold transition-colors",
                      selAmPm === ap
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {ap}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border p-2 flex justify-end">
          <Button size="sm" onClick={handleConfirm}>
            {t("common.confirm")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
