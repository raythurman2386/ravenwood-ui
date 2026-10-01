import { githubInstallCommand, installCommand } from "@/lib/registry"

export type CatalogItem = {
  slug: string
  title: string
  group: string
  description: string
  usage: string
}

const usage = {
  button: `import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <div className="flex gap-2">
      <Button>Enter the grove</Button>
      <Button variant="lantern">Light a lantern</Button>
    </div>
  )
}`,
  input: `import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="cabin">Cabin</Label>
      <Input id="cabin" placeholder="Hemlock" />
    </div>
  )
}`,
  textarea: `import { Textarea } from "@/components/ui/textarea"

export function Example() {
  return <Textarea placeholder="Notes from the ridge trail." />
}`,
  "hollow-input": `import { HollowInput } from "@/components/ravenwood/hollow-input"

export function Example() {
  return <HollowInput placeholder="Carved into the sill" />
}`,
  label: `import { Label } from "@/components/ui/label"

export function Example() {
  return <Label htmlFor="name">Guest</Label>
}`,
  checkbox: `import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="lantern" defaultChecked />
      <Label htmlFor="lantern">Leave a lantern</Label>
    </div>
  )
}`,
  switch: `import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="path" defaultChecked />
      <Label htmlFor="path">East path is open</Label>
    </div>
  )
}`,
  "radio-group": `import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Example() {
  return (
    <RadioGroup defaultValue="hearth">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="hearth" id="hearth" />
        <Label htmlFor="hearth">Hearth supper</Label>
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
        <SelectValue placeholder="Cabin" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hemlock">Hemlock</SelectItem>
        <SelectItem value="cedar">Cedar</SelectItem>
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
  name: z.string().min(2, "A name, even a trail name."),
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
              <FormLabel>Guest</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Check in</Button>
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
        <Button variant="outline">Watch</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>East ridge</DropdownMenuItem>
        <DropdownMenuItem>Mudroom</DropdownMenuItem>
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
        <Button variant="outline">Fog</Button>
      </PopoverTrigger>
      <PopoverContent>Low cloud until the second bell.</PopoverContent>
    </Popover>
  )
}`,
  tooltip: `import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function Example() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Trail</Button>
      </TooltipTrigger>
      <TooltipContent>Open, soft underfoot.</TooltipContent>
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
        <Button>Open the ledger</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Night ledger</DialogTitle>
          <DialogDescription>Three cabins still dark.</DialogDescription>
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
        <Button variant="outline">Ledger</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Stores</SheetTitle>
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
        <Button variant="outline">Trail notes</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>From the ridge</DrawerTitle>
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
      <CommandInput placeholder="Search the grove" />
      <CommandList>
        <CommandEmpty>No path by that name.</CommandEmpty>
        <CommandGroup heading="Places">
          <CommandItem>Hemlock cabin</CommandItem>
          <CommandItem>Mudroom</CommandItem>
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
      <TabsContent value="today">Evening watch.</TabsContent>
      <TabsContent value="week">Four arrivals.</TabsContent>
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
      <AccordionItem value="trail">
        <AccordionTrigger>Trail</AccordionTrigger>
        <AccordionContent>Soft, marked with brass.</AccordionContent>
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
          <BreadcrumbPage>Grove</BreadcrumbPage>
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
import { Trees } from "lucide-react"

export function Example() {
  return (
    <PageShell
      title="North Cabin"
      items={[{ title: "Grove", href: "/kitchen", icon: Trees, active: true }]}
    >
      <p className="p-6">The evening watch.</p>
    </PageShell>
  )
}`,
  "page-shell": `import { PageShell } from "@/components/ravenwood/page-shell"
import { Trees } from "lucide-react"

export function Frame() {
  return (
    <PageShell
      title="North Cabin"
      items={[{ title: "Grove", href: "/kitchen", icon: Trees, active: true }]}
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
        <CardTitle>Hemlock</CardTitle>
        <CardDescription>East ridge, sleeps two.</CardDescription>
      </CardHeader>
      <CardContent>Woodstove lit.</CardContent>
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
        <CardTitle>Canopy</CardTitle>
        <CardDescription>Nine of twelve cabins occupied.</CardDescription>
      </CardHeader>
      <CardContent>Lantern brass along the top edge.</CardContent>
    </ForestCard>
  )
}`,
  badge: `import { Badge } from "@/components/ui/badge"

export function Example() {
  return (
    <div className="flex gap-2">
      <Badge>Occupied</Badge>
      <Badge variant="moss">Open</Badge>
      <Badge variant="lantern">Low wick</Badge>
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
          <TableHead>Guest</TableHead>
          <TableHead>Cabin</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Mara Ell</TableCell>
          <TableCell>Hemlock</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}`,
  sonner: `import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <Button onClick={() => toast.success("Lantern lit.")}>
      Light it
    </Button>
  )
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
      <GroveAlertTitle>East path</GroveAlertTitle>
      <GroveAlertDescription>Lanterns 4 through 6 are out.</GroveAlertDescription>
    </GroveAlert>
  )
}`,
  "raven-empty-state": `import { Button } from "@/components/ui/button"
import { RavenEmptyState } from "@/components/ravenwood/raven-empty-state"

export function Example() {
  return (
    <RavenEmptyState
      title="No ravens yet"
      description="The ridge is quiet. Leave a note when the fog lifts."
      action={<Button variant="lantern">Leave a note</Button>}
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
  return <p>{isMobile ? "Trail width" : "Lodge width"}</p>
}`,
  motion: `import { duration, easing, intents } from "@/lib/motion"

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
      <InputGroupAddon>Cabin</InputGroupAddon>
      <InputGroupInput placeholder="Hemlock" />
    </InputGroup>
  )
}`,
  "scroll-area": `import { ScrollArea } from "@/components/ui/scroll-area"

export function Example() {
  return (
    <ScrollArea className="h-40 rounded-lg border border-border p-3">
      {Array.from({ length: 12 }, (_, i) => (
        <p key={i}>Ledger line {i + 1}</p>
      ))}
    </ScrollArea>
  )
}`,
} as const

