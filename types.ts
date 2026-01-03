
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  HALF_DAY = 'Half-day',
  LEAVE = 'Leave'
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export type DashboardWidget = 'streak' | 'leaves' | 'balance' | 'team' | 'hours' | 'summary' | 'activity' | 'provisions' | 'approvals' | 'alerts';

export interface DashboardConfig {
  role: UserRole;
  visibleWidgets: DashboardWidget[];
}

export interface Notification {
  id: string;
  recipientId: string | 'ADMIN_ALL';
  subject: string;
  body: string;
  timestamp: string;
  type: 'security' | 'payroll' | 'leave' | 'system';
  read: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  employeeId: string;
  jobTitle: string;
  department: string;
  joinDate: string;
  createdAt: string;
  salary: number;
  phone: string;
  address: string;
  profilePicture?: string;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Paid' | 'Sick' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  adminComment?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'Paid' | 'Pending';
}