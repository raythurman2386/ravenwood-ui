import { cn } from "cn"

import { Kbd } from "./kbd"

function ShortcutHint({
  className,
  label,
  keys,
}: {
  className?: string
  label: string
  keys: string[]
}) {
  return (
    <span
      data-slot="shortcut-hint"
      className={cn(
        "inline-flex min-w-0 items-center justify-between gap-3",
        className
      )}
    >
      <span className="truncate">{label}</span>
      <span className="inline-flex shrink-0 items-center gap-1">
        {keys.map((key, index) => (
          <Kbd key={`${key}-${index}`}>{key}</Kbd>
        ))}
      </span>
    </span>
  )
}

export { ShortcutHint }
