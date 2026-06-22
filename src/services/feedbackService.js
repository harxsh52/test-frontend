import { mockFeedback } from '../data/mockFeedback';
import { getStoredUser } from '../utils/sessionUtils';
import api, { unwrapApiData, withMockFallback } from './api';

const feedbackEndpoints = {
  create: '/feedback',
  my: '/feedback/my',
  intern: (internId) => `/feedback/intern/${internId}`
};

const normalizeFeedback = (feedback) => ({
  ...feedback,
  taskName: feedback.taskTitle || feedback.taskName || 'General Feedback',
  feedback: feedback.feedbackText || feedback.feedback,
  reviewDate: feedback.createdAt || feedback.reviewDate
});

const normalizeFeedbackList = (items = []) => items.map(normalizeFeedback);

export const feedbackService = {
  createFeedback: ({ internId, taskId, feedbackText, rating }) =>
    withMockFallback(
      async () => {
        const response = await api.post(feedbackEndpoints.create, {
          internId,
          taskId,
          feedbackText,
          rating
        });

        return normalizeFeedback(unwrapApiData(response));
      },
      () =>
        normalizeFeedback({
          id: `fb-${Date.now()}`,
          internId,
          taskId,
          feedbackText,
          rating,
          createdAt: new Date().toISOString()
        })
    ),

  getMyFeedback: () =>
    withMockFallback(
      async () => {
        const response = await api.get(feedbackEndpoints.my);
        return normalizeFeedbackList(unwrapApiData(response));
      },
      () => {
        const userId = getStoredUser()?.id;
        return normalizeFeedbackList(mockFeedback.filter((feedback) => feedback.internId === userId));
      }
    ),

  getFeedbackByIntern: (internId) =>
    withMockFallback(
      async () => {
        const response = await api.get(feedbackEndpoints.intern(internId));
        return normalizeFeedbackList(unwrapApiData(response));
      },
      () => normalizeFeedbackList(mockFeedback.filter((feedback) => String(feedback.internId) === String(internId)))
    ),

  endpoints: feedbackEndpoints
};
