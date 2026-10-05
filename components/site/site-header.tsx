"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { ThemeToggle } from "@/components/site/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { catalog, catalogGroups } from "@/lib/catalog"
import { RavenMark } from "@/registry/ravenwood/raven-mark"

function SiteHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <Link
          href="/"
          aria-label="Ravenwood home"
          className="inline-flex h-11 shrink-0 items-center md:h-9"
        >
          <RavenMark className="text-sm [&_svg]:size-4 [&>span:last-child]:text-sm [&>span:last-child]:leading-none max-[22rem]:[&>span:last-child]:hidden" />
        </Link>
        <NavigationMenu viewport={false} className="hidden md:flex">
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
              <NavigationMenuTrigger className="[&_svg]:top-0">
                Components
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="max-h-[min(24rem,70dvh)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {catalogGroups.map((group) => (
                      <div key={group}>
                        <p className="px-2 pb-1 text-xs text-muted-foreground">
                          {group}
                        </p>
                        <ul>
                          {catalog
                            .filter((item) => item.group === group)
                            .slice(0, 3)
                            .map((item) => (
                              <li key={item.slug}>
                                <NavigationMenuLink asChild>
                                  <Link href={`/docs/${item.slug}`}>
                                    {item.title}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <NavigationMenuLink asChild>
                    <Link href="/docs" className="mt-2">
                      All components
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/kitchen">Runs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/motion">Motion</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle className="size-11 md:size-9" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 md:hidden"
                aria-label="Open menu"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="gap-0">
              <SheetHeader>
                <SheetTitle>
                  <RavenMark className="text-base" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3 pb-6">
                {[
                  ["/", "Home"],
                  ["/docs", "Docs"],
                  ["/kitchen", "Runs"],
                  ["/motion", "Motion"],
                ].map(([href, label]) => (
                  <SheetClose asChild key={href}>
                    <Link
                      href={href}
                      className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
