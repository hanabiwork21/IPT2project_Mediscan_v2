"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  getScans,
  getCurrentUser,
  updateScan,
  type Scan,
  getPatientById,
  updatePatient,
  type Patient,
} from "@/utils/storage"
import { Search, Eye, Filter, CheckCircle, AlertCircle, Edit2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function MonitorPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [reviewStatus, setReviewStatus] = useState<"Reviewed" | "Requires Follow-up">("Reviewed")
  const [reviewNotes, setReviewNotes] = useState("")
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editFormData, setEditFormData] = useState({ name: "", age: "", contactNumber: "" })
  const [editingScanStatus, setEditingScanStatus] = useState<Scan | null>(null)
  const [editScanStatusValue, setEditScanStatusValue] = useState<"Pending" | "Reviewed" | "Requires Follow-up">(
    "Pending",
  )

  useEffect(() => {
    loadScans()
    setUser(getCurrentUser())
  }, [])

  const loadScans = () => {
    setScans(getScans())
  }

  const handleReview = () => {
    if (!selectedScan || !user) return

    updateScan(selectedScan.id, {
      status: reviewStatus,
      reviewedBy: user.username,
      reviewedAt: new Date().toISOString(),
      notes: reviewNotes,
    })

    setReviewNotes("")
    setReviewStatus("Reviewed")
    setSelectedScan(null)
    loadScans()
  }

  const handleEditPatient = () => {
    if (!selectedScan) return
    const patient = getPatientById(selectedScan.patientId)
    if (patient) {
      setEditingPatient(patient)
      setEditFormData({
        name: patient.name,
        age: patient.age.toString(),
        contactNumber: patient.contactNumber,
      })
    }
  }

  const handleSavePatient = () => {
    if (!editingPatient) return

    updatePatient(editingPatient.id, {
      name: editFormData.name,
      age: Number.parseInt(editFormData.age),
      contactNumber: editFormData.contactNumber,
    })

    setEditingPatient(null)
    loadScans()
  }

  const handleEditScanStatus = (scan: Scan) => {
    setEditingScanStatus(scan)
    setEditScanStatusValue(scan.status)
  }

  const handleSaveScanStatus = () => {
    if (!editingScanStatus) return

    updateScan(editingScanStatus.id, {
      status: editScanStatusValue,
    })

    setEditingScanStatus(null)
    loadScans()
  }

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.scanType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || scan.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Monitor Scans</h1>
        <p className="text-muted-foreground mt-1">View and manage all medical scans</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Scan Management</CardTitle>
          <CardDescription>Filter and search through all uploaded scans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or scan type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Requires Follow-up">Requires Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Patient Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Scan Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredScans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        {searchTerm || statusFilter !== "all" ? "No scans found" : "No scans uploaded yet"}
                      </td>
                    </tr>
                  ) : (
                    filteredScans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{scan.patientName}</td>
                        <td className="px-4 py-3">{scan.scanType}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(scan.uploadedAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedScan(scan)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditScanStatus(scan)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>View medical scan information and image</DialogDescription>
          </DialogHeader>
          {selectedScan && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-medium">{selectedScan.patientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Scan Type</p>
                  <p className="font-medium">{selectedScan.scanType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Upload Date</p>
                  <p className="font-medium">{formatDate(selectedScan.uploadedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={getStatusColor(selectedScan.status)}>
                    {selectedScan.status}
                  </Badge>
                </div>
              </div>

              {selectedScan.reviewedBy && (
                <div className="rounded-lg bg-secondary p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reviewed By:</span>
                    <span className="font-medium">{selectedScan.reviewedBy}</span>
                  </div>
                  {selectedScan.reviewedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reviewed At:</span>
                      <span className="font-medium">{formatDate(selectedScan.reviewedAt)}</span>
                    </div>
                  )}
                  {selectedScan.notes && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <p className="text-sm">{selectedScan.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Medical Image</p>
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={selectedScan.imageData || "/placeholder.svg"}
                    alt={`${selectedScan.scanType} scan`}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <Button variant="outline" onClick={handleEditPatient} className="w-full bg-transparent">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Patient Information
              </Button>

              {user?.role === "Doctor" && selectedScan.status === "Pending" && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Review Scan</CardTitle>
                    <CardDescription>Update the scan status and add review notes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Review Status</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setReviewStatus("Reviewed")}
                          className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                            reviewStatus === "Reviewed"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-border bg-card hover:border-green-300"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Reviewed
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewStatus("Requires Follow-up")}
                          className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                            reviewStatus === "Requires Follow-up"
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-border bg-card hover:border-red-300"
                          }`}
                        >
                          <AlertCircle className="h-4 w-4" />
                          Requires Follow-up
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Review Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any observations or recommendations..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button className="w-full" onClick={handleReview}>
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogDescription>Update patient details</DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Patient Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter patient name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  placeholder="Enter age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact Number</Label>
                <Input
                  id="edit-contact"
                  value={editFormData.contactNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingPatient(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSavePatient} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingScanStatus} onOpenChange={() => setEditingScanStatus(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Scan Status</DialogTitle>
            <DialogDescription>Change the status of the medical scan</DialogDescription>
          </DialogHeader>
          {editingScanStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <p className="font-medium text-sm">{editingScanStatus.patientName}</p>
              </div>

              <div className="space-y-2">
                <Label>Scan Type</Label>
                <p className="font-medium text-sm">{editingScanStatus.scanType}</p>
              </div>

              <div className="space-y-2">
                <Label>Current Status</Label>
                <Badge variant="outline" className={getStatusColor(editingScanStatus.status)}>
                  {editingScanStatus.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-select">New Status</Label>
                <Select value={editScanStatusValue} onValueChange={(value: any) => setEditScanStatusValue(value)}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Requires Follow-up">Requires Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingScanStatus(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveScanStatus} className="flex-1">
                  Save Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
