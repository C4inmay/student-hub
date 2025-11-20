export type UserRole = "student" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  uid: string;
  email: string;
  year: number;
  branch: string;
  major: string;
  cgpa: number;
  skills: string[];
  profilePicture?: string;
  certificates: Array<{ name: string; issuer: string; date: string }>;
  internships: Array<{ company: string; role: string; duration: string }>;
  hackathons: Array<{ name: string; position: string; date: string }>;
  sports: Array<{ sport: string; achievement: string; year: string }>;
  extracurricular: Array<{ activity: string; role: string; year: string }>;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}
