import { mockCandidates, mockDepartments, mockUsers } from '../data/mockUsers';
import { ROLES } from '../utils/roles';
import { getStoredUser, STORAGE_KEYS } from '../utils/sessionUtils';
import api, { unwrapApiData, unwrapApiList, USE_MOCK_API, withMockFallback } from './api';
import { authService, normalizeUser } from './authService';

const userEndpoints = {
  users: '/users',
  usersByRole: (role) => `/users/role/${role}`,
  generateCredentials: (userId) => `/users/${userId}/generate-credentials`,
  departments: '/departments',
  interns: '/interns',
  internById: (internId) => `/interns/${internId}`,
  myInternProfile: '/interns/my-profile',
  candidates: '/candidates',
  candidateById: (candidateId) => `/candidates/${candidateId}`
};

const toApiId = (id) => {
  const numericId = Number(id);
  return Number.isNaN(numericId) ? id : numericId;
};

const omitPassword = ({ password, ...user }) => user;

const readCollection = (key, fallback) => {
  const collectionJson = localStorage.getItem(key);

  if (!collectionJson) {
    return fallback;
  }

  try {
    return JSON.parse(collectionJson);
  } catch {
    return fallback;
  }
};

const writeCollection = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getMockUsers = () =>
  readCollection(
    STORAGE_KEYS.users,
    mockUsers.map((user) => normalizeUser(omitPassword(user)))
  );

const saveMockUsers = (users) => writeCollection(STORAGE_KEYS.users, users);

const getMockDepartments = () => readCollection(STORAGE_KEYS.departments, mockDepartments);
const saveMockDepartments = (departments) => writeCollection(STORAGE_KEYS.departments, departments);

const normalizeDepartment = (department) => ({
  ...department,
  id: department.id ?? department.departmentId,
  name: department.name || department.departmentName,
  status: department.active === false ? 'INACTIVE' : department.status || 'ACTIVE'
});

const getDepartmentName = (departmentId) =>
  getMockDepartments().find((department) => String(department.id) === String(departmentId))?.name || '';

const getManagerName = (managerId) =>
  getMockUsers().find((user) => String(user.id) === String(managerId))?.name || '';

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const toApiSkills = (skills) => normalizeSkills(skills).join(', ');

const normalizeInternProfile = (profile) => {
  const normalizedUser = normalizeUser(profile);

  return {
    ...normalizedUser,
    id: profile.id ?? profile.userId,
    internId: profile.internId ?? profile.id,
    userId: profile.userId ?? profile.id,
    role: ROLES.INTERN,
    department: profile.departmentName || profile.department || getDepartmentName(profile.departmentId),
    manager: profile.managerName || profile.manager || getManagerName(profile.managerId),
    designation: profile.designation || 'Intern',
    status: profile.status || 'ACTIVE',
    experienceScore: profile.experienceScore || profile.rating || '-',
    skills: normalizeSkills(profile.skills)
  };
};

const normalizeUsers = (users = []) => users.map(normalizeUser);
const normalizeDepartments = (departments = []) => departments.map(normalizeDepartment);
const normalizeInterns = (interns = []) => interns.map(normalizeInternProfile);

const mockUserService = {
  getAllUsers: () => getMockUsers(),

  getUsersByRole: (role) => getMockUsers().filter((user) => user.role === role),

  getInterns: () => getMockUsers().filter((user) => user.role === ROLES.INTERN).map(normalizeInternProfile),

  getInternsByManager: (managerName = getStoredUser()?.name) =>
    mockUserService.getInterns().filter((intern) => !managerName || intern.manager === managerName),

  getInternById: (internId) => {
    const intern = mockUserService.getInterns().find((user) => String(user.id) === String(internId));

    if (!intern) {
      throw new Error('Intern not found.');
    }

    return intern;
  },

  getMyInternProfile: () => {
    const currentUser = getStoredUser();

    if (!currentUser) {
      throw new Error('No active user session.');
    }

    return normalizeInternProfile(currentUser);
  },

  getDepartments: () => normalizeDepartments(getMockDepartments()),

  createInternProfile: (profile) => {
    const users = getMockUsers();
    const existingUser = users.find((user) => String(user.id) === String(profile.userId));
    const internProfile = normalizeInternProfile({
      ...existingUser,
      ...profile,
      id: profile.userId,
      role: ROLES.INTERN,
      department: getDepartmentName(profile.departmentId),
      manager: getManagerName(profile.managerId)
    });

    const nextUsers = existingUser
      ? users.map((user) => (String(user.id) === String(profile.userId) ? internProfile : user))
      : [...users, internProfile];

    saveMockUsers(nextUsers);
    return internProfile;
  },

  updateInternProfile: (internId, profile) => {
    const users = getMockUsers();
    const updatedProfile = normalizeInternProfile({ ...profile, id: internId });
    saveMockUsers(users.map((user) => (String(user.id) === String(internId) ? { ...user, ...updatedProfile } : user)));
    return updatedProfile;
  },

  createDepartment: (department) => {
    const departments = getMockDepartments();
    const nextDepartment = normalizeDepartment({
      id: `dept-${Date.now()}`,
      members: 0,
      ...department
    });

    saveMockDepartments([nextDepartment, ...departments]);
    return nextDepartment;
  },

  updateDepartment: (departmentId, department) => {
    const departments = getMockDepartments();
    const updatedDepartment = normalizeDepartment({ ...department, id: departmentId });
    saveMockDepartments(
      departments.map((currentDepartment) =>
        String(currentDepartment.id) === String(departmentId) ? { ...currentDepartment, ...updatedDepartment } : currentDepartment
      )
    );
    return updatedDepartment;
  },

  deleteDepartment: (departmentId) => {
    saveMockDepartments(getMockDepartments().filter((department) => String(department.id) !== String(departmentId)));
  }
};

