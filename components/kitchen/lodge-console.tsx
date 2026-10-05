"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlayIcon, ScrollTextIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/site/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Banner } from "@/registry/ravenwood/banner"
import { Callout } from "@/registry/ravenwood/callout"
import { CopyButton } from "@/registry/ravenwood/copy-button"
import { DataList, DataListItem } from "@/registry/ravenwood/data-list"
import { EmptyPanel } from "@/registry/ravenwood/empty-panel"
import { Field } from "@/registry/ravenwood/field"
import { HollowInput } from "@/registry/ravenwood/hollow-input"
import { LogLine, type LogLevel } from "@/registry/ravenwood/log-line"
import { Metric } from "@/registry/ravenwood/metric"
import { PageShell } from "@/registry/ravenwood/page-shell"
import { Progress } from "@/registry/ravenwood/progress"
import { SectionHeader } from "@/registry/ravenwood/section-header"
import { Spinner } from "@/registry/ravenwood/spinner"
import {
  StatusDot,
  type StatusDotStatus,
} from "@/registry/ravenwood/status-dot"
import { Timeline, TimelineItem } from "@/registry/ravenwood/timeline"

const runs: Array<{
  id: string
  name: string
  status: StatusDotStatus
  when: string
}> = [
  { id: "run_18f", name: "deploy", status: "running", when: "now" },
  { id: "run_18e", name: "sync", status: "ok", when: "2m ago" },
  { id: "run_18d", name: "backup", status: "warn", when: "1h ago" },
  { id: "run_18c", name: "index", status: "error", when: "3h ago" },
  { id: "run_18b", name: "lint", status: "idle", when: "5h ago" },
]

const logs: Array<{ time: string; level: LogLevel; message: string }> = [
  { time: "14:02:11", level: "info", message: "Last sync 2m ago" },
  { time: "14:02:08", level: "warn", message: "Retrying deploy" },
  { time: "14:01:40", level: "error", message: "Index failed" },
  { time: "13:58:02", level: "debug", message: "Worker idle" },
]

const statusLabel: Record<StatusDotStatus, string> = {
  idle: "Idle",
  running: "Running",
  ok: "Ok",
  warn: "Warn",
  error: "Error",
}

