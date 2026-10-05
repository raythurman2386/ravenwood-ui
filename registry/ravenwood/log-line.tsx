import { cn } from "cn"

const levelClass = {
  debug: "text-muted-foreground",
  info: "text-moss-foreground",
  warn: "text-lantern-foreground",
  error: "text-rust-foreground",
} as const

type LogLevel = keyof typeof levelClass

function LogLine({
  className,
  time,
  level,
  message,
}: {
  className?: string
  time: string
  level: LogLevel
  message: string
}) {
  return (
    <p
      data-slot="log-line"
      data-level={level}
      className={cn(
        "grid grid-cols-[auto_3.5rem_1fr] gap-3 font-mono text-xs leading-5",
        className
      )}
    >
      <span className="text-muted-foreground">{time}</span>
      <span className={levelClass[level]}>{level}</span>
      <span className="min-w-0">{message}</span>
    </p>
  )
}

export { LogLine, type LogLevel }
