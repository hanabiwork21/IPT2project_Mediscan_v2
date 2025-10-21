"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { addPatient, getPatients, type Patient } from "@/utils/storage"
import { UserPlus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const generatePatientId = (): string => {
  const patients = getPatients()
  const nextNumber = patients.length + 1
  return `P-${String(nextNumber).padStart(5, "0")}`
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    patientId: "",
    contactNumber: "",
    gender: "",
  })

  useEffect(() => {
    loadPatients()
    setFormData((prev) => ({ ...prev, patientId: generatePatientId() }))
  }, [])

  const loadPatients = () => {
    setPatients(getPatients())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPatient({
      name: formData.name,
      age: Number.parseInt(formData.age),
      patientId: formData.patientId,
      contactNumber: formData.contactNumber,
      gender: (formData.gender as "Male" | "Female" | "Other" | "Prefer not to say") || undefined,
    })
    setFormData({ name: "", age: "", patientId: generatePatientId(), contactNumber: "", gender: "" })
    loadPatients()
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <p className="text-muted-foreground mt-1">Register and manage patient information</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Register New Patient
            </CardTitle>
            <CardDescription>Enter patient details to create a new record</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input id="patientId" value={formData.patientId} readOnly className="bg-muted cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Register Patient
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Registered Patients</CardTitle>
            <CardDescription>View and search existing patient records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No patients found" : "No patients registered yet"}
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div key={patient.id} className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>Age: {patient.age}</span>
                          <span>•</span>
                          {patient.gender && (
                            <>
                              <span>Gender: {patient.gender}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{patient.contactNumber}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{patient.patientId}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