function LodgeConsole() {
  const router = useRouter()
  const [hash, setHash] = React.useState("runs")
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [runOpen, setRunOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [nameError, setNameError] = React.useState<string>()
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const read = () => setHash(window.location.hash.replace("#", "") || "runs")
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  const items = [
    {
      title: "Runs",
      href: "/kitchen#runs",
      icon: PlayIcon,
      active: hash === "runs",
    },
    {
      title: "Logs",
      href: "/kitchen#logs",
      icon: ScrollTextIcon,
      active: hash === "logs",
    },
  ]

  const filteredLogs = logs.filter((line) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return true
    return (
      line.message.toLowerCase().includes(needle) ||
      line.level.includes(needle) ||
      line.time.includes(needle)
    )
  })

  function submitRun(kind: "save" | "run") {
    const next = name.trim()
    if (next.length < 2) {
      setNameError("Enter a name.")
      return
    }
    toast.success(kind === "save" ? `Saved ${next}.` : `Started ${next}.`)
    setRunOpen(false)
    setName("")
    setNameError(undefined)
  }

  return (
    <PageShell title="Runs" items={items}>
      <Banner tone="lantern">Deploy is running. Last sync 2m ago.</Banner>
      <div className="flex min-w-0 flex-col gap-6 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Breadcrumb className="mr-auto min-w-0">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">North Cabin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Runs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              className="max-sm:size-11 max-sm:px-0"
              aria-label="Filter logs"
              onClick={() => setCommandOpen(true)}
            >
              <SearchIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Filter logs</span>
            </Button>
            <ThemeToggle className="size-11 md:size-9" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/55 focus-visible:outline-none md:size-auto"
                  aria-label="Account"
                >
                  <Avatar>
                    <AvatarFallback>NC</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/docs">Docs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <section id="runs" className="grid gap-4">
          <SectionHeader
            title="Runs"
            description="Last sync 2m ago."
            action={<Button onClick={() => setRunOpen(true)}>Run</Button>}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              label="Runs today"
              value="18"
              delta="+3"
              hint="Since midnight"
            />
            <Metric label="Queue" value="1" hint="deploy" />
            <Metric label="Failed" value="2" />
          </div>
          <div className="grid max-w-md gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Spinner />
              <span>Deploy</span>
            </div>
            <Progress value={64} aria-label="Deploy progress" />
          </div>
          <Callout variant="warning">Index failed on the last attempt.</Callout>
          <Tabs defaultValue="all">
            <TabsList variant="line">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="pt-3">
              <div className="min-w-0 overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run</TableHead>
                      <TableHead>When</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">
                        <span className="sr-only">Copy</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>{run.name}</TableCell>
                        <TableCell>{run.when}</TableCell>
                        <TableCell>
                          <StatusDot
                            status={run.status}
                            label={statusLabel[run.status]}
                          />
                        </TableCell>
                        <TableCell>
                          <CopyButton text={run.id} label={`Copy ${run.id}`} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="pinned" className="pt-3">
              <div className="rounded-xl border border-border">
                <EmptyPanel
                  title="No runs yet"
                  description="Pin a run to keep it here."
                  action={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRunOpen(true)}
                    >
                      Run
                    </Button>
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="grid gap-3">
            <h2 className="text-2xl">Latest</h2>
            <Timeline>
              <TimelineItem status="running" title="Deploy" meta="14:02">
                Still running.
              </TimelineItem>
              <TimelineItem status="ok" title="Sync" meta="14:00">
                Finished.
              </TimelineItem>
              <TimelineItem status="warn" title="Backup" meta="13:12">
                Took longer than usual.
              </TimelineItem>
              <TimelineItem status="error" title="Index" meta="12:04">
                Exited with an error.
              </TimelineItem>
            </Timeline>
            <DataList>
              <DataListItem term="Environment">Production</DataListItem>
              <DataListItem term="Run" mono>
                run_18f
              </DataListItem>
              <DataListItem term="Status">Running</DataListItem>
            </DataList>
          </section>

          <section id="logs" className="grid gap-3">
            <h2 className="text-2xl">Logs</h2>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter logs"
              aria-label="Filter logs"
            />
            {filteredLogs.length === 0 ? (
              <div className="rounded-xl border border-border">
                <EmptyPanel
                  title="No matching logs"
                  description="Try another filter."
                />
              </div>
            ) : (
              <div className="grid gap-1 rounded-xl border border-border p-3">
                {filteredLogs.map((line) => (
                  <LogLine key={`${line.time}-${line.level}`} {...line} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Dialog
        open={runOpen}
        onOpenChange={(open) => {
          setRunOpen(open)
          if (!open) setNameError(undefined)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New run</DialogTitle>
            <DialogDescription>
              Starts immediately, or saves the name.
            </DialogDescription>
          </DialogHeader>
          <Field
            label="Name"
            htmlFor="run-name"
            hint={nameError ? undefined : "Shown in the list."}
            error={nameError}
          >
            <HollowInput
              id="run-name"
              value={name}
              placeholder="sync"
              aria-invalid={nameError ? true : undefined}
              onChange={(event) => {
                setName(event.target.value)
                if (nameError) setNameError(undefined)
              }}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => submitRun("save")}
            >
              Save
            </Button>
            <Button type="button" onClick={() => submitRun("run")}>
              Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command>
          <CommandInput placeholder="Filter logs" />
          <CommandList>
            <CommandEmpty>No matching logs.</CommandEmpty>
            <CommandGroup heading="Jump">
              <CommandItem
                onSelect={() => {
                  window.location.hash = "runs"
                  setCommandOpen(false)
                }}
              >
                Runs
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  window.location.hash = "logs"
                  setCommandOpen(false)
                }}
              >
                Logs
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/docs")
                  setCommandOpen(false)
                }}
              >
                Docs
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </PageShell>
  )
}

export { LodgeConsole }
