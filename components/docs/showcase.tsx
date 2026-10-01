"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Bird,
  Flame,
  Leaf,
  Moon,
  Trees,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { RavenMark } from "@/registry/ravenwood/raven-mark"
import { ForestCard } from "@/registry/ravenwood/forest-card"
import {
  GroveAlert,
  GroveAlertDescription,
  GroveAlertIcon,
  GroveAlertTitle,
} from "@/registry/ravenwood/grove-alert"
import { HollowInput } from "@/registry/ravenwood/hollow-input"
import { RavenEmptyState } from "@/registry/ravenwood/raven-empty-state"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const noteSchema = z.object({
  name: z.string().min(2, "A name, even a trail name."),
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
          toast.success(`${values.name} is written in the book.`)
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest</FormLabel>
              <FormControl>
                <Input placeholder="Mara Ell" {...field} />
              </FormControl>
              <FormDescription>Submit empty to see the rust message.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-fit">
          Write it down
        </Button>
      </form>
    </Form>
  )
}

function Showcase({ slug }: { slug: string }) {
  switch (slug) {
    case "button":
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button>Enter the grove</Button>
          <Button variant="lantern">Light a lantern</Button>
          <Button variant="secondary">Bank the fire</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Close the path</Button>
          <Button variant="link">A quiet link</Button>
        </div>
      )
    case "input":
      return (
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="cabin-name">Cabin</Label>
          <Input id="cabin-name" placeholder="Hemlock" />
        </div>
      )
    case "textarea":
      return (
        <Textarea className="max-w-md" placeholder="Fog until the second bell." />
      )
    case "hollow-input":
      return (
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="hollow">Carved sill</Label>
          <HollowInput id="hollow" placeholder="A name cut into the wood" />
        </div>
      )
    case "label":
      return <Label>Night watch</Label>
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox id="docs-lantern" defaultChecked />
          <Label htmlFor="docs-lantern">Leave a lantern by the door</Label>
        </div>
      )
    case "switch":
      return (
        <div className="flex items-center gap-2">
          <Switch id="docs-path" defaultChecked />
          <Label htmlFor="docs-path">East path is open</Label>
        </div>
      )
    case "radio-group":
      return (
        <RadioGroup defaultValue="hearth" className="grid gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="hearth" id="docs-hearth" />
            <Label htmlFor="docs-hearth">Hearth supper</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="pack" id="docs-pack" />
            <Label htmlFor="docs-pack">Pack meal</Label>
          </div>
        </RadioGroup>
      )
    case "select":
      return (
        <Select defaultValue="hemlock">
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Cabin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hemlock">Hemlock</SelectItem>
            <SelectItem value="cedar">Cedar</SelectItem>
            <SelectItem value="yew">Yew</SelectItem>
          </SelectContent>
        </Select>
      )
    case "form":
      return <FormPreview />
    case "dropdown-menu":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Watch</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>East ridge</DropdownMenuItem>
            <DropdownMenuItem>Mudroom</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Close the path</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    case "popover":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Fog</Button>
          </PopoverTrigger>
          <PopoverContent>Low cloud until the second bell. The trail is marked.</PopoverContent>
        </Popover>
      )
    case "tooltip":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Trail</Button>
          </TooltipTrigger>
          <TooltipContent>Open, soft underfoot.</TooltipContent>
        </Tooltip>
      )
    case "dialog":
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open the ledger</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Night ledger</DialogTitle>
              <DialogDescription>
                Three cabins still dark on the east path. Wick stock is in the mudroom.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
    case "sheet":
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Ledger</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Stores</SheetTitle>
              <SheetDescription>Oil, wicks, and dry cedar.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )
    case "drawer":
      return (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Trail notes</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>From the ridge</DrawerTitle>
              <DrawerDescription>The boardwalk is slick after dusk.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      )
    case "command":
      return (
        <Command className="max-w-md rounded-xl border border-border">
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
    case "tabs":
      return (
        <Tabs defaultValue="today" className="max-w-md">
          <TabsList variant="line">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This week</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="pt-3 text-muted-foreground">
            Evening watch. Three lanterns still dark.
          </TabsContent>
          <TabsContent value="week" className="pt-3 text-muted-foreground">
            Four arrivals, one departure at first light.
          </TabsContent>
        </Tabs>
      )
    case "accordion":
      return (
        <Accordion type="single" collapsible className="max-w-md">
          <AccordionItem value="trail">
            <AccordionTrigger>Trail</AccordionTrigger>
            <AccordionContent>Soft, marked with brass tags.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="hearth">
            <AccordionTrigger>Hearth</AccordionTrigger>
            <AccordionContent>Banked. Enough coal for the night.</AccordionContent>
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
              <BreadcrumbPage>Grove</BreadcrumbPage>
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
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/docs">Docs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/kitchen">Lodge desk</Link>
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
              <RavenMark title="North Cabin" className="px-1 py-2" />
              <div className="mt-2 flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1.5 text-sm text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--ring)]">
                <Trees className="size-4" />
                Grove
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                <Flame className="size-4" />
                Hearth
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                <Moon className="size-4" />
                Ledger
              </div>
            </aside>
            <div className="flex-1 p-4">
              <p className="font-serif text-xl">Evening watch</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PageShell wraps this frame. The live desk is on the lodge page.
              </p>
              <Button asChild className="mt-4" variant="lantern">
                <Link href="/kitchen">Open the lodge desk</Link>
              </Button>
            </div>
          </div>
        </div>
      )
    case "card":
      return (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Hemlock</CardTitle>
            <CardDescription>East ridge, sleeps two.</CardDescription>
          </CardHeader>
          <CardContent>Woodstove lit. Window faces the ravine.</CardContent>
          <CardFooter>Occupied through Sunday</CardFooter>
        </Card>
      )
    case "forest-card":
      return (
        <ForestCard className="max-w-sm">
          <CardHeader>
            <CardTitle>Canopy</CardTitle>
            <CardDescription>Nine of twelve cabins occupied.</CardDescription>
          </CardHeader>
          <CardContent>The brass line is the lantern, not a drop shadow.</CardContent>
        </ForestCard>
      )
    case "badge":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge>Occupied</Badge>
          <Badge variant="secondary">Banked</Badge>
          <Badge variant="moss">Trail open</Badge>
          <Badge variant="lantern">Low wick</Badge>
          <Badge variant="destructive">Closed</Badge>
          <Badge variant="outline">Guest</Badge>
        </div>
      )
    case "avatar":
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>NC</AvatarFallback>
          </Avatar>
        </div>
      )
    case "separator":
      return (
        <div className="max-w-sm">
          <p className="text-sm">Mudroom</p>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">Oil, wicks, dry cedar.</p>
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
              <TableHead>Guest</TableHead>
              <TableHead>Cabin</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Mara Ell</TableCell>
              <TableCell>Hemlock</TableCell>
              <TableCell>
                <Badge variant="moss">In</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ivo Hart</TableCell>
              <TableCell>Yew</TableCell>
              <TableCell>
                <Badge variant="lantern">Due</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
    case "sonner":
      return (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success("The east path is open.")}>
            Moss
          </Button>
          <Button
            variant="lantern"
            onClick={() => toast.warning("Lanterns 4 through 6 are out.")}
          >
            Lantern
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast.error("The boardwalk is closed.")}
          >
            Rust
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
            <GroveAlertTitle>Trail open</GroveAlertTitle>
            <GroveAlertDescription>Soft underfoot. Brass tags are visible.</GroveAlertDescription>
          </GroveAlert>
          <GroveAlert variant="lantern">
            <GroveAlertIcon>
              <Flame />
            </GroveAlertIcon>
            <GroveAlertTitle>Low wick</GroveAlertTitle>
            <GroveAlertDescription>East path lanterns 4 through 6 are out.</GroveAlertDescription>
          </GroveAlert>
          <GroveAlert variant="rust">
            <GroveAlertIcon>
              <Bird />
            </GroveAlertIcon>
            <GroveAlertTitle>Boardwalk closed</GroveAlertTitle>
            <GroveAlertDescription>Ice on the north span. Use the ridge path.</GroveAlertDescription>
          </GroveAlert>
        </div>
      )
    case "raven-empty-state":
      return (
        <RavenEmptyState
          title="No ravens yet"
          description="The ridge is quiet. Leave a note when the fog lifts."
          action={<Button variant="lantern">Leave a note</Button>}
        />
      )
    case "raven-mark":
      return (
        <div className="flex flex-col gap-4">
          <RavenMark className="text-3xl" />
          <RavenMark wordmark={false} className="text-5xl text-primary" />
        </div>
      )
    default:
      return null
  }
}

export { Showcase }
