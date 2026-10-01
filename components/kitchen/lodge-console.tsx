"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BookOpen,
  Flame,
  Leaf,
  Moon,
  SearchIcon,
  Trees,
  Users,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { ThemeToggle } from "@/components/site/theme-toggle"
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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ForestCard } from "@/registry/ravenwood/forest-card"
import {
  GroveAlert,
  GroveAlertDescription,
  GroveAlertIcon,
  GroveAlertTitle,
} from "@/registry/ravenwood/grove-alert"
import { HollowInput } from "@/registry/ravenwood/hollow-input"
import { PageShell } from "@/registry/ravenwood/page-shell"
import { RavenEmptyState } from "@/registry/ravenwood/raven-empty-state"

const guests = [
  { name: "Mara Ell", cabin: "Hemlock", meal: "Hearth", status: "In" },
  { name: "Ivo Hart", cabin: "Yew", meal: "Pack", status: "Due" },
  { name: "Nessa Cole", cabin: "Cedar", meal: "Hearth", status: "In" },
  { name: "Tomlin Ward", cabin: "Alder", meal: "None", status: "Out" },
  { name: "Sera Quinn", cabin: "Birch", meal: "Hearth", status: "In" },
  { name: "Hal Voss", cabin: "Pine", meal: "Pack", status: "Due" },
  { name: "Edie Marsh", cabin: "Rowan", meal: "Hearth", status: "In" },
  { name: "Jon Pell", cabin: "Ash", meal: "None", status: "Out" },
]

const checkInSchema = z.object({
  name: z.string().min(2, "A name, even a trail name."),
  cabin: z.string().min(1, "Choose a cabin."),
  meal: z.enum(["hearth", "pack", "none"]),
  lantern: z.boolean(),
})

type CheckIn = z.infer<typeof checkInSchema>

const pageSize = 4

function statusBadge(status: string) {
  if (status === "In") return <Badge variant="moss">In</Badge>
  if (status === "Due") return <Badge variant="lantern">Due</Badge>
  return <Badge variant="outline">Out</Badge>
}

