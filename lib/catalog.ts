import { githubInstallCommand, installCommand } from "@/lib/registry"

export type CatalogExample = {
  id: string
  title: string
  description: string
  usage: string
}

export type CatalogItem = {
  slug: string
  title: string
  group: string
  description: string
  usage: string
  /** One-time project setup shown after the install command. */
  setup?: string
  /** Scenario demos shown after the plain demo on the docs page. */
  examples?: CatalogExample[]
}

const usage = {
  button: `import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <div className="flex gap-2">
      <Button>Save</Button>
      <Button variant="lantern">Run</Button>
    </div>
  )
}`,
  input: `import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="sync" />
    </div>
  )
}`,
  textarea: `import { Textarea } from "@/components/ui/textarea"

export function Example() {
  return <Textarea placeholder="What changed in this run." />
}`,
  "hollow-input": `import { HollowInput } from "@/components/ravenwood/hollow-input"

export function Example() {
  return <HollowInput placeholder="Filter logs" />
}`,
  label: `import { Label } from "@/components/ui/label"

export function Example() {
  return <Label htmlFor="name">Name</Label>
}`,
  checkbox: `import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="notify" defaultChecked />
      <Label htmlFor="notify">Notify on failure</Label>
    </div>
  )
}`,
  switch: `import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="auto" defaultChecked />
      <Label htmlFor="auto">Auto-retry</Label>
    </div>
  )
}`,
  "radio-group": `import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Example() {
  return (
    <RadioGroup defaultValue="preview">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="preview" id="preview" />
        <Label htmlFor="preview">Preview</Label>
      </div>
    </RadioGroup>
  )
}`,
  select: `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Example() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Environment" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="preview">Preview</SelectItem>
        <SelectItem value="production">Production</SelectItem>
      </SelectContent>
    </Select>
  )
}`,
  form: `import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
})

export function Example() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="grid gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}`,
  "dropdown-menu": `import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Retry</DropdownMenuItem>
        <DropdownMenuItem>Cancel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
  popover: `import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Details</Button>
      </PopoverTrigger>
      <PopoverContent>Last sync 2m ago.</PopoverContent>
    </Popover>
  )
}`,
  tooltip: `import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function Example() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Run</Button>
      </TooltipTrigger>
      <TooltipContent>Start a new run</TooltipContent>
    </Tooltip>
  )
}`,
  dialog: `import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Example() {
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
}`,
  sheet: `import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Logs</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Logs</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}`,
  drawer: `import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export function Example() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Details</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Run details</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}`,
  command: `import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function Example() {
  return (
    <Command className="rounded-xl border border-border">
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
}`,
  tabs: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Example() {
  return (
    <Tabs defaultValue="today">
      <TabsList>
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="week">This week</TabsTrigger>
      </TabsList>
      <TabsContent value="today">4 runs succeeded.</TabsContent>
      <TabsContent value="week">18 runs.</TabsContent>
    </Tabs>
  )
}`,
  accordion: `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Example() {
  return (
    <Accordion>
      <AccordionItem value="deploy">
        <AccordionTrigger>Deploy</AccordionTrigger>
        <AccordionContent>Running. Last sync 2m ago.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`,
  breadcrumb: `import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Example() {
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
}`,
  pagination: `import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function Example() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}`,
  "navigation-menu": `import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/docs">Docs</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}`,
  sidebar: `import { PageShell } from "@/components/ravenwood/page-shell"
import { PlayIcon } from "lucide-react"

export function Example() {
  return (
    <PageShell
      title="Runs"
      items={[{ title: "Runs", href: "/kitchen", icon: PlayIcon, active: true }]}
    >
      <p className="p-6">Last sync 2m ago.</p>
    </PageShell>
  )
}`,
  "page-shell": `import { PageShell } from "@/components/ravenwood/page-shell"
import { PlayIcon } from "lucide-react"

export function Frame() {
  return (
    <PageShell
      title="Runs"
      items={[{ title: "Runs", href: "/kitchen", icon: PlayIcon, active: true }]}
    >
      <main className="p-6">Product surface goes here.</main>
    </PageShell>
  )
}`,
  card: `import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy</CardTitle>
        <CardDescription>Production</CardDescription>
      </CardHeader>
      <CardContent>Last sync 2m ago.</CardContent>
    </Card>
  )
}`,
  "forest-card": `import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForestCard } from "@/components/ravenwood/forest-card"

export function Example() {
  return (
    <ForestCard>
      <CardHeader>
        <CardTitle>Runs</CardTitle>
        <CardDescription>4 succeeded today.</CardDescription>
      </CardHeader>
      <CardContent>One hairline along the top edge.</CardContent>
    </ForestCard>
  )
}`,
  badge: `import { Badge } from "@/components/ui/badge"

export function Example() {
  return (
    <div className="flex gap-2">
      <Badge>Running</Badge>
      <Badge variant="moss">Ok</Badge>
      <Badge variant="lantern">Warn</Badge>
    </div>
  )
}`,
  avatar: `import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Example() {
  return (
    <Avatar>
      <AvatarFallback>NC</AvatarFallback>
    </Avatar>
  )
}`,
  separator: `import { Separator } from "@/components/ui/separator"

export function Example() {
  return <Separator />
}`,
  skeleton: `import { Skeleton } from "@/components/ui/skeleton"

export function Example() {
  return <Skeleton className="h-8 w-40" />
}`,
  table: `import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Run</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>deploy</TableCell>
          <TableCell>Running</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}`,
  sonner: `import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function Example() {
  return <Button onClick={() => toast.success("Saved")}>Save</Button>
}`,
  "grove-alert": `import { Leaf } from "lucide-react"
import {
  GroveAlert,
  GroveAlertDescription,
  GroveAlertIcon,
  GroveAlertTitle,
} from "@/components/ravenwood/grove-alert"

export function Example() {
  return (
    <GroveAlert variant="lantern">
      <GroveAlertIcon>
        <Leaf />
      </GroveAlertIcon>
      <GroveAlertTitle>Deploy delayed</GroveAlertTitle>
      <GroveAlertDescription>Last sync 2m ago.</GroveAlertDescription>
    </GroveAlert>
  )
}`,
  "raven-empty-state": `import { Button } from "@/components/ui/button"
import { RavenEmptyState } from "@/components/ravenwood/raven-empty-state"

export function Example() {
  return (
    <RavenEmptyState
      title="No runs yet"
      description="Start a run to see it here."
      action={<Button>Run</Button>}
    />
  )
}`,
  "raven-mark": `import { RavenMark } from "@/components/ravenwood/raven-mark"

export function Example() {
  return <RavenMark />
}`,
  "use-mobile": `"use client"

import { useIsMobile } from "@/hooks/use-mobile"

export function Example() {
  const isMobile = useIsMobile()
  return <p>{isMobile ? "Narrow layout" : "Wide layout"}</p>
}`,
  motion: `import { intents } from "@/lib/motion"

export function Example() {
  return (
    <ul>
      {intents.map((intent) => (
        <li key={intent.name}>
          {intent.name} · {intent.ms}
        </li>
      ))}
    </ul>
  )
}`,
  "input-group": `import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function Example() {
  return (
    <InputGroup>
      <InputGroupAddon>Run</InputGroupAddon>
      <InputGroupInput placeholder="sync" />
    </InputGroup>
  )
}`,
  "scroll-area": `import { ScrollArea } from "@/components/ui/scroll-area"

export function Example() {
  return (
    <ScrollArea className="h-40 rounded-lg border border-border p-3">
      {Array.from({ length: 12 }, (_, i) => (
        <p key={i}>Log line {i + 1}</p>
      ))}
    </ScrollArea>
  )
}`,
  kbd: `import { Kbd } from "@/components/ravenwood/kbd"

export function Example() {
  return <Kbd>K</Kbd>
}`,
  "status-dot": `import { StatusDot } from "@/components/ravenwood/status-dot"

export function Example() {
  return <StatusDot status="running" label="Running" />
}`,
  metric: `import { Metric } from "@/components/ravenwood/metric"

export function Example() {
  return <Metric label="Runs today" value="18" delta="+3" hint="Last sync 2m ago" />
}`,
  "data-list": `import { DataList, DataListItem } from "@/components/ravenwood/data-list"

export function Example() {
  return (
    <DataList>
      <DataListItem term="Status">Running</DataListItem>
      <DataListItem term="Run" mono>
        run_18f
      </DataListItem>
    </DataList>
  )
}`,
  "section-header": `import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ravenwood/section-header"

export function Example() {
  return (
    <SectionHeader
      title="Runs"
      description="Last sync 2m ago."
      action={<Button>Run</Button>}
    />
  )
}`,
  callout: `import { Callout } from "@/components/ravenwood/callout"

export function Example() {
  return <Callout variant="warning">Deploy is still running.</Callout>
}`,
  "copy-button": `import { CopyButton } from "@/components/ravenwood/copy-button"

export function Example() {
  return <CopyButton text="run_18f" label="Copy run id" />
}`,
  spinner: `import { Spinner } from "@/components/ravenwood/spinner"

export function Example() {
  return <Spinner />
}`,
  progress: `import { Progress } from "@/components/ravenwood/progress"

export function Example() {
  return <Progress value={64} />
}`,
  slider: `import { Slider } from "@/components/ravenwood/slider"

export function Example() {
  return <Slider defaultValue={[40]} aria-label="Limit" />
}`,
  toggle: `import { Toggle } from "@/components/ravenwood/toggle"

export function Example() {
  return <Toggle>Idle</Toggle>
}`,
  "toggle-group": `import { ToggleGroup, ToggleGroupItem } from "@/components/ravenwood/toggle-group"

export function Example() {
  return (
    <ToggleGroup type="single" defaultValue="idle">
      <ToggleGroupItem value="idle">Idle</ToggleGroupItem>
      <ToggleGroupItem value="running">Running</ToggleGroupItem>
    </ToggleGroup>
  )
}`,
  timeline: `import { Timeline, TimelineItem } from "@/components/ravenwood/timeline"

export function Example() {
  return (
    <Timeline>
      <TimelineItem status="running" title="Deploy" meta="14:02">
        Still running.
      </TimelineItem>
      <TimelineItem status="ok" title="Sync" meta="14:00">
        Finished.
      </TimelineItem>
    </Timeline>
  )
}`,
  "log-line": `import { LogLine } from "@/components/ravenwood/log-line"

export function Example() {
  return <LogLine time="14:02:11" level="info" message="Last sync 2m ago" />
}`,
  item: `import { PlayIcon } from "lucide-react"
import { Item } from "@/components/ravenwood/item"

export function Example() {
  return (
    <Item
      icon={<PlayIcon />}
      title="deploy"
      description="Production"
      meta="2m"
    />
  )
}`,
  banner: `import { Banner } from "@/components/ravenwood/banner"

export function Example() {
  return <Banner tone="lantern">Deploy is running. Last sync 2m ago.</Banner>
}`,
  "empty-panel": `import { EmptyPanel } from "@/components/ravenwood/empty-panel"

export function Example() {
  return <EmptyPanel title="No runs yet" description="Start a run to see it here." />
}`,
  field: `import { Input } from "@/components/ui/input"
import { Field } from "@/components/ravenwood/field"

export function Example() {
  return (
    <Field label="Name" htmlFor="run-name" hint="Shown in the list.">
      <Input id="run-name" placeholder="sync" />
    </Field>
  )
}`,
  "shortcut-hint": `import { ShortcutHint } from "@/components/ravenwood/shortcut-hint"

export function Example() {
  return <ShortcutHint label="Filter logs" keys={["⌘", "K"]} />
}`,
  carousel: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function Example() {
  return (
    <Carousel aria-label="Run notes" className="mx-12 max-w-xs">
      <CarouselContent>
        <CarouselItem>Sync</CarouselItem>
        <CarouselItem>Backup</CarouselItem>
        <CarouselItem>Deploy</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}`,
  "use-reduced-motion": `"use client"

import * as React from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function Example() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion(ref)
  return <div ref={ref}>{reduce ? "Jump" : "Animate"}</div>
}`,
  map: `import { Map, MapControls } from "@/components/ui/map"

export function Example() {
  return (
    <div className="h-[360px] overflow-hidden rounded-xl border">
      <Map aria-label="Map of Chicago" center={[-87.6298, 41.8781]} zoom={11}>
        <MapControls showZoom showCompass showFullscreen showScale />
      </Map>
    </div>
  )
}`,
} as const

type UsageKey = keyof typeof usage

const entries: Array<{
  slug: UsageKey
  title: string
  group: string
  description: string
  setup?: string
  examples?: CatalogExample[]
}> = [
  {
    slug: "raven-mark",
    title: "RavenMark",
    group: "Signature",
    description: "The mark, with an optional wordmark.",
  },
  {
    slug: "forest-card",
    title: "ForestCard",
    group: "Signature",
    description: "Card with one hairline in the focus ring color.",
  },
  {
    slug: "grove-alert",
    title: "GroveAlert",
    group: "Signature",
    description: "Filled alert. Variants are moss, lantern, and rust.",
  },
  {
    slug: "hollow-input",
    title: "HollowInput",
    group: "Signature",
    description: "Taller field on the muted fill.",
  },
  {
    slug: "raven-empty-state",
    title: "RavenEmptyState",
    group: "Signature",
    description: "Empty state with the mark, a title, and one action.",
  },
  {
    slug: "page-shell",
    title: "PageShell",
    group: "Signature",
    description: "App frame with a collapsible sidebar.",
  },
  {
    slug: "button",
    title: "Button",
    group: "Actions",
    description:
      "Primary, lantern, outline, secondary, ghost, and destructive. Press scales to 0.98.",
  },
  {
    slug: "badge",
    title: "Badge",
    group: "Display",
    description: "Small status label. Includes moss and lantern.",
  },
  {
    slug: "input",
    title: "Input",
    group: "Forms",
    description: "Single-line field. Focus ring uses the ring token.",
  },
  {
    slug: "textarea",
    title: "Textarea",
    group: "Forms",
    description: "Multiline field with the same focus ring as Input.",
  },
  {
    slug: "label",
    title: "Label",
    group: "Forms",
    description: "Label for a field.",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    group: "Forms",
    description: "Checked state uses primary.",
  },
  {
    slug: "switch",
    title: "Switch",
    group: "Forms",
    description: "Checked state uses primary.",
  },
  {
    slug: "radio-group",
    title: "Radio group",
    group: "Forms",
    description: "One choice in a group.",
  },
  {
    slug: "select",
    title: "Select",
    group: "Forms",
    description: "Select trigger and menu.",
  },
  {
    slug: "form",
    title: "Form",
    group: "Forms",
    description: "react-hook-form and zod, with labels and messages.",
  },
  {
    slug: "dialog",
    title: "Dialog",
    group: "Overlays",
    description: "Modal dialog with a scrim.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    group: "Overlays",
    description: "Side panel.",
  },
  {
    slug: "drawer",
    title: "Drawer",
    group: "Overlays",
    description: "Drawer from the bottom edge.",
  },
  {
    slug: "popover",
    title: "Popover",
    group: "Overlays",
    description: "Small panel anchored to a trigger.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "Overlays",
    description: "Short label on hover or focus.",
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown menu",
    group: "Overlays",
    description: "Menu. Hover uses accent.",
  },
  {
    slug: "command",
    title: "Command",
    group: "Overlays",
    description: "Searchable command list.",
  },
  {
    slug: "tabs",
    title: "Tabs",
    group: "Navigation",
    description:
      "Tabs. The line variant marks the active tab with the ring token.",
  },
  {
    slug: "accordion",
    title: "Accordion",
    group: "Navigation",
    description: "Disclosure list. Triggers use the display face.",
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    group: "Navigation",
    description: "Where you are in the app.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    group: "Navigation",
    description: "Page links built on Button.",
  },
  {
    slug: "navigation-menu",
    title: "Navigation menu",
    group: "Navigation",
    description: "Top navigation. The site header uses this.",
  },
  {
    slug: "sidebar",
    title: "Sidebar",
    group: "Navigation",
    description:
      "Collapsible sidebar. The active item uses a ring-colored rail.",
  },
  {
    slug: "card",
    title: "Card",
    group: "Display",
    description: "Bordered surface. Titles use the display face.",
  },
  {
    slug: "avatar",
    title: "Avatar",
    group: "Display",
    description: "Round image or initials.",
  },
  {
    slug: "separator",
    title: "Separator",
    group: "Display",
    description: "Hairline divider.",
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    group: "Display",
    description: "Placeholder while content loads.",
  },
  {
    slug: "table",
    title: "Table",
    group: "Display",
    description: "Rows and columns.",
  },
  {
    slug: "sonner",
    title: "Sonner",
    group: "Feedback",
    description:
      "Toasts. Success, warning, and error use moss, lantern, and rust.",
  },
  {
    slug: "use-mobile",
    title: "useIsMobile",
    group: "Utilities",
    description: "True below 768px. Used by the sidebar.",
  },
  {
    slug: "motion",
    title: "Motion",
    group: "Utilities",
    description: "Named durations: snap, ui, overlay, layout, gentle.",
  },
  {
    slug: "use-reduced-motion",
    title: "useReducedMotion",
    group: "Utilities",
    description:
      "True when the OS asks for reduced motion or a .motion-reduce ancestor is set.",
  },
  {
    slug: "input-group",
    title: "Input group",
    group: "Forms",
    description: "Input with an addon. Used by Command.",
  },
  {
    slug: "scroll-area",
    title: "Scroll area",
    group: "Display",
    description: "Scrollable region with a styled scrollbar.",
  },
  {
    slug: "carousel",
    title: "Carousel",
    group: "Media",
    description:
      "Embla carousel. Slide or fade, items per view by breakpoint, and opt-in autoplay with a pause control.",
    examples: [
      {
        id: "responsive",
        title: "Responsive feature showcase",
        description:
          "One item per view on small screens, two at md, three at lg. Prev and Next move one view.",
        usage: `<Carousel aria-label="Features" itemsPerView={{ base: 1, md: 2, lg: 3 }}>
  <CarouselContent>
    {features.map((feature) => (
      <CarouselItem key={feature.title}>
        <Card className="h-full">...</Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
      },
      {
        id: "testimonials",
        title: "Testimonial fade",
        description:
          "Cross-fade with autoplay off until Play is pressed. Hover or focus pauses it. Reduced motion hides the control and never rotates.",
        usage: `<Carousel
  aria-label="Testimonials"
  transition="fade"
  autoplay={{ delay: 6000, playOnInit: false }}
  opts={{ loop: true }}
>
  <CarouselContent>
    {testimonials.map((item) => (
      <CarouselItem key={item.name}>
        <Card>...</Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
      },
    ],
  },
  {
    slug: "kbd",
    title: "Kbd",
    group: "Signature",
    description: "Inline shortcut key.",
  },
  {
    slug: "status-dot",
    title: "StatusDot",
    group: "Signature",
    description: "Status dot for idle, running, ok, warn, and error.",
  },
  {
    slug: "metric",
    title: "Metric",
    group: "Signature",
    description: "Label, serif value, optional delta and hint.",
  },
  {
    slug: "data-list",
    title: "DataList",
    group: "Signature",
    description: "Term and value rows with hairline dividers.",
  },
  {
    slug: "section-header",
    title: "SectionHeader",
    group: "Signature",
    description: "Section title, optional description, optional action.",
  },
  {
    slug: "callout",
    title: "Callout",
    group: "Signature",
    description: "Note, warning, or danger with a left border.",
  },
  {
    slug: "copy-button",
    title: "CopyButton",
    group: "Signature",
    description: "Icon button that copies text and shows a check.",
  },
  {
    slug: "spinner",
    title: "Spinner",
    group: "Signature",
    description: "16px loading arc. Static when motion is reduced.",
  },
  {
    slug: "progress",
    title: "Progress",
    group: "Signature",
    description: "Determinate bar. Primary fill, or lantern for a warning.",
  },
  {
    slug: "slider",
    title: "Slider",
    group: "Signature",
    description: "Range slider. Muted track, primary fill, focus-ring thumb.",
  },
  {
    slug: "toggle",
    title: "Toggle",
    group: "Signature",
    description: "Pressed state uses accent.",
  },
  {
    slug: "toggle-group",
    title: "ToggleGroup",
    group: "Signature",
    description: "A group of toggles. Pressed state uses accent.",
  },
  {
    slug: "timeline",
    title: "Timeline",
    group: "Signature",
    description: "Vertical list of events with a status dot.",
  },
  {
    slug: "log-line",
    title: "LogLine",
    group: "Signature",
    description: "One mono log row: time, level, message.",
  },
  {
    slug: "item",
    title: "Item",
    group: "Signature",
    description: "Row with icon, title, description, meta, and an action.",
  },
  {
    slug: "banner",
    title: "Banner",
    group: "Signature",
    description: "Full-width dismissible note.",
  },
  {
    slug: "empty-panel",
    title: "EmptyPanel",
    group: "Signature",
    description: "Short empty state for a table or filter. No mark.",
  },
  {
    slug: "field",
    title: "Field",
    group: "Signature",
    description: "Label, control, hint, and error.",
  },
  {
    slug: "shortcut-hint",
    title: "ShortcutHint",
    group: "Signature",
    description: "A label with a shortcut cluster.",
  },
  {
    slug: "map",
    title: "Map",
    group: "Maps",
    description:
      "MapLibre map from mapcn, owned here. Markers are buttons, popups take focus, colors are tokens, and the basemap follows the theme.",
    setup: `# MapLibre 6 needs its worker served from your app (no CDN).
# The install adds scripts/copy-maplibre-worker.mjs. Run it before dev and build:
#
# package.json
#   "dev": "node scripts/copy-maplibre-worker.mjs && next dev",
#   "build": "node scripts/copy-maplibre-worker.mjs && next build",
#
# It copies node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs to
# public/maplibre/. Add /public/maplibre/ to .gitignore.
# Serving it somewhere else? <Map workerUrl="/assets/maplibre-gl-worker.mjs" />
#
# Basemaps: OpenFreeMap (no key). CARTO is opt-in, with a key and attribution:
# <Map styles={{
#   light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
#   dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
# }} />`,
    examples: [
      {
        id: "store-locator",
        title: "Store locator",
        description:
          "300 stores in clusters. The list shows what is in view and is the keyboard path to each store. Picking one moves the map and opens a popup.",
        usage: `<Map ref={mapRef} aria-label="Store locator" center={[-90.5, 38.8]} zoom={3.6}>
  <MapClusterLayer
    data={storesGeoJSON}
    onPointClick={(feature) => setSelected(byId[feature.properties.id])}
  />
  <MapControls showZoom showScale={{ unit: "imperial" }} />
  {selected && (
    <MapPopup
      longitude={selected.longitude}
      latitude={selected.latitude}
      aria-label={selected.name}
      onClose={() => setSelected(null)}
    >
      ...
    </MapPopup>
  )}
</Map>`,
      },
      {
        id: "listings",
        title: "Listings synced to the map",
        description:
          "Hovering a card highlights its price marker. Show on map opens that marker's popup through the controlled open prop.",
        usage: `<MapMarker
  longitude={listing.longitude}
  latitude={listing.latitude}
  label={\`\${listing.title}, \${price}\`}
  open={openId === listing.id}
  onOpenChange={(open) => setOpenId(open ? listing.id : null)}
>
  <MarkerContent>
    <span className={active ? "bg-primary text-primary-foreground" : "bg-popover"}>
      {shortPrice}
    </span>
  </MarkerContent>
  <MarkerPopup>...</MarkerPopup>
</MapMarker>`,
      },
      {
        id: "venues",
        title: "Venue picker",
        description:
          "Tab to a pin, press Enter to open it, choose the venue, Escape to close. Focus returns to the pin.",
        usage: `<MapMarker
  longitude={venue.longitude}
  latitude={venue.latitude}
  label={\`\${venue.name}, \${venue.kind}, \${venue.capacity} guests\`}
>
  <MarkerContent>
    <PinIcon />
    <MarkerLabel position="bottom">{venue.name}</MarkerLabel>
  </MarkerContent>
  <MarkerPopup>
    <p>{venue.name}</p>
    <Button size="sm" onClick={() => setChosen(venue.id)}>Choose venue</Button>
  </MarkerPopup>
</MapMarker>`,
      },
      {
        id: "delivery",
        title: "Delivery zone preview",
        description:
          "GeoJSON zones with a toggle group. Colors are tokens (var(--chart-1)) resolved for the current theme.",
        usage: `<MapGeoJSON data={allZones} fillPaint={false}
  linePaint={{ "line-color": "var(--muted-foreground)", "line-dasharray": [2, 2] }} />
<MapGeoJSON
  data={zoneFeature(zone)}
  fillPaint={{ "fill-color": "var(--chart-1)", "fill-opacity": 0.22 }}
  linePaint={{ "line-color": "var(--chart-1)", "line-width": 2 }}
/>`,
      },
    ],
  },
]

export const catalog: CatalogItem[] = entries.map((entry) => ({
  ...entry,
  usage: usage[entry.slug],
}))

export const catalogGroups = [...new Set(catalog.map((item) => item.group))]

export function getCatalogItem(slug: string) {
  return catalog.find((item) => item.slug === slug)
}

export function namespaceInstall(slug: string) {
  return installCommand(slug)
}

export function githubInstall(slug: string) {
  return githubInstallCommand(slug)
}
