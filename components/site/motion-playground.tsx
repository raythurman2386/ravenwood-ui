"use client"

import * as React from "react"
import { Flame } from "lucide-react"
import { MotionConfig } from "motion/react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function Demo({
  label,
  communicates,
  children,
}: {
  label: string
  communicates: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-3 border-t border-border pt-6">
      <div>
        <h3 className="font-heading text-lg">{label}</h3>
        <p className="text-sm text-muted-foreground">{communicates}</p>
      </div>
      <div className="rounded-xl border border-ring/35 bg-card p-4">
        {children}
      </div>
    </section>
  )
}

function MotionPlayground() {
  const [reduce, setReduce] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="font-heading text-base">Reduced motion</p>
          <p className="text-sm text-muted-foreground">
            Kills travel. The OS setting always wins on a real machine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="motion-reduce"
            checked={reduce}
            onCheckedChange={setReduce}
            aria-label="Reduce motion in this playground"
          />
          <Label htmlFor="motion-reduce">Reduce</Label>
        </div>
      </div>

      <MotionConfig reducedMotion={reduce ? "always" : "user"}>
        <div className={reduce ? "motion-reduce grid gap-8" : "grid gap-8"}>
          <Demo
            label="Button"
            communicates="Press confirmation. Size change on the way down, never on hover."
          >
            <div className="flex flex-wrap gap-2">
              <Button>Save</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost" size="icon" aria-label="Run">
                <Flame />
              </Button>
            </div>
          </Demo>

          <Demo
            label="Switch"
            communicates="The thumb travels. Snap, almost no overshoot."
          >
            <div className="flex items-center gap-2">
              <Switch id="path-open" defaultChecked />
              <Label htmlFor="path-open">Auto-retry</Label>
            </div>
          </Demo>

          <Demo
            label="Input"
            communicates="Focus is the ring. The caret stays still."
          >
            <Input placeholder="sync" aria-label="Run name" />
          </Demo>

          <Demo
            label="Tabs"
            communicates="The pill moves. Content crossfades. Hierarchy stays put."
          >
            <Tabs defaultValue="runs">
              <TabsList>
                <TabsTrigger value="runs">Runs</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="runs">4 runs succeeded.</TabsContent>
              <TabsContent value="logs">Last sync 2m ago.</TabsContent>
              <TabsContent value="notes">Worker idle.</TabsContent>
            </Tabs>
          </Demo>

          <Demo
            label="Menu"
            communicates="Origin: 6px from the trigger, then fade. Not a zoom from 50%."
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Retry</DropdownMenuItem>
                <DropdownMenuItem>Cancel</DropdownMenuItem>
                <DropdownMenuItem>Docs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Demo>

          <Demo
            label="Dialog"
            communicates="Scrim dims. Panel rises 6px. Title, then body, then actions."
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">New run</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New run</DialogTitle>
                  <DialogDescription>This starts a deploy.</DialogDescription>
                </DialogHeader>
                <Input placeholder="sync" aria-label="Run name" />
                <DialogFooter>
                  <Button>Run</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Demo>

          <Demo
            label="Accordion"
            communicates="Height by grid rows. The page does not jump while you read."
          >
            <Accordion type="single" collapsible defaultValue="a">
              <AccordionItem value="a">
                <AccordionTrigger>Deploy</AccordionTrigger>
                <AccordionContent>Running. Last sync 2m ago.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Index</AccordionTrigger>
                <AccordionContent>Exited with an error.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Demo>

          <Demo label="Skeleton" communicates="Something is still loading.">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Demo>

          <Demo
            label="Toast"
            communicates="Enters from the edge it lives on. No center scale."
          >
            <Button
              variant="outline"
              onClick={() =>
                toast("Saved", {
                  description: "Last sync 2m ago.",
                })
              }
            >
              Save
            </Button>
          </Demo>

          <Demo
            label="Command"
            communicates="Palette snaps open. First eight items stagger 40ms, then together."
          >
            <Button variant="outline" onClick={() => setCommandOpen(true)}>
              Filter logs
            </Button>
            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
              <Command>
                <CommandInput placeholder="Filter logs" />
                <CommandList>
                  <CommandEmpty>No matching logs.</CommandEmpty>
                  <CommandGroup heading="Jump">
                    <CommandItem>Runs</CommandItem>
                    <CommandItem>Logs</CommandItem>
                    <CommandItem>deploy</CommandItem>
                    <CommandItem>sync</CommandItem>
                    <CommandItem>backup</CommandItem>
                    <CommandItem>index</CommandItem>
                    <CommandItem>lint</CommandItem>
                    <CommandItem>Docs</CommandItem>
                    <CommandItem>Motion</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CommandDialog>
          </Demo>
        </div>
      </MotionConfig>
    </div>
  )
}

export { MotionPlayground }
