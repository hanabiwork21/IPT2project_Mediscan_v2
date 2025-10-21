"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setCurrentUser, authenticateAdmin, getAdmins, addAdmin } from "@/utils/storage"
import { Activity, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Initialize default admin accounts on first load
  useEffect(() => {
    const admins = getAdmins()
    if (admins.length === 0) {
      addAdmin("admin", "admin123", "Admin", "System")
      addAdmin("doctor", "doctor123", "Doctor", "System")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password")
      setIsLoading(false)
      return
    }

    const admin = authenticateAdmin(username, password)
    if (!admin) {
      setError("Invalid username or password")
      setIsLoading(false)
      return
    }

    setCurrentUser({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    })
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">MediScan Portal</CardTitle>
            <CardDescription className="text-base mt-2">CT-Scan & X-Ray Monitoring System</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <p>Admin: admin / admin123</p>
              <p>Doctor: doctor / doctor123</p>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
