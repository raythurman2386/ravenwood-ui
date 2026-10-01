"use client"

import * as React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RavenMark } from "./raven-mark"

type PageShellItem = {
  title: string
  href: string
  icon: LucideIcon
  active?: boolean
}

function PageShell({
  title = "Ravenwood",
  items,
  children,
  footer,
}: {
  title?: string
  items: PageShellItem[]
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 py-4">
            <RavenMark
              title={title}
              className="px-1 text-base group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:[&>span:last-child]:hidden"
            />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-w-0 bg-transparent">
          <header className="flex min-h-12 items-center gap-2 border-b border-border px-3 pt-[env(safe-area-inset-top)]">
            <SidebarTrigger className="size-11 md:size-9" />
            <Separator orientation="vertical" className="h-4" />
            <p className="min-w-0 truncate font-serif text-sm tracking-tight text-muted-foreground">
              {title}
            </p>
          </header>
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export { PageShell, type PageShellItem }
