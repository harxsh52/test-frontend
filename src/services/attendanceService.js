import { mockAttendanceHistory } from '../data/mockAttendance';
import { getDurationLabel, getTodayKey } from '../utils/dateUtils';
import { getStoredUser, STORAGE_KEYS } from '../utils/sessionUtils';
import api, { unwrapApiData, withMockFallback } from './api';

const attendanceEndpoints = {
  punchIn: '/attendance/punch-in',
  punchOut: '/attendance/punch-out',
  my: '/attendance/my',
  all: '/attendance/all',
  intern: (internId) => `/attendance/intern/${internId}`
};

const toDateTime = (date, time) => {
  if (!date || !time) return null;
  if (String(time).includes('T')) return time;

  const [clock, fraction] = String(time).split('.');
  return `${date}T${clock}${fraction ? `.${fraction.slice(0, 3)}` : ''}`;
};

const parseHours = (hours) => {
  if (hours == null) return 0;
  if (typeof hours === 'number') return hours;

  const hoursMatch = String(hours).match(/(\d+)h\s*(\d+)?m?/i);
  if (hoursMatch) {
    return Number(hoursMatch[1]) + Number(hoursMatch[2] || 0) / 60;
  }

  return Number(hours) || 0;
};

const formatHours = (hours) => {
  if (typeof hours === 'string' && hours.includes('h')) return hours;

  const totalMinutes = Math.round(parseHours(hours) * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${wholeHours}h ${String(minutes).padStart(2, '0')}m`;
};

const normalizeAttendance = (record) => {
  if (!record) return null;

  const punchIn = record.punchIn || toDateTime(record.date, record.punchInTime);
  const punchOut = record.punchOut || toDateTime(record.date, record.punchOutTime);
  const totalHours = record.totalHours ?? record.workingHours;

  return {
    ...record,
    userId: record.userId || record.internId,
    internId: record.internId || record.userId,
    punchIn,
    punchOut,
    totalHours,
    totalHoursLabel: formatHours(totalHours)
  };
};

const normalizeAttendanceList = (records = []) => records.map(normalizeAttendance);

const getStoredAttendance = () => {
  const recordsJson = localStorage.getItem(STORAGE_KEYS.attendance);

  if (!recordsJson) return [];

  try {
    return JSON.parse(recordsJson);
  } catch {
    return [];
  }
};

const saveStoredAttendance = (records) => {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
};

const getMockAttendanceRecords = () => normalizeAttendanceList([...getStoredAttendance(), ...mockAttendanceHistory]);

const getCurrentUserId = () => getStoredUser()?.id;

const sortByDateDesc = (records) =>
  [...records].sort((first, second) => new Date(second.date || second.punchIn).getTime() - new Date(first.date || first.punchIn).getTime());

const mockAttendanceService = {
  getMyAttendance: () => {
    const userId = getCurrentUserId();
    return sortByDateDesc(getMockAttendanceRecords().filter((record) => record.userId === userId));
  },

  getAllAttendance: () => sortByDateDesc(getMockAttendanceRecords()),

  getAttendanceByIntern: (internId) =>
    sortByDateDesc(getMockAttendanceRecords().filter((record) => String(record.userId) === String(internId))),

  getTodayAttendance: () => mockAttendanceService.getMyAttendance().find((record) => record.date === getTodayKey()) || null,

  punchIn: () => {
    const userId = getCurrentUserId();
    const today = getTodayKey();
    const records = getStoredAttendance();
    const existingRecord = records.find((record) => record.userId === userId && record.date === today);

    if (existingRecord) {
      return normalizeAttendance(existingRecord);
    }

    const newRecord = {
      id: `att-${userId}-${Date.now()}`,
      userId,
      internId: userId,
      date: today,
      punchIn: new Date().toISOString(),
      punchOut: null,
      totalHours: null,
      status: 'PUNCHED_IN'
    };

    saveStoredAttendance([newRecord, ...records]);
    return normalizeAttendance(newRecord);
  },

  punchOut: () => {
    const userId = getCurrentUserId();
    const today = getTodayKey();
    const records = getStoredAttendance();
    let updatedRecord = null;

    const updatedRecords = records.map((record) => {
      if (record.userId === userId && record.date === today) {
        updatedRecord = {
          ...record,
          punchOut: new Date().toISOString(),
          status: 'PRESENT'
        };
        return updatedRecord;
      }

      return record;
    });

    if (!updatedRecord) {
      throw new Error('Punch in before punching out.');
    }

    saveStoredAttendance(updatedRecords);
    return normalizeAttendance(updatedRecord);
  }
};

export const attendanceService = {
  getTodayAttendance: () =>
    withMockFallback(
      async () => {
        const records = await attendanceService.getMyAttendance();
        return records.find((record) => record.date === getTodayKey()) || null;
      },
      () => mockAttendanceService.getTodayAttendance()
    ),

  punchIn: () =>
    withMockFallback(
      async () => {
        const response = await api.post(attendanceEndpoints.punchIn);
        return normalizeAttendance(unwrapApiData(response));
      },
      () => mockAttendanceService.punchIn()
    ),

  punchOut: () =>
    withMockFallback(
      async () => {
        const response = await api.post(attendanceEndpoints.punchOut);
        return normalizeAttendance(unwrapApiData(response));
      },
      () => mockAttendanceService.punchOut()
    ),

  getMyAttendance: () =>
    withMockFallback(
      async () => {
        const response = await api.get(attendanceEndpoints.my);
        return normalizeAttendanceList(unwrapApiData(response));
      },
      () => mockAttendanceService.getMyAttendance()
    ),

  getAllAttendance: () =>
    withMockFallback(
      async () => {
        const response = await api.get(attendanceEndpoints.all);
        return normalizeAttendanceList(unwrapApiData(response));
      },
      () => mockAttendanceService.getAllAttendance()
    ),

  getAttendanceByIntern: (internId) =>
    withMockFallback(
      async () => {
        const response = await api.get(attendanceEndpoints.intern(internId));
        return normalizeAttendanceList(unwrapApiData(response));
      },
      () => mockAttendanceService.getAttendanceByIntern(internId)
    ),

  getAttendanceSummary: (records = []) => {
    const presentDays = records.filter((record) => ['PRESENT', 'PUNCHED_IN'].includes(record.status)).length;
    const totalDays = records.length;
    const totalHours = records.reduce((sum, record) => sum + parseHours(record.totalHours), 0);

    return {
      presentDays,
      totalDays,
      attendancePercentage: totalDays ? Math.round((presentDays / totalDays) * 100) : 0,
      averageWorkingHours: totalDays ? formatHours(totalHours / Math.max(presentDays, 1)) : '0h 00m'
    };
  },

  getWorkingHours: (record) => {
    if (!record) return '0h 00m';
    if (record.totalHours != null) return formatHours(record.totalHours);
    if (!record.punchIn) return '0h 00m';
    return getDurationLabel(record.punchIn, record.punchOut || new Date());
  },

  endpoints: attendanceEndpoints
};
