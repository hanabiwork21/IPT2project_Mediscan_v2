"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAdmins, addAdmin, updateAdmin, deleteAdmin, getCurrentUser, resetAllData } from "@/utils/storage"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Plus, Shield, RotateCcw } from "lucide-react"
import type { Admin } from "@/utils/storage"

export default function AdminManagementPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({ username: "", password: "", role: "Doctor" as const })
  const [editFormData, setEditFormData] = useState({ username: "", role: "Doctor" as const })
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    // Check if user is admin
    if (!user || user.role !== "Admin") {
      router.push("/dashboard")
      return
    }
    // Load admins directly here instead of calling a function
    setAdmins(getAdmins())
  }, [router]) // Empty dependency array - only run once on mount

  const handleAddAdmin = () => {
    setError("")
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Username and password are required")
      return
    }

    if (getAdmins().some((a) => a.username === formData.username)) {
      setError("Username already exists")
      return
    }

    addAdmin(formData.username, formData.password, formData.role, currentUser?.username)
    setFormData({ username: "", password: "", role: "Doctor" })
    setIsOpen(false)
    setAdmins(getAdmins())
  }

  const handleEditAdmin = () => {
    setError("")
    if (!editFormData.username.trim()) {
      setError("Username is required")
      return
    }

    if (selectedAdmin && editFormData.username !== selectedAdmin.username) {
      if (getAdmins().some((a) => a.username === editFormData.username)) {
        setError("Username already exists")
        return
      }
    }

    if (selectedAdmin) {
      updateAdmin(selectedAdmin.id, {
        username: editFormData.username,
        role: editFormData.role,
      })
      setIsEditOpen(false)
      setSelectedAdmin(null)
      setAdmins(getAdmins())
    }
  }

  const handleDeleteAdmin = () => {
    if (adminToDelete) {
      deleteAdmin(adminToDelete)
      setIsDeleteOpen(false)
      setAdminToDelete(null)
      setSelectedAdmin(null)
      setAdmins(getAdmins())
    }
  }

  const handleResetData = () => {
    resetAllData()
    setIsResetOpen(false)
    setAdmins(getAdmins())
    // Redirect to login after reset
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin)
    setEditFormData({ username: admin.username, role: admin.role })
    setError("")
    setIsEditOpen(true)
  }

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin)
    setAdminToDelete(admin.id)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage administrator accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => setIsResetOpen(true)} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset All Data
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin Account</DialogTitle>
                <DialogDescription>Add a new administrator to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <select
                    id="new-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                  </select>
                </div>
                <Button onClick={handleAddAdmin} className="w-full">
                  Create Admin
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>Total admins: {admins.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Username</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Created At</th>
                  <th className="text-left py-3 px-4 font-semibold">Created By</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{admin.username}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{admin.createdBy || "System"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(admin)} className="gap-1">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(admin)}
                          className="gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Reset All Data</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all patients, scans, and admin accounts. The system will be reset to default
            state with only the default admin and doctor accounts. This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleResetData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset All Data
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Account</DialogTitle>
            <DialogDescription>Update administrator details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                placeholder="Enter username"
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>
            <Button onClick={handleEditAdmin} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the admin account "{selectedAdmin?.username}"? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
