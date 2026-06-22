import api, { unwrapApiData } from './api';

const interviewEndpoints = {
  create: '/interviews',
  my: '/interviews/my',
  byId: (interviewId) => `/interviews/${interviewId}`,
  generateQuestions: (interviewId) => `/interviews/${interviewId}/generate-questions`,
  start: (interviewId) => `/interviews/${interviewId}/start`,
  answer: (interviewId) => `/interviews/${interviewId}/answer`,
  complete: (interviewId) => `/interviews/${interviewId}/complete`,
  result: (interviewId) => `/interviews/${interviewId}/result`
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  return String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeInterviewResult = (result) =>
  result
    ? {
        ...result,
        strengths: normalizeList(result.strengths),
        weaknesses: normalizeList(result.weaknesses)
      }
    : null;

const normalizeInterview = (interview) => {
  if (!interview) return null;

  const answersByQuestionId = new Map((interview.answers || []).map((answer) => [String(answer.questionId), answer]));

  return {
    ...interview,
    participantName: interview.internName || interview.candidateName || 'Candidate',
    questions: (interview.questions || []).map((question) => ({
      ...question,
      answer: question.answer || answersByQuestionId.get(String(question.id)) || null
    })),
    result: normalizeInterviewResult(interview.result)
  };
};

const normalizeInterviews = (interviews = []) => interviews.map(normalizeInterview);

export const interviewService = {
  scheduleInterview: async ({ candidateId, internId, role, scheduledAt }) => {
    const response = await api.post(interviewEndpoints.create, {
      candidateId: candidateId ? Number(candidateId) : null,
      internId: internId ? Number(internId) : null,
      role,
      scheduledAt: scheduledAt || null
    });

    return normalizeInterview(unwrapApiData(response));
  },

  getInterviews: async () => {
    const response = await api.get(interviewEndpoints.my);
    return normalizeInterviews(unwrapApiData(response));
  },

  getInterview: async (interviewId) => {
    const response = await api.get(interviewEndpoints.byId(interviewId));
    return normalizeInterview(unwrapApiData(response));
  },

  generateQuestions: async (interviewId) => {
    const response = await api.post(interviewEndpoints.generateQuestions(interviewId));
    return normalizeInterview(unwrapApiData(response));
  },

  startInterview: async (interviewId) => {
    const response = await api.post(interviewEndpoints.start(interviewId));
    return normalizeInterview(unwrapApiData(response));
  },

  submitAnswer: async (interviewId, { questionId, answerText }) => {
    const response = await api.post(interviewEndpoints.answer(interviewId), { questionId, answerText });
    return unwrapApiData(response);
  },

  completeInterview: async (interviewId) => {
    const response = await api.post(interviewEndpoints.complete(interviewId));
    return normalizeInterview(unwrapApiData(response));
  },

  getResult: async (interviewId) => {
    const response = await api.get(interviewEndpoints.result(interviewId));
    return normalizeInterviewResult(unwrapApiData(response));
  },

  endpoints: interviewEndpoints
};
