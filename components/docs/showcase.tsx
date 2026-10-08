"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Leaf, PlayIcon, TriangleAlertIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Banner } from "@/registry/ravenwood/banner"
import { Callout } from "@/registry/ravenwood/callout"
import { CopyButton } from "@/registry/ravenwood/copy-button"
import { DataList, DataListItem } from "@/registry/ravenwood/data-list"
import { EmptyPanel } from "@/registry/ravenwood/empty-panel"
import { Field } from "@/registry/ravenwood/field"
import { ForestCard } from "@/registry/ravenwood/forest-card"
import {
  GroveAlert,
  GroveAlertDescription,
  GroveAlertIcon,
  GroveAlertTitle,
} from "@/registry/ravenwood/grove-alert"
import { HollowInput } from "@/registry/ravenwood/hollow-input"
import { Item } from "@/registry/ravenwood/item"
import { Kbd } from "@/registry/ravenwood/kbd"
import { LogLine } from "@/registry/ravenwood/log-line"
import { Metric } from "@/registry/ravenwood/metric"
import { Progress } from "@/registry/ravenwood/progress"
import { RavenEmptyState } from "@/registry/ravenwood/raven-empty-state"
import { RavenMark } from "@/registry/ravenwood/raven-mark"
import { SectionHeader } from "@/registry/ravenwood/section-header"
import { ShortcutHint } from "@/registry/ravenwood/shortcut-hint"
import { Slider } from "@/registry/ravenwood/slider"
import { Spinner } from "@/registry/ravenwood/spinner"
import { StatusDot } from "@/registry/ravenwood/status-dot"
import { Timeline, TimelineItem } from "@/registry/ravenwood/timeline"
import { Toggle } from "@/registry/ravenwood/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/registry/ravenwood/toggle-group"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const CarouselDemo = dynamic(
  () => import("@/components/docs/demos/carousel").then((m) => m.CarouselDemo),
  { loading: () => <Skeleton className="mx-auto h-48 w-full max-w-sm" /> }
)

function ReducedMotionPreview() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scoped, setScoped] = React.useState(false)
  const reduce = useReducedMotion(ref)

  return (
    <div className={scoped ? "motion-reduce" : undefined}>
      <div ref={ref} className="flex flex-wrap items-center gap-3 text-sm">
        <Badge variant={reduce ? "secondary" : "outline"}>
          {reduce ? "Reduced motion" : "Full motion"}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={scoped}
          onClick={() => setScoped((value) => !value)}
        >
          {scoped ? "Remove .motion-reduce" : "Add .motion-reduce"}
        </Button>
      </div>
    </div>
  )
}

const noteSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
})

