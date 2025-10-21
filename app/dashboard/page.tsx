"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPatients, getScans } from "@/utils/storage"
import { Users, FileText, Clock, CheckCircle, Monitor } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    pendingScans: 0,
    reviewedScans: 0,
  })

  useEffect(() => {
    const patients = getPatients()
    const scans = getScans()

    setStats({
      totalPatients: patients.length,
      totalScans: scans.length,
      pendingScans: scans.filter((s) => s.status === "Pending").length,
      reviewedScans: scans.filter((s) => s.status === "Reviewed").length,
    })
  }, [])

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Review",
      value: stats.pendingScans,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Reviewed",
      value: stats.reviewedScans,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your medical scanning system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a
            href="/patients"
            className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-accent"
          >
            <Users className="h-8 w-8 text-primary" />
            <span className="font-medium">Register Patient</span>
          </a>
          <a
            href="/upload"
            className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-accent"
          >
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-medium">Upload Scan</span>
          </a>
          <a
            href="/monitor"
            className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-accent"
          >
            <Monitor className="h-8 w-8 text-primary" />
            <span className="font-medium">Monitor Scans</span>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