type UsageKey = keyof typeof usage

const entries: Array<{
  slug: UsageKey
  title: string
  group: string
  description: string
}> = [
  {
    slug: "raven-mark",
    title: "RavenMark",
    group: "Signature",
    description: "The raven lockup for headers, empty states, and brand moments.",
  },
  {
    slug: "forest-card",
    title: "ForestCard",
    group: "Signature",
    description: "A carved card with a lantern-brass hairline and moss description.",
  },
  {
    slug: "grove-alert",
    title: "GroveAlert",
    group: "Signature",
    description: "Status for the grove: moss, lantern, or rust.",
  },
  {
    slug: "hollow-input",
    title: "HollowInput",
    group: "Signature",
    description: "An input cut into the panel, deeper than the standard field.",
  },
  {
    slug: "raven-empty-state",
    title: "RavenEmptyState",
    group: "Signature",
    description: "A quiet empty state. Mark, serif title, one action.",
  },
  {
    slug: "page-shell",
    title: "PageShell",
    group: "Signature",
    description: "App frame: sidebar, raven mark, and an inset surface.",
  },
  {
    slug: "button",
    title: "Button",
    group: "Actions",
    description: "Emerald, lantern, outline, and rust. A 1px lift, no bounce.",
  },
  {
    slug: "badge",
    title: "Badge",
    group: "Display",
    description: "Small status chips, including moss and lantern.",
  },
  {
    slug: "input",
    title: "Input",
    group: "Forms",
    description: "A field with a shallow carved well and a brass focus ring.",
  },
  {
    slug: "textarea",
    title: "Textarea",
    group: "Forms",
    description: "The same well, for longer notes.",
  },
  {
    slug: "label",
    title: "Label",
    group: "Forms",
    description: "Pairs with every field. Error state turns rust.",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    group: "Forms",
    description: "Emerald when checked. Brass ring when focused.",
  },
  {
    slug: "switch",
    title: "Switch",
    group: "Forms",
    description: "A short slide. Checked state uses the canopy green.",
  },
  {
    slug: "radio-group",
    title: "Radio group",
    group: "Forms",
    description: "One choice, same focus treatment as the other fields.",
  },
  {
    slug: "select",
    title: "Select",
    group: "Forms",
    description: "Trigger matches the carved input. Menu sits on a wood panel.",
  },
  {
    slug: "form",
    title: "Form",
    group: "Forms",
    description: "react-hook-form and zod, wired to labels and messages.",
  },
  {
    slug: "dialog",
    title: "Dialog",
    group: "Overlays",
    description: "A dark scrim, a serif title, and a brass edge.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    group: "Overlays",
    description: "A side panel for ledgers and secondary work.",
  },
  {
    slug: "drawer",
    title: "Drawer",
    group: "Overlays",
    description: "A grounded drawer for notes that should not cover the desk.",
  },
  {
    slug: "popover",
    title: "Popover",
    group: "Overlays",
    description: "A small wood panel for a fact that does not need a dialog.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "Overlays",
    description: "A bark tag with a lantern edge. Short, then gone.",
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown menu",
    group: "Overlays",
    description: "Menus use the accent wash, not a generic gray hover.",
  },
  {
    slug: "command",
    title: "Command",
    group: "Overlays",
    description: "Search the product. Same panel language as dialogs.",
  },
  {
    slug: "tabs",
    title: "Tabs",
    group: "Navigation",
    description: "The line variant underlines the active tab in brass.",
  },
  {
    slug: "accordion",
    title: "Accordion",
    group: "Navigation",
    description: "Serif triggers. Content stays in the body sans.",
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    group: "Navigation",
    description: "Where you are in the lodge.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    group: "Navigation",
    description: "Built on the Ravenwood button.",
  },
  {
    slug: "navigation-menu",
    title: "Navigation menu",
    group: "Navigation",
    description: "The site header uses this for the component index.",
  },
  {
    slug: "sidebar",
    title: "Sidebar",
    group: "Navigation",
    description: "The shadcn sidebar, with a brass rail on the active item.",
  },
  {
    slug: "card",
    title: "Card",
    group: "Display",
    description: "A raised wood panel. Titles set in Fraunces.",
  },
  {
    slug: "avatar",
    title: "Avatar",
    group: "Display",
    description: "Initials on a muted moss ground.",
  },
  {
    slug: "separator",
    title: "Separator",
    group: "Display",
    description: "A bark line.",
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    group: "Display",
    description: "A slow sheen while the ridge report is late.",
  },
  {
    slug: "table",
    title: "Table",
    group: "Display",
    description: "Guests, cabins, and the night book.",
  },
  {
    slug: "sonner",
    title: "Sonner",
    group: "Feedback",
    description: "Toasts in moss, lantern, and rust.",
  },
  {
    slug: "use-mobile",
    title: "useIsMobile",
    group: "Utilities",
    description: "Viewport hook used by the sidebar. True below 768px.",
  },
  {
    slug: "motion",
    title: "Motion",
    group: "Utilities",
    description: "Named Ravenwood motion intents: snap, ui, overlay, layout, gentle.",
  },
  {
    slug: "input-group",
    title: "Input group",
    group: "Forms",
    description: "Input with an addon slot. Used by Command.",
  },
  {
    slug: "scroll-area",
    title: "Scroll area",
    group: "Display",
    description: "Bark scrollbar for tall panels and ledgers.",
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