function FormPreview() {
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { name: "" },
  })

  return (
    <Form {...form}>
      <form
        className="grid max-w-sm gap-3"
        onSubmit={form.handleSubmit((values) => {
          toast.success(`${values.name} saved.`)
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="sync" {...field} />
              </FormControl>
              <FormDescription>Submit empty to see the error.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-fit">
          Save
        </Button>
      </form>
    </Form>
  )
}

function Showcase({ slug, example }: { slug: string; example?: string }) {
  switch (slug) {
    case "carousel":
      return <CarouselDemo example={example} />
    case "use-reduced-motion":
      return <ReducedMotionPreview />
    case "button":
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button>Save</Button>
          <Button variant="lantern">Run</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Details</Button>
        </div>
      )
    case "input":
      return (
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="run-name">Name</Label>
          <Input id="run-name" placeholder="sync" />
        </div>
      )
    case "textarea":
      return (
        <Textarea
          className="max-w-md"
          placeholder="What changed in this run."
        />
      )
    case "hollow-input":
      return (
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="hollow">Filter</Label>
          <HollowInput id="hollow" placeholder="Filter logs" />
        </div>
      )
    case "label":
      return <Label>Name</Label>
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox id="docs-notify" defaultChecked />
          <Label htmlFor="docs-notify">Notify on failure</Label>
        </div>
      )
    case "switch":
      return (
        <div className="flex items-center gap-2">
          <Switch id="docs-retry" defaultChecked />
          <Label htmlFor="docs-retry">Auto-retry</Label>
        </div>
      )
    case "radio-group":
      return (
        <RadioGroup defaultValue="preview" className="grid gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="preview" id="docs-preview" />
            <Label htmlFor="docs-preview">Preview</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="production" id="docs-production" />
            <Label htmlFor="docs-production">Production</Label>
          </div>
        </RadioGroup>
      )
    case "select":
      return (
        <Select defaultValue="preview">
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preview">Preview</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      )
    case "form":
      return <FormPreview />
    case "dropdown-menu":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Retry</DropdownMenuItem>
            <DropdownMenuItem>Cancel</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    case "popover":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Details</Button>
          </PopoverTrigger>
          <PopoverContent>Last sync 2m ago.</PopoverContent>
        </Popover>
      )
    case "tooltip":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Run</Button>
          </TooltipTrigger>
          <TooltipContent>Start a new run</TooltipContent>
        </Tooltip>
      )
    case "dialog":
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Run</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New run</DialogTitle>
              <DialogDescription>This starts a deploy.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
    case "sheet":
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Logs</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Logs</SheetTitle>
              <SheetDescription>Last sync 2m ago.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )
    case "drawer":
      return (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Details</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Run details</DrawerTitle>
              <DrawerDescription>Deploy is still running.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      )
    case "command":
      return (
        <Command className="max-w-md rounded-xl border border-border">
          <CommandInput placeholder="Filter logs" />
          <CommandList>
            <CommandEmpty>No matching logs.</CommandEmpty>
            <CommandGroup heading="Runs">
              <CommandItem>deploy</CommandItem>
              <CommandItem>sync</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )
    case "tabs":
      return (
        <Tabs defaultValue="today" className="max-w-md">
          <TabsList variant="line">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This week</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="pt-3 text-muted-foreground">
            4 runs succeeded.
          </TabsContent>
          <TabsContent value="week" className="pt-3 text-muted-foreground">
            18 runs.
          </TabsContent>
        </Tabs>
      )
    case "accordion":
      return (
        <Accordion type="single" collapsible className="max-w-md">
          <AccordionItem value="deploy">
            <AccordionTrigger>Deploy</AccordionTrigger>
            <AccordionContent>Running. Last sync 2m ago.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="sync">
            <AccordionTrigger>Sync</AccordionTrigger>
            <AccordionContent>Finished 2 minutes ago.</AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    case "breadcrumb":
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/kitchen">North Cabin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Runs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    case "pagination":
      return (
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#pagination" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#pagination" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#pagination">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#pagination" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )
    case "navigation-menu":
      return (
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/docs">Docs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/kitchen">Runs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
    case "sidebar":
    case "page-shell":
      return (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex min-h-56 min-w-0 flex-col sm:flex-row">
            <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-sidebar-border bg-sidebar p-3 text-sidebar-foreground sm:w-44 sm:border-r sm:border-b-0">
              <RavenMark title="Runs" className="px-1 py-2" />
              <div className="mt-2 flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1.5 text-sm text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--ring)]">
                <PlayIcon className="size-4" />
                Runs
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                Logs
              </div>
            </aside>
            <div className="flex-1 p-4">
              <p className="font-serif text-xl">Runs</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PageShell is this frame. The live desk is the runs page.
              </p>
              <Button asChild className="mt-4" variant="lantern">
                <Link href="/kitchen">Open runs</Link>
              </Button>
            </div>
          </div>
        </div>
      )
    case "card":
      return (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Deploy</CardTitle>
            <CardDescription>Production</CardDescription>
          </CardHeader>
          <CardContent>Last sync 2m ago.</CardContent>
          <CardFooter>Running</CardFooter>
        </Card>
      )
    case "forest-card":
      return (
        <ForestCard className="max-w-sm">
          <CardHeader>
            <CardTitle>Runs</CardTitle>
            <CardDescription>4 succeeded today.</CardDescription>
          </CardHeader>
          <CardContent>One hairline along the top edge.</CardContent>
        </ForestCard>
      )
    case "badge":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge>Running</Badge>
          <Badge variant="secondary">Queued</Badge>
          <Badge variant="moss">Ok</Badge>
          <Badge variant="lantern">Warn</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Idle</Badge>
        </div>
      )
    case "avatar":
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>NC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </div>
      )
    case "separator":
      return (
        <div className="max-w-sm">
          <p className="text-sm">deploy</p>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">Last sync 2m ago.</p>
        </div>
      )
    case "skeleton":
      return (
        <div className="grid max-w-sm gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )
    case "table":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>deploy</TableCell>
              <TableCell>now</TableCell>
              <TableCell>
                <Badge variant="moss">Running</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>sync</TableCell>
              <TableCell>2m ago</TableCell>
              <TableCell>
                <Badge variant="lantern">Warn</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
    case "sonner":
      return (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success("Saved")}>Save</Button>
          <Button
            variant="lantern"
            onClick={() => toast.warning("Deploy delayed")}
          >
            Warn
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast.error("Index failed")}
          >
            Error
          </Button>
        </div>
      )
    case "grove-alert":
      return (
        <div className="grid max-w-lg gap-3">
          <GroveAlert variant="moss">
            <GroveAlertIcon>
              <Leaf />
            </GroveAlertIcon>
            <GroveAlertTitle>Sync finished</GroveAlertTitle>
            <GroveAlertDescription>Last sync 2m ago.</GroveAlertDescription>
          </GroveAlert>
          <GroveAlert variant="lantern">
            <GroveAlertIcon>
              <TriangleAlertIcon />
            </GroveAlertIcon>
            <GroveAlertTitle>Deploy delayed</GroveAlertTitle>
            <GroveAlertDescription>Retry is queued.</GroveAlertDescription>
          </GroveAlert>
          <GroveAlert variant="rust">
            <GroveAlertTitle>Index failed</GroveAlertTitle>
            <GroveAlertDescription>
              The last run exited with an error.
            </GroveAlertDescription>
          </GroveAlert>
        </div>
      )
    case "raven-empty-state":
      return (
        <RavenEmptyState
          title="No runs yet"
          description="Start a run to see it here."
          action={<Button>Run</Button>}
        />
      )
    case "raven-mark":
      return (
        <div className="flex flex-col gap-4">
          <RavenMark className="text-3xl" />
          <RavenMark wordmark={false} className="text-5xl text-primary" />
        </div>
      )
    case "kbd":
      return (
        <div className="flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>
      )
    case "status-dot":
      return (
        <div className="flex flex-wrap gap-4">
          <StatusDot status="idle" label="Idle" />
          <StatusDot status="running" label="Running" />
          <StatusDot status="ok" label="Ok" />
          <StatusDot status="warn" label="Warn" />
          <StatusDot status="error" label="Error" />
        </div>
      )
    case "metric":
      return (
        <div className="grid max-w-lg gap-6 sm:grid-cols-3">
          <Metric
            label="Runs today"
            value="18"
            delta="+3"
            hint="Since midnight"
          />
          <Metric label="Queue" value="1" />
          <Metric label="Failed" value="2" hint="Last sync 2m ago" />
        </div>
      )
    case "data-list":
      return (
        <DataList className="max-w-sm">
          <DataListItem term="Status">Running</DataListItem>
          <DataListItem term="Environment">Production</DataListItem>
          <DataListItem term="Run" mono>
            run_18f
          </DataListItem>
        </DataList>
      )
    case "section-header":
      return (
        <SectionHeader
          title="Runs"
          description="Last sync 2m ago."
          action={<Button>Run</Button>}
        />
      )
    case "callout":
      return (
        <div className="grid max-w-lg gap-3">
          <Callout variant="note">Sync finished.</Callout>
          <Callout variant="warning" icon={<TriangleAlertIcon />}>
            Deploy is still running.
          </Callout>
          <Callout variant="danger">Index failed.</Callout>
        </div>
      )
    case "copy-button":
      return <CopyButton text="run_18f" label="Copy run id" />
    case "spinner":
      return <Spinner />
    case "progress":
      return (
        <div className="grid max-w-sm gap-3">
          <Progress value={64} aria-label="Deploy progress" />
          <Progress
            value={32}
            variant="lantern"
            aria-label="Warning progress"
          />
        </div>
      )
    case "slider":
      return (
        <Slider defaultValue={[40]} aria-label="Limit" className="max-w-sm" />
      )
    case "toggle":
      return <Toggle defaultPressed>Idle</Toggle>
    case "toggle-group":
      return (
        <ToggleGroup type="single" defaultValue="idle">
          <ToggleGroupItem value="idle">Idle</ToggleGroupItem>
          <ToggleGroupItem value="running">Running</ToggleGroupItem>
          <ToggleGroupItem value="ok">Ok</ToggleGroupItem>
        </ToggleGroup>
      )
    case "timeline":
      return (
        <Timeline className="max-w-md">
          <TimelineItem status="running" title="Deploy" meta="14:02">
            Still running.
          </TimelineItem>
          <TimelineItem status="ok" title="Sync" meta="14:00">
            Finished.
          </TimelineItem>
          <TimelineItem status="error" title="Index" meta="12:04">
            Exited with an error.
          </TimelineItem>
        </Timeline>
      )
    case "log-line":
      return (
        <div className="grid max-w-lg gap-1">
          <LogLine time="14:02:11" level="info" message="Last sync 2m ago" />
          <LogLine time="14:02:08" level="warn" message="Retrying deploy" />
          <LogLine time="14:01:40" level="error" message="Index failed" />
          <LogLine time="13:58:02" level="debug" message="Worker idle" />
        </div>
      )
    case "item":
      return (
        <div className="max-w-md rounded-lg border border-border">
          <Item
            icon={<PlayIcon />}
            title="deploy"
            description="Production"
            meta="2m"
            action={
              <Button size="sm" variant="outline">
                Run
              </Button>
            }
          />
        </div>
      )
    case "banner":
      return (
        <div className="grid gap-3">
          <Banner tone="moss">Sync finished.</Banner>
          <Banner tone="lantern">Deploy is running. Last sync 2m ago.</Banner>
          <Banner tone="rust">Index failed.</Banner>
        </div>
      )
    case "empty-panel":
      return (
        <div className="max-w-md rounded-lg border border-border">
          <EmptyPanel
            title="No runs yet"
            description="Start a run to see it here."
            action={<Button size="sm">Run</Button>}
          />
        </div>
      )
    case "field":
      return (
        <div className="grid max-w-sm gap-4">
          <Field label="Name" htmlFor="field-name" hint="Shown in the list.">
            <Input id="field-name" placeholder="sync" />
          </Field>
          <Field label="Name" htmlFor="field-error" error="Enter a name.">
            <Input id="field-error" aria-invalid placeholder="sync" />
          </Field>
        </div>
      )
    case "shortcut-hint":
      return (
        <div className="max-w-xs text-sm">
          <ShortcutHint label="Filter logs" keys={["⌘", "K"]} />
        </div>
      )
    default:
      return null
  }
}

export { Showcase }
