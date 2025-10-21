"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Users, Upload, Monitor, FileText, LogOut, Shield, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout, getCurrentUser } from "@/utils/storage"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = getCurrentUser()

  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "Patients", href: "/dashboard/patients", icon: Users },
    { name: "Upload Scan", href: "/dashboard/upload", icon: Upload },
    { name: "Monitor Scans", href: "/dashboard/monitor", icon: Monitor },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
  ]

  const navigation =
    currentUser?.role === "Admin"
      ? [...baseNavigation, { name: "Admin Management", href: "/dashboard/admin", icon: Shield }]
      : baseNavigation

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">MediScan</h1>
          <p className="text-xs text-muted-foreground">Monitoring System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t space-y-1 p-4">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
