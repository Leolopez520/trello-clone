import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-200", // ✨ Título del mes claro
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent border-gray-700 text-gray-400 p-0 opacity-50 hover:opacity-100 hover:bg-gray-800 hover:text-gray-200", // ✨ Botones < > oscuros
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]", // ✨ Días de la semana (lu, ma, mi)
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-gray-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-gray-200 hover:bg-gray-800 hover:text-white aria-selected:opacity-100", // ✨ Días normales
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white", // ✨ Día seleccionado (Azul brillante)
        day_today: "bg-gray-800 text-white font-bold", // ✨ Día actual (Gris oscuro)
        day_outside:
          "day-outside text-gray-600 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-400 aria-selected:opacity-30", // ✨ Días del mes anterior/siguiente
        day_disabled: "text-gray-600 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-800 aria-selected:text-gray-200",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
