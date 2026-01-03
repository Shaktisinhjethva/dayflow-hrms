
import { Employee, UserRole, AttendanceStatus, LeaveStatus, AttendanceRecord, LeaveRequest } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'admin-primary',
    name: 'System Administrator',
    email: 'Admin123@gmail.com',
    password: 'Admin@123',
    role: UserRole.ADMIN,
    employeeId: 'SYS-001',
    jobTitle: 'IT Head',
    department: 'IT & Administration',
    joinDate: '2024-01-01',
    createdAt: '2024-01-01 08:00:00',
    salary: 12000,
    phone: '+1 800-ADMIN',
    address: 'System Headquarters',
    profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    status: 'ACTIVE'
  },
  {
    id: '1',
    name: 'Alex Rivera',
    email: 'alex@dayflow.com',
    password: 'password',
    role: UserRole.ADMIN,
    employeeId: 'HR-001',
    jobTitle: 'HR Director',
    department: 'Human Resources',
    joinDate: '2022-01-15',
    createdAt: '2022-01-15 09:00:00',
    salary: 8500,
    phone: '+1 555-0101',
    address: '123 Pine St, San Francisco, CA',
    profilePicture: 'https://picsum.photos/seed/alex/200',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@dayflow.com',
    password: 'password',
    role: UserRole.EMPLOYEE,
    employeeId: 'ENG-042',
    jobTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    joinDate: '2023-03-10',
    createdAt: '2023-03-10 10:30:00',
    salary: 7200,
    phone: '+1 555-0102',
    address: '456 Oak Ln, Austin, TX',
    profilePicture: 'https://picsum.photos/seed/sarah/200',
    status: 'ACTIVE'
  }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', employeeId: '2', date: '2024-05-20', checkIn: '09:00', checkOut: '17:30', status: AttendanceStatus.PRESENT },
  { id: 'a2', employeeId: '2', date: '2024-05-21', checkIn: '08:55', checkOut: '18:00', status: AttendanceStatus.PRESENT },
  { id: 'a3', employeeId: '2', date: '2024-05-22', checkIn: '09:15', checkOut: null, status: AttendanceStatus.PRESENT }
];

export const MOCK_LEAVES: LeaveRequest[] = [
  { id: 'l1', employeeId: '2', type: 'Sick', startDate: '2024-06-01', endDate: '2024-06-02', reason: 'Flu symptoms', status: LeaveStatus.PENDING }
];
