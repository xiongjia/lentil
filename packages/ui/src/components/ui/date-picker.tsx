import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  /** The selected date */
  date?: Date;
  /** Callback when a date is selected */
  onDateChange?: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** The date format string (date-fns format) */
  dateFormat?: string;
}

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  dateFormat = "PPP",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  function handleSelect(selected: Date | undefined) {
    onDateChange?.(selected);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            [
              // layout
              "w-[240px] justify-start text-left font-normal",
              // muted when no date
              !date && "text-muted-foreground",
            ],
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
DatePicker.displayName = "DatePicker";

export { DatePicker };
export type { DatePickerProps };
