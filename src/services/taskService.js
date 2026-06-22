import { mockTasks } from '../data/mockTasks';
import { mockUsers } from '../data/mockUsers';
import { ROLES } from '../utils/roles';
import { getStoredUser, STORAGE_KEYS } from '../utils/sessionUtils';
import api, { unwrapApiData, withMockFallback } from './api';

const taskEndpoints = {
  create: '/tasks',
  my: '/tasks/my',
  assignedByMe: '/tasks/assigned-by-me',
  byId: (taskId) => `/tasks/${taskId}`,
  status: (taskId) => `/tasks/${taskId}/status`,
  submit: (taskId) => `/tasks/${taskId}/submit`,
  review: (taskId) => `/tasks/${taskId}/review`
};

const completedStatuses = ['APPROVED', 'COMPLETED'];
const openStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'REJECTED'];

const toApiId = (id) => {
  const numericId = Number(id);
  return Number.isNaN(numericId) ? id : numericId;
};

const normalizePriority = (priority) => String(priority || 'MEDIUM').toUpperCase();

const normalizeStatus = (status) => {
  const nextStatus = String(status || 'PENDING').toUpperCase();
  return nextStatus === 'ASSIGNED' ? 'PENDING' : nextStatus;
};

const getInternName = (internId) =>
  mockUsers.find((user) => String(user.id) === String(internId))?.name || '';

const normalizeTask = (task) => {
  if (!task) return null;

  const internId = task.internId ?? task.assignedToInternId;

  return {
    ...task,
    id: task.id ?? task.taskId,
    internId,
    internName: task.internName || task.assignedToName || getInternName(internId),
    assignedBy: task.assignedBy || task.assignedByName || task.managerName || '',
    assignedById: task.assignedById ?? task.assignedByUserId,
    priority: normalizePriority(task.priority),
    status: normalizeStatus(task.status),
    managerFeedback: task.managerFeedback || task.feedback || '',
    rating: task.rating ?? null
  };
};

const normalizeTasks = (tasks = []) => tasks.map(normalizeTask);

const readStoredTasks = () => {
  const tasksJson = localStorage.getItem(STORAGE_KEYS.tasks);

  if (!tasksJson) return null;

  try {
    return JSON.parse(tasksJson);
  } catch {
    return null;
  }
};

const writeStoredTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
};

const getMockTasks = () => {
  const storedTasks = readStoredTasks();
  const tasks = storedTasks || mockTasks;
  return normalizeTasks(tasks);
};

const saveMockTasks = (tasks) => {
  const normalizedTasks = normalizeTasks(tasks);
  writeStoredTasks(normalizedTasks);
  return normalizedTasks;
};

const mockTaskService = {
  getMyTasks: () => {
    const currentUser = getStoredUser();
    return getMockTasks().filter((task) => String(task.internId) === String(currentUser?.id));
  },

  getAssignedByMe: () => {
    const currentUser = getStoredUser();

    if (!currentUser || currentUser.role !== ROLES.MANAGER) {
      return getMockTasks();
    }

    return getMockTasks().filter(
      (task) => String(task.assignedById) === String(currentUser.id) || task.assignedBy === currentUser.name
    );
  },

  getTaskById: (taskId) => {
    const task = getMockTasks().find((currentTask) => String(currentTask.id) === String(taskId));

    if (!task) {
      throw new Error('Task not found.');
    }

    return task;
  },

  createTask: ({ title, description, priority, dueDate, internId }) => {
    const currentUser = getStoredUser();
    const newTask = normalizeTask({
      id: `task-${Date.now()}`,
      internId,
      internName: getInternName(internId),
      title,
      description,
      priority,
      dueDate,
      status: 'PENDING',
      assignedBy: currentUser?.name || 'Manager',
      assignedById: currentUser?.id,
      createdAt: new Date().toISOString(),
      submittedAt: null,
      reviewedAt: null,
      reviewedBy: null,
      managerFeedback: '',
      rating: null,
      submissionLink: '',
      submissionNote: ''
    });

    saveMockTasks([newTask, ...getMockTasks()]);
    return newTask;
  },

  updateTaskStatus: (taskId, status) => {
    let updatedTask = null;
    const tasks = getMockTasks().map((task) => {
      if (String(task.id) !== String(taskId)) return task;

      updatedTask = normalizeTask({
        ...task,
        status
      });
      return updatedTask;
    });

    saveMockTasks(tasks);
    return updatedTask;
  },

  submitTask: (taskId, { submissionLink = '', submissionNote = '' } = {}) => {
    let submittedTask = null;
    const tasks = getMockTasks().map((task) => {
      if (String(task.id) !== String(taskId)) return task;

      submittedTask = normalizeTask({
        ...task,
        status: 'SUBMITTED',
        submissionLink,
        submissionNote,
        submittedAt: new Date().toISOString(),
        reviewedAt: null
      });
      return submittedTask;
    });

    saveMockTasks(tasks);
    return submittedTask;
  },

  reviewTask: (taskId, { decision, feedback, rating }) => {
    const currentUser = getStoredUser();
    let reviewedTask = null;
    const tasks = getMockTasks().map((task) => {
      if (String(task.id) !== String(taskId)) return task;

      reviewedTask = normalizeTask({
        ...task,
        status: decision,
        managerFeedback: feedback,
        rating,
        reviewedBy: currentUser?.name || 'Manager',
        reviewedAt: new Date().toISOString()
      });
      return reviewedTask;
    });

    saveMockTasks(tasks);
    return reviewedTask;
  }
};

