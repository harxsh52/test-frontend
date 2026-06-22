import { mockAIInterview } from '../data/mockAIInterview';

export const aiInterviewService = {
  // AI interview APIs are intentionally not connected until the backend AI module exists.
  getCurrentInterview: () => mockAIInterview
};