function LodgeConsole() {
  const [page, setPage] = React.useState(1)
  const [openCheckIn, setOpenCheckIn] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [hash, setHash] = React.useState("grove")
  const pages = Math.ceil(guests.length / pageSize)
  const rows = guests.slice((page - 1) * pageSize, page * pageSize)

  const form = useForm<CheckIn>({
    resolver: zodResolver(checkInSchema),
    defaultValues: { name: "", cabin: "", meal: "hearth", lantern: true },
  })

  React.useEffect(() => {
    const read = () => setHash(window.location.hash.replace("#", "") || "grove")
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  const items = [
    { title: "Grove", href: "/kitchen#grove", icon: Trees, active: hash === "grove" },
    { title: "Hearth", href: "/kitchen#hearth", icon: Flame, active: hash === "hearth" },
    { title: "Guests", href: "/kitchen#guests", icon: Users, active: hash === "guests" },
    { title: "Ledger", href: "/kitchen#ledger", icon: BookOpen, active: hash === "ledger" },
    { title: "Notes", href: "/kitchen#notes", icon: Moon, active: hash === "notes" },
  ]

  return (
    <PageShell
      title="North Cabin"
      items={items}
      footer={
        <p className="px-2 pb-2 text-xs text-muted-foreground">Fog, 46°. East wind.</p>
      }
    >
      <div className="flex min-w-0 flex-col gap-6 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Breadcrumb className="mr-auto min-w-0">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Ravenwood</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>North Cabin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              className="max-sm:size-11 max-sm:px-0"
              aria-label="Search"
              onClick={() => setCommandOpen(true)}
            >
              <SearchIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <ThemeToggle className="size-11 md:size-9" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/55 focus-visible:outline-none md:size-auto"
                  aria-label="Night clerk"
                >
                  <Avatar>
                    <AvatarFallback>NC</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Night clerk</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/docs">Component docs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Leave the desk</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div id="grove" className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl">Evening watch</h1>
            <p className="mt-1 max-w-xl text-muted-foreground">
              Thursday. Three lanterns still dark on the east path. The hearth is
              banked and the book is open.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button className="flex-1 sm:flex-none" onClick={() => setOpenCheckIn(true)}>
              Check in
            </Button>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  Trail notes
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>From the ridge</DrawerTitle>
                  <DrawerDescription>
                    Boardwalk is slick after dusk. Brass tags are still visible.
                  </DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        <GroveAlert variant="lantern">
          <GroveAlertIcon>
            <Flame />
          </GroveAlertIcon>
          <GroveAlertTitle>East path lanterns</GroveAlertTitle>
          <GroveAlertDescription>
            Numbers 4 through 6 are out. Wick stock is in the mudroom, left shelf.
          </GroveAlertDescription>
        </GroveAlert>

        <div id="hearth" className="grid gap-3 md:grid-cols-3">
          <ForestCard>
            <CardHeader>
              <CardTitle>Cabins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl">9 / 12</p>
              <p className="text-sm text-moss-foreground">Occupied under the canopy.</p>
            </CardContent>
          </ForestCard>
          <ForestCard>
            <CardHeader>
              <CardTitle>Hearth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl">Banked</p>
              <p className="text-sm text-moss-foreground">Coal enough for the night.</p>
            </CardContent>
          </ForestCard>
          <ForestCard>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trail</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground" aria-label="Trail condition">
                    <Leaf className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Soft, marked, open.</TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-serif text-3xl">Open</p>
                <p className="text-sm text-moss-foreground">Ridge path, not the span.</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Why
                  </Button>
                </PopoverTrigger>
                <PopoverContent>Ice on the north boardwalk. Send guests over the ridge.</PopoverContent>
              </Popover>
            </CardContent>
          </ForestCard>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div id="guests" className="min-w-0 rounded-2xl border border-border bg-card">
            <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl">Arrivals</h2>
              <Tabs defaultValue="today">
                <TabsList variant="line">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
                <TabsContent value="today" />
                <TabsContent value="week" />
              </Tabs>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Cabin</TableHead>
                  <TableHead className="hidden sm:table-cell">Meal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((guest) => (
                  <TableRow key={guest.name}>
                    <TableCell>{guest.name}</TableCell>
                    <TableCell>{guest.cabin}</TableCell>
                    <TableCell className="hidden sm:table-cell">{guest.meal}</TableCell>
                    <TableCell>{statusBadge(guest.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination className="justify-center px-3 py-3 sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#guests"
                    onClick={(event) => {
                      event.preventDefault()
                      setPage((current) => Math.max(1, current - 1))
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: pages }, (_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#guests"
                      isActive={page === index + 1}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage(index + 1)
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#guests"
                    onClick={(event) => {
                      event.preventDefault()
                      setPage((current) => Math.min(pages, current + 1))
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div id="ledger" className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Watch</h2>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      Stores
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Mudroom stores</SheetTitle>
                      <SheetDescription>Counted at dusk.</SheetDescription>
                    </SheetHeader>
                    <ul className="grid gap-2 px-4 text-sm">
                      <li className="flex justify-between">
                        <span>Lamp oil</span>
                        <span className="text-muted-foreground">6 tins</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Wicks</span>
                        <span className="text-muted-foreground">14</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Dry cedar</span>
                        <span className="text-muted-foreground">half a rack</span>
                      </li>
                    </ul>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Label htmlFor="timer">Lanterns on a timer</Label>
                <Switch id="timer" defaultChecked />
              </div>
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="ridge">
                  <AccordionTrigger>Ridge report</AccordionTrigger>
                  <AccordionContent>
                    Fog sitting in the ravine. The brass tags catch a lamp from
                    twenty paces.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="hearth-note">
                  <AccordionTrigger>Hearth note</AccordionTrigger>
                  <AccordionContent>Do not feed it after the second bell.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div id="notes" className="rounded-2xl border border-border bg-card">
              <RavenEmptyState
                className="py-8"
                title="No new ravens"
                description="The ridge is quiet. Notes land here when someone writes one."
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openCheckIn} onOpenChange={setOpenCheckIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check in</DialogTitle>
            <DialogDescription>Write them into the night book.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((values) => {
                toast.success(`${values.name} has Hemlock's key.`)
                setOpenCheckIn(false)
                form.reset()
              })}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <HollowInput placeholder="Trail name is fine" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cabin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabin</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hemlock">Hemlock</SelectItem>
                        <SelectItem value="cedar">Cedar</SelectItem>
                        <SelectItem value="yew">Yew</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-2"
                      >
                        {[
                          ["hearth", "Hearth"],
                          ["pack", "Pack"],
                          ["none", "None"],
                        ].map(([value, label]) => (
                          <div key={value} className="flex items-center gap-2">
                            <RadioGroupItem value={value} id={`meal-${value}`} />
                            <Label htmlFor={`meal-${value}`}>{label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lantern"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel>Leave a lantern by the door</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Write the book</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command>
          <CommandInput placeholder="Search the grove" />
          <CommandList>
            <CommandEmpty>No path by that name.</CommandEmpty>
            <CommandGroup heading="Jump">
              <CommandItem
                onSelect={() => {
                  window.location.hash = "guests"
                  setCommandOpen(false)
                }}
              >
                Guests
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  window.location.hash = "ledger"
                  setCommandOpen(false)
                }}
              >
                Ledger
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  window.location.assign("/docs")
                }}
              >
                Component docs
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </PageShell>
  )
}

export { LodgeConsole }