export const taskService = {
  getMyTasks: () =>
    withMockFallback(
      async () => {
        const response = await api.get(taskEndpoints.my);
        return normalizeTasks(unwrapApiData(response));
      },
      () => mockTaskService.getMyTasks()
    ),

  getAssignedByMe: () =>
    withMockFallback(
      async () => {
        const response = await api.get(taskEndpoints.assignedByMe);
        return normalizeTasks(unwrapApiData(response));
      },
      () => mockTaskService.getAssignedByMe()
    ),

  getTaskById: (taskId) =>
    withMockFallback(
      async () => {
        const response = await api.get(taskEndpoints.byId(taskId));
        return normalizeTask(unwrapApiData(response));
      },
      () => mockTaskService.getTaskById(taskId)
    ),

  createTask: ({ title, description, priority, dueDate, internId }) =>
    withMockFallback(
      async () => {
        const response = await api.post(taskEndpoints.create, {
          title,
          description,
          priority: normalizePriority(priority),
          dueDate,
          assignedToInternId: toApiId(internId)
        });

        return normalizeTask(unwrapApiData(response));
      },
      () => mockTaskService.createTask({ title, description, priority, dueDate, internId })
    ),

  updateTaskStatus: (taskId, status) =>
    withMockFallback(
      async () => {
        const response = await api.put(taskEndpoints.status(taskId), { status });
        return normalizeTask(unwrapApiData(response));
      },
      () => mockTaskService.updateTaskStatus(taskId, status)
    ),

  submitTask: (taskId, submission = {}) =>
    withMockFallback(
      async () => {
        const response = await api.put(taskEndpoints.submit(taskId), submission);
        return normalizeTask(unwrapApiData(response));
      },
      () => mockTaskService.submitTask(taskId, submission)
    ),

  reviewTask: (taskId, { decision, feedback, rating }) =>
    withMockFallback(
      async () => {
        const response = await api.put(taskEndpoints.review(taskId), {
          status: decision,
          managerFeedback: feedback,
          rating
        });

        return normalizeTask(unwrapApiData(response));
      },
      () => mockTaskService.reviewTask(taskId, { decision, feedback, rating })
    ),

  getTasksByIntern: (internId) =>
    withMockFallback(
      async () => {
        const currentUser = getStoredUser();
        const sourceTasks = currentUser?.role === ROLES.MANAGER ? await taskService.getAssignedByMe() : await taskService.getMyTasks();
        return sourceTasks.filter((task) => String(task.internId) === String(internId));
      },
      () => getMockTasks().filter((task) => String(task.internId) === String(internId))
    ),

  getTasksByManager: (managerName) =>
    withMockFallback(
      async () => {
        const tasks = await taskService.getAssignedByMe();
        return managerName ? tasks.filter((task) => task.assignedBy === managerName) : tasks;
      },
      () => getMockTasks().filter((task) => task.assignedBy === managerName)
    ),

  getTaskStats: (tasks = []) => ({
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => completedStatuses.includes(task.status)).length,
    inReviewTasks: tasks.filter((task) => task.status === 'SUBMITTED').length,
    openTasks: tasks.filter((task) => openStatuses.includes(task.status)).length
  }),

  getManagerTaskStats: (tasks = []) => ({
    tasksAssigned: tasks.length,
    tasksCompleted: tasks.filter((task) => completedStatuses.includes(task.status)).length,
    pendingReviews: tasks.filter((task) => task.status === 'SUBMITTED').length
  }),

  endpoints: taskEndpoints
};
