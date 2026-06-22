export const mockAttendanceSummaries = {
  'u-intern-001': {
    presentDays: 18,
    totalDays: 20,
    attendancePercentage: 90,
    averageWorkingHours: '7h 42m'
  },
  'u-intern-002': {
    presentDays: 16,
    totalDays: 20,
    attendancePercentage: 80,
    averageWorkingHours: '7h 10m'
  },
  'u-intern-003': {
    presentDays: 12,
    totalDays: 20,
    attendancePercentage: 60,
    averageWorkingHours: '6h 30m'
  }
};

export const mockAttendanceHistory = [
  {
    id: 'att-001',
    userId: 'u-intern-001',
    date: '2026-06-14',
    punchIn: '2026-06-14T09:18:00+05:30',
    punchOut: '2026-06-14T17:23:00+05:30',
    totalHours: '8h 05m',
    status: 'PRESENT'
  },
  {
    id: 'att-002',
    userId: 'u-intern-001',
    date: '2026-06-15',
    punchIn: '2026-06-15T09:32:00+05:30',
    punchOut: '2026-06-15T17:27:00+05:30',
    totalHours: '7h 55m',
    status: 'PRESENT'
  },
  {
    id: 'att-003',
    userId: 'u-intern-001',
    date: '2026-06-16',
    punchIn: '2026-06-16T10:05:00+05:30',
    punchOut: '2026-06-16T17:40:00+05:30',
    totalHours: '7h 35m',
    status: 'LATE'
  },
  {
    id: 'att-004',
    userId: 'u-intern-001',
    date: '2026-06-17',
    punchIn: '2026-06-17T09:20:00+05:30',
    punchOut: '2026-06-17T18:00:00+05:30',
    totalHours: '8h 40m',
    status: 'PRESENT'
  },
  {
    id: 'att-005',
    userId: 'u-intern-002',
    date: '2026-06-17',
    punchIn: '2026-06-17T09:45:00+05:30',
    punchOut: '2026-06-17T17:20:00+05:30',
    totalHours: '7h 35m',
    status: 'PRESENT'
  }
];
