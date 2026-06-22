import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import AdminAttendance from '../pages/admin/AdminAttendance';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminFeedback from '../pages/admin/AdminFeedback';
import AdminHrUsers from '../pages/admin/AdminHrUsers';
import AdminInterns from '../pages/admin/AdminInterns';
import AdminInterviews from '../pages/admin/AdminInterviews';
import AdminManagers from '../pages/admin/AdminManagers';
import AdminReports from '../pages/admin/AdminReports';
import AdminTasks from '../pages/admin/AdminTasks';
import AdminLetterDetails from '../pages/admin/LetterDetails';
import AllLeaves from '../pages/admin/AllLeaves';
import AllLetters from '../pages/admin/AllLetters';
import Departments from '../pages/admin/Departments';
import Roles from '../pages/admin/Roles';
import Settings from '../pages/admin/Settings';
import SystemNotifications from '../pages/admin/SystemNotifications';
import Users from '../pages/admin/Users';
import ChangePassword from '../pages/auth/ChangePassword';
import Forbidden from '../pages/auth/Forbidden';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Login from '../pages/auth/Login';
import ResetPassword from '../pages/auth/ResetPassword';
import Unauthorized from '../pages/auth/Unauthorized';
import AddCandidate from '../pages/hr/AddCandidate';
import AddIntern from '../pages/hr/AddIntern';
import AIResults from '../pages/hr/AIResults';
import CandidateDetails from '../pages/hr/CandidateDetails';
import Candidates from '../pages/hr/Candidates';
import HRDashboard from '../pages/hr/HRDashboard';
import HRNotifications from '../pages/hr/HRNotifications';
import GenerateLetter from '../pages/hr/GenerateLetter';
import LetterDetails from '../pages/hr/LetterDetails';
import LeaveManagement from '../pages/hr/LeaveManagement';
import Letters from '../pages/hr/Letters';
import Interviews from '../pages/hr/Interviews';
import InterviewResults from '../pages/hr/InterviewResults';
import ResumeScreening from '../pages/hr/ResumeScreening';
import ScheduleInterview from '../pages/hr/ScheduleInterview';
import AIInterview from '../pages/intern/AIInterview';
import InternDashboard from '../pages/intern/InternDashboard';
import InterviewResult from '../pages/intern/InterviewResult';
import InterviewRoom from '../pages/intern/InterviewRoom';
import ApplyLeave from '../pages/intern/ApplyLeave';
import LeaveDetails from '../pages/intern/LeaveDetails';
import MyAttendance from '../pages/intern/MyAttendance';
import MyFeedback from '../pages/intern/MyFeedback';
import MyLeaves from '../pages/intern/MyLeaves';
import MyProfile from '../pages/intern/MyProfile';
import MyTasks from '../pages/intern/MyTasks';
import AssignTask from '../pages/manager/AssignTask';
import ManagerAttendance from '../pages/manager/ManagerAttendance';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ManagerFeedback from '../pages/manager/ManagerFeedback';
import LeaveRequests from '../pages/manager/LeaveRequests';
import ManagerReports from '../pages/manager/ManagerReports';
import MyInterns from '../pages/manager/MyInterns';
import ReviewTasks from '../pages/manager/ReviewTasks';
import ReportsDashboard from '../pages/reports/ReportsDashboard';
import Notifications from '../pages/shared/Notifications';
import NotFound from '../pages/shared/NotFound';
import Profile from '../pages/shared/Profile';
import { ROLES } from '../utils/roles';
import { getDashboardPath } from '../utils/roleUtils';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

