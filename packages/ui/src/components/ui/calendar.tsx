import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../../lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        [
          // layout
          "p-3",
        ],
        className,
      )}
      classNames={{
        // root
        root: "w-fit",
        // months wrapper
        months: "relative flex flex-col gap-4 sm:flex-row",
        // month grid
        month_grid: "w-full border-collapse space-y-1",
        // caption
        month_caption: "flex h-7 items-center justify-center",
        // caption label
        caption_label: "text-sm font-medium",
        // navigation
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        // nav buttons
        button_previous: cn(
          "inline-flex items-center justify-center rounded-md",
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute left-1",
        ),
        button_next: cn(
          "inline-flex items-center justify-center rounded-md",
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute right-1",
        ),
        // weekdays
        weekdays: "flex",
        weekday:
          "w-8 text-[0.8rem] font-normal text-muted-foreground rounded-md",
        // week
        week: "mt-2 flex w-full",
        // day button
        day_button: cn(
          // layout
          "h-8 w-8 p-0 font-normal",
          // shape
          "rounded-md",
          // focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // interaction
          "hover:bg-accent hover:text-accent-foreground",
        ),
        // states
        selected: cn(
          "bg-primary text-primary-foreground",
          "hover:bg-primary hover:text-primary-foreground",
        ),
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "rounded-none bg-accent text-accent-foreground",
        range_start: "rounded-l-md bg-primary text-primary-foreground",
        range_end: "rounded-r-md bg-primary text-primary-foreground",
        hidden: "invisible",
        // chevron
        chevron: "h-4 w-4",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