export const userService = {
  getAllUsers: () =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.users);
        return normalizeUsers(unwrapApiList(response));
      },
      () => mockUserService.getAllUsers()
    ),

  getUsersByRole: (role) =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.usersByRole(role));
        return normalizeUsers(unwrapApiList(response));
      },
      () => mockUserService.getUsersByRole(role)
    ),

  generateCredentials: (userId) =>
    withMockFallback(
      async () => {
        const response = await api.post(userEndpoints.generateCredentials(userId));
        return unwrapApiData(response);
      },
      () => {
        const user = getMockUsers().find((currentUser) => String(currentUser.id) === String(userId));

        if (!user) {
          throw new Error('User not found.');
        }

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          temporaryPassword: `IQ-${Math.random().toString(36).slice(2, 12)}`
        };
      }
    ),

  getInterns: () =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.interns);
        return normalizeInterns(unwrapApiList(response));
      },
      () => mockUserService.getInterns()
    ),

  getInternsByManager: (managerName) =>
    withMockFallback(
      async () => userService.getInterns(),
      () => mockUserService.getInternsByManager(managerName)
    ),

  getInternById: (internId) =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.internById(internId));
        return normalizeInternProfile(unwrapApiData(response));
      },
      () => mockUserService.getInternById(internId)
    ),

  getMyInternProfile: () =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.myInternProfile);
        return normalizeInternProfile(unwrapApiData(response));
      },
      () => mockUserService.getMyInternProfile()
    ),

  createInternProfile: (profile) =>
    withMockFallback(
      async () => {
        const response = await api.post(userEndpoints.interns, {
          ...profile,
          departmentId: toApiId(profile.departmentId),
          managerId: toApiId(profile.managerId),
          skills: toApiSkills(profile.skills)
        });
        return normalizeInternProfile(unwrapApiData(response));
      },
      () => mockUserService.createInternProfile(profile)
    ),

  updateInternProfile: (internId, profile) =>
    withMockFallback(
      async () => {
        const response = await api.put(userEndpoints.internById(internId), {
          ...profile,
          departmentId: toApiId(profile.departmentId),
          managerId: toApiId(profile.managerId),
          skills: toApiSkills(profile.skills)
        });
        return normalizeInternProfile(unwrapApiData(response));
      },
      () => mockUserService.updateInternProfile(internId, profile)
    ),

  getDepartments: () =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.departments);
        return normalizeDepartments(unwrapApiData(response));
      },
      () => mockUserService.getDepartments()
    ),

  createDepartment: (department) =>
    withMockFallback(
      async () => {
        const response = await api.post(userEndpoints.departments, department);
        return normalizeDepartment(unwrapApiData(response));
      },
      () => mockUserService.createDepartment(department)
    ),

  updateDepartment: (departmentId, department) =>
    withMockFallback(
      async () => {
        const response = await api.put(`${userEndpoints.departments}/${departmentId}`, department);
        return normalizeDepartment(unwrapApiData(response));
      },
      () => mockUserService.updateDepartment(departmentId, department)
    ),

  deleteDepartment: (departmentId) =>
    withMockFallback(
      async () => {
        await api.delete(`${userEndpoints.departments}/${departmentId}`);
      },
      () => mockUserService.deleteDepartment(departmentId)
    ),

  registerInternUser: async ({ name, email, password }) => {
    const user = await authService.register({
      name,
      email,
      password,
      role: ROLES.INTERN
    });

    if (USE_MOCK_API) {
      const users = getMockUsers();
      if (!users.some((currentUser) => String(currentUser.id) === String(user.id))) {
        saveMockUsers([user, ...users]);
      }
    }

    return user;
  },

  getManagerStats: (interns = []) => ({
    totalInterns: interns.length,
    activeInterns: interns.filter((intern) => intern.status === 'ACTIVE').length
  }),

  getAdminStats: async () => {
    const [users, departments, interns] = await Promise.all([
      userService.getAllUsers(),
      userService.getDepartments(),
      userService.getInterns()
    ]);

    return {
      totalUsers: users.length,
      totalDepartments: departments.length,
      activeInterns: interns.filter((intern) => intern.status === 'ACTIVE').length,
      managers: users.filter((user) => user.role === ROLES.MANAGER).length,
      hrUsers: users.filter((user) => user.role === ROLES.HR).length
    };
  },

  getHrStats: async () => {
    const [interns, departments] = await Promise.all([userService.getInterns(), userService.getDepartments()]);

    return {
      totalInterns: interns.length,
      activeInterns: interns.filter((intern) => intern.status === 'ACTIVE').length,
      departments: departments.length,
      completedInternships: interns.filter((intern) => intern.status === 'COMPLETED').length
    };
  },

  getCandidates: () =>
    withMockFallback(
      async () => {
        const response = await api.get(userEndpoints.candidates);
        return unwrapApiData(response);
      },
      () => mockCandidates
    ),

  createCandidate: (candidate) =>
    withMockFallback(
      async () => {
        const response = await api.post(userEndpoints.candidates, candidate);
        return unwrapApiData(response);
      },
      () => ({
        id: `candidate-${Date.now()}`,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        ...candidate
      })
    ),

  endpoints: userEndpoints
};