const AppRoutes = () => {
  const { authLoading, isAuthenticated, user } = useAuth();

  if (authLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? getDashboardPath(user?.role) : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forbidden" element={<Forbidden />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route element={<RoleRoute allowedRoles={[ROLES.INTERN]} />}>
            <Route path="/intern/dashboard" element={<InternDashboard />} />
            <Route path="/intern/attendance" element={<MyAttendance />} />
            <Route path="/intern/tasks" element={<MyTasks />} />
            <Route path="/intern/tasks/:id" element={<MyTasks />} />
            <Route path="/intern/leaves" element={<MyLeaves />} />
            <Route path="/intern/apply-leave" element={<ApplyLeave />} />
            <Route path="/intern/leaves/:id" element={<LeaveDetails />} />
            <Route path="/intern/feedback" element={<MyFeedback />} />
            <Route path="/intern/report" element={<ReportsDashboard />} />
            <Route path="/intern/ai-interview" element={<AIInterview />} />
            <Route path="/intern/interviews/:id" element={<InterviewRoom />} />
            <Route path="/intern/interviews/:id/result" element={<InterviewResult />} />
            <Route path="/intern/profile" element={<MyProfile />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.MANAGER]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/interns" element={<MyInterns />} />
            <Route path="/manager/assign-task" element={<AssignTask />} />
            <Route path="/manager/review-tasks" element={<ReviewTasks />} />
            <Route path="/manager/review-tasks/:id" element={<ReviewTasks />} />
            <Route path="/manager/feedback" element={<ManagerFeedback />} />
            <Route path="/manager/attendance" element={<ManagerAttendance />} />
            <Route path="/manager/leaves" element={<LeaveRequests />} />
            <Route path="/manager/interview-results" element={<InterviewResults />} />
            <Route path="/manager/interviews/:id/result" element={<InterviewResult />} />
            <Route path="/manager/reports" element={<ManagerReports />} />
            <Route path="/manager/profile" element={<Profile />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.HR]} />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/candidates" element={<Candidates />} />
            <Route path="/hr/add-candidate" element={<AddCandidate />} />
            <Route path="/hr/candidates/:id" element={<CandidateDetails />} />
            <Route path="/hr/add-intern" element={<AddIntern />} />
            <Route path="/hr/resume-screening" element={<ResumeScreening />} />
            <Route path="/hr/ai-results" element={<AIResults />} />
            <Route path="/hr/interviews" element={<Interviews />} />
            <Route path="/hr/letters" element={<Letters />} />
            <Route path="/hr/generate-letter" element={<GenerateLetter />} />
            <Route path="/hr/letters/:id" element={<LetterDetails />} />
            <Route path="/hr/schedule-interview" element={<ScheduleInterview />} />
            <Route path="/hr/interview-results" element={<InterviewResults />} />
            <Route path="/hr/notifications" element={<HRNotifications />} />
            <Route path="/hr/leaves" element={<LeaveManagement />} />
            <Route path="/hr/reports" element={<ReportsDashboard />} />
            <Route path="/hr/interviews/:id" element={<InterviewRoom />} />
            <Route path="/hr/interviews/:id/result" element={<InterviewResult />} />
            <Route path="/hr/interview-builder" element={<ScheduleInterview />} />
            <Route path="/hr/profile" element={<Profile />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/interns" element={<AdminInterns />} />
            <Route path="/admin/managers" element={<AdminManagers />} />
            <Route path="/admin/hr" element={<AdminHrUsers />} />
            <Route path="/admin/candidates" element={<Candidates />} />
            <Route path="/admin/add-candidate" element={<AddCandidate />} />
            <Route path="/admin/candidates/:id" element={<CandidateDetails />} />
            <Route path="/admin/resume-screening" element={<ResumeScreening />} />
            <Route path="/admin/ai-results" element={<AIResults />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/letters" element={<AllLetters />} />
            <Route path="/admin/letters/:id" element={<AdminLetterDetails />} />
            <Route path="/admin/leaves" element={<AllLeaves />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/interviews" element={<AdminInterviews />} />
            <Route path="/admin/schedule-interview" element={<ScheduleInterview />} />
            <Route path="/admin/interview-results" element={<InterviewResults />} />
            <Route path="/admin/notifications" element={<HRNotifications />} />
            <Route path="/admin/system-notifications" element={<SystemNotifications />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/interviews/:id" element={<InterviewRoom />} />
            <Route path="/admin/interviews/:id/result" element={<InterviewResult />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
