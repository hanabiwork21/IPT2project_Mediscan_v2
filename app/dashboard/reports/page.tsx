"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getScans, getPatients, getScansByPatient, type Scan, type Patient } from "@/utils/storage"
import { FileText, Download, TrendingUp, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>("all")
  const [filteredScans, setFilteredScans] = useState<Scan[]>([])

  useEffect(() => {
    const allScans = getScans()
    const allPatients = getPatients()
    setScans(allScans)
    setPatients(allPatients)
    setFilteredScans(allScans)
  }, [])

  useEffect(() => {
    if (selectedPatient === "all") {
      setFilteredScans(scans)
    } else {
      setFilteredScans(getScansByPatient(selectedPatient))
    }
  }, [selectedPatient, scans])

  const completedScans = filteredScans.filter((s) => s.status === "Reviewed")
  const pendingScans = filteredScans.filter((s) => s.status === "Pending")
  const followUpScans = filteredScans.filter((s) => s.status === "Requires Follow-up")

  const getStatusColor = (status: Scan["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Reviewed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Requires Follow-up":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalScans: filteredScans.length,
      completedScans: completedScans.length,
      pendingScans: pendingScans.length,
      followUpScans: followUpScans.length,
      scans: filteredScans,
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `medical-scans-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">View comprehensive scan reports and analytics</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>View reports for all patients or select a specific patient</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} ({patient.patientId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Scans</CardTitle>
            <div className="rounded-lg bg-green-50 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedScans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully reviewed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <div className="rounded-lg bg-orange-50 p-2">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingScans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting doctor review</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follow-up Required</CardTitle>
            <div className="rounded-lg bg-red-50 p-2">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{followUpScans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Complete list of all scans with their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredScans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No scans available</div>
            ) : (
              filteredScans.map((scan) => (
                <div key={scan.id} className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{scan.patientName}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {scan.scanType}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Uploaded: {formatDate(scan.uploadedAt)}
                        </span>
                        {scan.reviewedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Reviewed: {formatDate(scan.reviewedAt)}
                          </span>
                        )}
                        {scan.reviewedBy && <span>Reviewed by: {scan.reviewedBy}</span>}
                      </div>
                      {scan.notes && (
                        <div className="rounded-md bg-secondary p-3 text-sm">
                          <p className="font-medium text-xs text-muted-foreground mb-1">Review Notes:</p>
                          <p>{scan.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={scan.imageData || "/placeholder.svg"}
                        alt={`${scan.scanType} scan`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
