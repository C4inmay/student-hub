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
  cgpa: number;
  skills: string[];
  profilePicture?: string;
  certificates: Array<{ title: string; category: string; year: string; proofLink: string }>;
  internships: Array<{ company: string; role: string; duration: string }>;
  hackathons: Array<{ eventName: string; position: string; year: string }>;
  sports: Array<{ sport: string; level: string; position: string }>;
  extracurricular: Array<{ activityName: string; year: string }>;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}
