import { SiteHeader } from "@/components/site/site-header"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh min-w-0 overflow-x-clip pb-[env(safe-area-inset-bottom)]">
      <SiteHeader />
      {children}
    </div>
  )
}
