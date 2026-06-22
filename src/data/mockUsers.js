import { ROLES } from '../utils/roles';

export { ROLES };

export const mockUsers = [
  {
    id: 'u-intern-001',
    name: 'Aarav Mehta',
    email: 'intern@test.com',
    password: '123456',
    role: ROLES.INTERN,
    department: 'Engineering',
    manager: 'Nisha Rao',
    designation: 'Frontend Intern',
    phone: '+91 98765 43210',
    skills: ['React', 'JavaScript', 'Material UI', 'Git'],
    joiningDate: '2026-06-01',
    college: 'National Institute of Technology, Surat',
    status: 'ACTIVE',
    experienceScore: 82
  },
  {
    id: 'u-manager-001',
    name: 'Nisha Rao',
    email: 'manager@test.com',
    password: '123456',
    role: ROLES.MANAGER,
    department: 'Engineering',
    designation: 'Engineering Manager',
    status: 'ACTIVE'
  },
  {
    id: 'u-hr-001',
    name: 'Kabir Sharma',
    email: 'hr@test.com',
    password: '123456',
    role: ROLES.HR,
    department: 'People Operations',
    designation: 'HR Specialist',
    status: 'ACTIVE'
  },
  {
    id: 'u-admin-001',
    name: 'Priya Nair',
    email: 'admin@test.com',
    password: '123456',
    role: ROLES.ADMIN,
    department: 'Platform',
    designation: 'System Admin',
    status: 'ACTIVE'
  },
  {
    id: 'u-intern-002',
    name: 'Sara Khan',
    email: 'sara.intern@test.com',
    password: '123456',
    role: ROLES.INTERN,
    department: 'Design',
    manager: 'Nisha Rao',
    designation: 'Product Design Intern',
    phone: '+91 99887 76655',
    skills: ['Figma', 'User Research', 'Wireframing'],
    joiningDate: '2026-06-03',
    college: 'MIT Institute of Design',
    status: 'ACTIVE',
    experienceScore: 76
  },
  {
    id: 'u-intern-003',
    name: 'Dev Patel',
    email: 'dev.intern@test.com',
    password: '123456',
    role: ROLES.INTERN,
    department: 'Engineering',
    manager: 'Nisha Rao',
    designation: 'Backend Intern',
    phone: '+91 90909 80808',
    skills: ['Java', 'Spring Boot', 'SQL'],
    joiningDate: '2026-06-05',
    college: 'Vellore Institute of Technology',
    status: 'INACTIVE',
    experienceScore: 69
  }
];

export const mockDepartments = [
  { id: 'dept-eng', name: 'Engineering', manager: 'Nisha Rao', members: 18 },
  { id: 'dept-design', name: 'Design', manager: 'Rohan Iyer', members: 7 },
  { id: 'dept-people', name: 'People Operations', manager: 'Kabir Sharma', members: 5 },
  { id: 'dept-platform', name: 'Platform', manager: 'Priya Nair', members: 4 }
];

export const mockCandidates = [
  { id: 'c-001', name: 'Ira Gupta', role: 'Frontend Intern', stage: 'SHORTLISTED', aiScore: 88 },
  { id: 'c-002', name: 'Ritvik Sen', role: 'Backend Intern', stage: 'AI_SCREENED', aiScore: 74 },
  { id: 'c-003', name: 'Maya Das', role: 'HR Intern', stage: 'INTERVIEW', aiScore: 81 },
  { id: 'c-004', name: 'Om Verma', role: 'Data Intern', stage: 'HIRED', aiScore: 91 },
  { id: 'c-005', name: 'Leah Thomas', role: 'Design Intern', stage: 'APPLIED', aiScore: null }
];
