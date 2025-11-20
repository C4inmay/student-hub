export type EventCategory = "Seminar" | "Workshop" | "Competition" | "Guest Lecture";
export type AttendanceStatus = "Present" | "Absent";
export type CertificateStatus = "Generated" | "Pending";
export type NotificationUserType = "Student" | "Admin";
export type AdminRole = "SuperAdmin" | "DepartmentAdmin";

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  uid: string;
  year: string;
  branch: string;
  skills: string[];
  profilePicture?: string;
  createdAt: string;
}

export interface Event {
  id: number;
  deptId?: number | null;
  name: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  description?: string | null;
  createdBy?: number | null;
  createdAt: string;
}

export interface Registration {
  id: number;
  eventId: number;
  studentId: number;
  registrationDate: string;
}

export interface AttendanceRecord {
  id: number;
  eventId: number;
  studentId: number;
  scanTime: string;
  status: AttendanceStatus;
}

export interface CertificateRecord {
  id: number;
  eventId: number;
  studentId: number;
  certUrl: string;
  generatedAt: string;
  status: CertificateStatus;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  deptId?: number | null;
  createdAt: string;
}

export interface LogEntry {
  id: number;
  adminId?: number | null;
  action: string;
  eventId?: number | null;
  createdAt: string;
}

export interface NotificationRecord {
  id: number;
  userType: NotificationUserType;
  userId: number;
  message: string;
  createdAt: string;
  readStatus: boolean;
}
