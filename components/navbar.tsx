"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, type User } from "@/utils/storage"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  if (!user) return null

  return (
    <div className="flex h-16 items-center justify-between border-b bg-card px-8">
      <div>
        <h2 className="text-xl font-semibold">Welcome back, {user.username}</h2>
        <p className="text-sm text-muted-foreground">Manage your medical scans efficiently</p>
      </div>
      <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
        {user.role}
      </Badge>
    </div>
  )
}
