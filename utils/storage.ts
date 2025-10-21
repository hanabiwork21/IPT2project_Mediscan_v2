// localStorage utility functions for managing app data

const isLocalStorageAvailable = (): boolean => {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined"
  } catch {
    return false
  }
}

export interface Patient {
  id: string
  name: string
  age: number
  patientId: string
  contactNumber: string
  gender?: "Male" | "Female" | "Other" | "Prefer not to say"
  notes?: string
  createdAt: string
}

export interface Scan {
  id: string
  patientId: string
  patientName: string
  scanType: "CT" | "X-Ray"
  imageData: string
  status: "Pending" | "Reviewed" | "Requires Follow-up"
  uploadedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface User {
  id: string
  username: string
  role: "Admin" | "Doctor"
  password?: string
}

export interface Admin {
  id: string
  username: string
  password: string // hashed password
  role: "Admin" | "Doctor"
  createdAt: string
  createdBy?: string
}

// Simple password hashing (for demo purposes - use bcrypt in production)
const hashPassword = (password: string): string => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash
}

// User Management
export const setCurrentUser = (user: User): void => {
  if (isLocalStorageAvailable()) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  }
}

export const getCurrentUser = (): User | null => {
  if (!isLocalStorageAvailable()) return null
  const user = localStorage.getItem("currentUser")
  return user ? JSON.parse(user) : null
}

export const logout = (): void => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem("currentUser")
  }
}

// Admin Management
export const getAdmins = (): Admin[] => {
  if (!isLocalStorageAvailable()) return []
  const admins = localStorage.getItem("admins")
  return admins ? JSON.parse(admins) : []
}

export const addAdmin = (username: string, password: string, role: "Admin" | "Doctor", createdBy?: string): Admin => {
  const admins = getAdmins()
  const newAdmin: Admin = {
    id: `ADMIN-${Date.now()}`,
    username,
    password: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
    createdBy,
  }
  admins.push(newAdmin)
  if (isLocalStorageAvailable()) {
    localStorage.setItem("admins", JSON.stringify(admins))
  }
  return newAdmin
}

export const getAdminByUsername = (username: string): Admin | undefined => {
  const admins = getAdmins()
  return admins.find((a) => a.username === username)
}

export const authenticateAdmin = (username: string, password: string): Admin | null => {
  const admin = getAdminByUsername(username)
  if (!admin) return null
  if (!verifyPassword(password, admin.password)) return null
  return admin
}

export const updateAdmin = (id: string, updates: Partial<Omit<Admin, "id" | "createdAt">>): Admin | null => {
  const admins = getAdmins()
  const index = admins.findIndex((a) => a.id === id)
  if (index === -1) return null

  if (updates.password) {
    updates.password = hashPassword(updates.password)
  }

  admins[index] = { ...admins[index], ...updates }
  if (isLocalStorageAvailable()) {
    localStorage.setItem("admins", JSON.stringify(admins))
  }
  return admins[index]
}

export const deleteAdmin = (id: string): boolean => {
  const admins = getAdmins()
  const filtered = admins.filter((a) => a.id !== id)
  if (filtered.length === admins.length) return false
  if (isLocalStorageAvailable()) {
    localStorage.setItem("admins", JSON.stringify(filtered))
  }
  return true
}

export const changeAdminPassword = (id: string, oldPassword: string, newPassword: string): boolean => {
  const admin = getAdmins().find((a) => a.id === id)
  if (!admin) return false
  if (!verifyPassword(oldPassword, admin.password)) return false

  updateAdmin(id, { password: newPassword })
  return true
}

// Patient Management
export const getPatients = (): Patient[] => {
  if (!isLocalStorageAvailable()) return []
  const patients = localStorage.getItem("patients")
  return patients ? JSON.parse(patients) : []
}

export const addPatient = (patient: Omit<Patient, "id" | "createdAt">): Patient => {
  const patients = getPatients()
  const newPatient: Patient = {
    ...patient,
    id: `PAT-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  patients.push(newPatient)
  if (isLocalStorageAvailable()) {
    localStorage.setItem("patients", JSON.stringify(patients))
  }
  return newPatient
}

export const getPatientById = (id: string): Patient | undefined => {
  const patients = getPatients()
  return patients.find((p) => p.id === id)
}

export const updatePatient = (id: string, updates: Partial<Omit<Patient, "id" | "createdAt">>): Patient | null => {
  const patients = getPatients()
  const index = patients.findIndex((p) => p.id === id)
  if (index === -1) return null

  patients[index] = { ...patients[index], ...updates }
  if (isLocalStorageAvailable()) {
    localStorage.setItem("patients", JSON.stringify(patients))
  }

  if (updates.name) {
    const scans = getScans()
    const updatedScans = scans.map((scan) => (scan.patientId === id ? { ...scan, patientName: updates.name } : scan))
    if (isLocalStorageAvailable()) {
      localStorage.setItem("scans", JSON.stringify(updatedScans))
    }
  }

  return patients[index]
}

// Scan Management
export const getScans = (): Scan[] => {
  if (!isLocalStorageAvailable()) return []
  const scans = localStorage.getItem("scans")
  return scans ? JSON.parse(scans) : []
}

export const addScan = (scan: Omit<Scan, "id" | "uploadedAt">): Scan => {
  const scans = getScans()
  const newScan: Scan = {
    ...scan,
    id: `SCAN-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  }
  scans.push(newScan)
  if (isLocalStorageAvailable()) {
    localStorage.setItem("scans", JSON.stringify(scans))
  }
  return newScan
}

export const updateScan = (id: string, updates: Partial<Scan>): Scan | null => {
  const scans = getScans()
  const index = scans.findIndex((s) => s.id === id)
  if (index === -1) return null

  scans[index] = { ...scans[index], ...updates }
  if (isLocalStorageAvailable()) {
    localStorage.setItem("scans", JSON.stringify(scans))
  }
  return scans[index]
}

export const getScansByPatient = (patientId: string): Scan[] => {
  const scans = getScans()
  return scans.filter((s) => s.patientId === patientId)
}

export const resetAllData = (): void => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem("patients")
    localStorage.removeItem("scans")
    localStorage.removeItem("admins")
    localStorage.removeItem("currentUser")
  }

  // Reinitialize with default admin accounts
  addAdmin("admin", "admin123", "Admin", "System")
  addAdmin("doctor", "doctor123", "Doctor", "System")
}
