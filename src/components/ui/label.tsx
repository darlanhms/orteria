import type { LabelHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-xs font-bold uppercase tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
