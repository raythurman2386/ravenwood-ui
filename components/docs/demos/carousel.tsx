"use client"

import * as React from "react"
import {
  ActivityIcon,
  BellIcon,
  GitBranchIcon,
  KeyRoundIcon,
  ScrollTextIcon,
  TimerIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const notes = [
  { title: "Sync", body: "Pulled 412 records. Two skipped." },
  { title: "Backup", body: "Snapshot written to cold storage." },
  { title: "Deploy", body: "Preview is up. Waiting on review." },
  { title: "Audit", body: "Three keys rotated this week." },
  { title: "Cleanup", body: "Old artifacts pruned. 2.1 GB freed." },
]

function PlainDemo() {
  return (
    <div className="mx-auto w-full max-w-sm px-12">
      <Carousel aria-label="Run notes">
        <CarouselContent>
          {notes.map((note) => (
            <CarouselItem key={note.title}>
              <Card>
                <CardContent className="flex aspect-[4/3] flex-col justify-end gap-1">
                  <p className="font-serif text-2xl">{note.title}</p>
                  <p className="text-sm text-muted-foreground">{note.body}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

const features = [
  {
    icon: ActivityIcon,
    title: "Live status",
    body: "Every run reports in as it moves.",
  },
  {
    icon: ScrollTextIcon,
    title: "Readable logs",
    body: "Filter by level without leaving the run.",
  },
  {
    icon: TimerIcon,
    title: "Schedules",
    body: "Cron, intervals, or a single date.",
  },
  {
    icon: BellIcon,
    title: "Quiet alerts",
    body: "One message per failure, not per retry.",
  },
  {
    icon: GitBranchIcon,
    title: "Branch previews",
    body: "Each branch gets its own runs desk.",
  },
  {
    icon: KeyRoundIcon,
    title: "Scoped keys",
    body: "Tokens limited to one project.",
  },
]

function ResponsiveDemo() {
  return (
    <div className="w-full px-12">
      <Carousel aria-label="Features" itemsPerView={{ base: 1, md: 2, lg: 3 }}>
        <CarouselContent>
          {features.map((feature) => (
            <CarouselItem key={feature.title}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-2">
                  <feature.icon className="size-5 text-primary dark:text-moss-foreground" />
                  <p className="font-serif text-lg">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.body}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

const testimonials = [
  {
    quote: "The runs desk replaced three dashboards and a spreadsheet.",
    name: "Mara Lind",
    role: "Platform lead",
  },
  {
    quote: "Failures show up once, with the log line that matters.",
    name: "Ozzie Grant",
    role: "On-call engineer",
  },
  {
    quote: "Our previews finally look like the product.",
    name: "Juniper Hale",
    role: "Design engineer",
  },
  {
    quote: "Keys scoped per project closed our last audit finding.",
    name: "Theo Banks",
    role: "Security",
  },
]

function TestimonialDemo() {
  return (
    <div className="mx-auto w-full max-w-lg px-12">
      <Carousel
        aria-label="Testimonials"
        transition="fade"
        autoplay={{ delay: 6000, playOnInit: false }}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {testimonials.map((item) => (
            <CarouselItem key={item.name}>
              <Card>
                <CardContent className="flex min-h-44 flex-col justify-between gap-4 pr-12">
                  <blockquote className="font-serif text-xl leading-snug">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <p className="text-sm text-muted-foreground">
                    {item.name}, {item.role}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

function CarouselDemo({ example = "plain" }: { example?: string }) {
  switch (example) {
    case "responsive":
      return <ResponsiveDemo />
    case "testimonials":
      return <TestimonialDemo />
    default:
      return <PlainDemo />
  }
}

export { CarouselDemo }
