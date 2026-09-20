export type UserRole = 'student' | 'admin' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  avatar: string;
  phone?: string;
}

export type ComplaintCategory =
  | 'Hostel & Housing'
  | 'Academic & Exams'
  | 'Infrastructure & Facilities'
  | 'Mess & Dining'
  | 'IT & Wi-Fi'
  | 'Library Services'
  | 'Transportation'
  | 'Campus Safety & Security'
  | 'Financial & Accounts';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  note?: string;
  updatedBy: string;
  role: string;
  timestamp: string;
  proofAttachment?: string;
}

export interface ComplaintComment {
  id: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  isInternalOnly?: boolean;
}

export interface ComplaintAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'video' | 'document';
  url: string;
}

export interface Complaint {
  id: string; // e.g., CC-2024-108
  title: string;
  category: ComplaintCategory;
  priority: Priority;
  location: string;
  description: string;
  isAnonymous: boolean;
  studentId: string;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  updatedAt: string;
  status: ComplaintStatus;
  assignedDepartment: string;
  assignedStaff: string;
  slaHours: number;
  slaDueDate: string;
  isSlaBreached: boolean;
  timeline: TimelineEvent[];
  comments: ComplaintComment[];
  attachments: ComplaintAttachment[];
  rating?: number; // 1 to 5 stars
  feedbackText?: string;
  resolutionSummary?: string;
  officialProofImage?: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  status: string;
  priority: string;
  assignedDepartment: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  onlyMyComplaints: boolean;
  sortBy: 'newest' | 'oldest' | 'priority' | 'sla';
}

export interface SystemStats {
  totalComplaints: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  slaBreachCount: number;
  avgResolutionDays: number;
  satisfactionRate: number; // percentage
}
