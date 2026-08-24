import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import MainLayout from "../layouts/MainLayout";
import { RequireAuth } from "./ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const MyCourses = lazy(() => import("../pages/MyCourses"));
const CourseDetails = lazy(() => import("../pages/CourseDetails"));
const TopicDetails = lazy(() => import("../pages/TopicDetails"));

const ProfileSetup = lazy(() => import("../pages/ProfileSetup"));
const Profile = lazy(() => import("../pages/Profile"));
const RoadmapView = lazy(() => import("../pages/RoadmapView"));
const CareerRoadmap = lazy(() => import("../pages/CareerRoadmap"));
const KnowledgeMapPage = lazy(() => import("../pages/KnowledgeMapPage"));
const LibraryPage = lazy(() => import("../pages/LibraryPage"));
const ExamSession = lazy(() => import("../pages/ExamSession"));
const ThreadDetailsPage = lazy(() => import("../pages/ThreadDetailsPage"));
const NeuralClashPage = lazy(() => import("../pages/NeuralClashPage"));

const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const ForumHub = lazy(() => import("../pages/ForumHub"));
const InterviewPage = lazy(() => import("../pages/InterviewPage"));
const CreatorCorner = lazy(() => import("../pages/CreatorCorner"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UpgradePage = lazy(() => import("../pages/UpgradePage"));
const AdminKBPage = lazy(() => import("../pages/AdminKBPage"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));

const PageLoader = () => (
  <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-indigo-500" />
      <span className="text-sm font-medium text-slate-400">Loading module...</span>
    </div>
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const publicPage = (Component) => withSuspense(Component);

const protectedPage = (Component, { roles } = {}) => (
  <RequireAuth roles={roles}>
    {withSuspense(Component)}
  </RequireAuth>
);

const protectedLayout = (Component, { roles } = {}) => (
  <RequireAuth roles={roles}>
    <MainLayout>{withSuspense(Component)}</MainLayout>
  </RequireAuth>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={publicPage(Login)} />
      <Route path="/register" element={publicPage(Register)} />
      <Route path="/reset-password/:token" element={publicPage(ResetPassword)} />
      <Route path="/" element={publicPage(LandingPage)} />

      {/* Authenticated */}
      <Route path="/dashboard" element={protectedLayout(Dashboard)} />
      <Route path="/courses" element={<Navigate to="/library" replace />} />
      <Route path="/my-courses" element={protectedLayout(MyCourses)} />
      <Route path="/courses/:id" element={protectedLayout(CourseDetails)} />
      <Route path="/courses/:id/roadmap" element={protectedLayout(RoadmapView)} />
      <Route path="/topics/:id" element={protectedLayout(TopicDetails)} />
      <Route path="/knowledge-map" element={protectedPage(KnowledgeMapPage)} />
      <Route path="/library" element={protectedLayout(LibraryPage)} />
      <Route path="/neural-clash" element={protectedLayout(NeuralClashPage)} />
      <Route path="/arena" element={protectedLayout(NeuralClashPage)} />
      <Route path="/exams/session" element={protectedLayout(ExamSession)} />
      <Route path="/profile/setup" element={protectedLayout(ProfileSetup)} />
      <Route path="/profile" element={protectedLayout(Profile)} />
      <Route path="/career/roadmap" element={protectedLayout(CareerRoadmap)} />
      <Route path="/career" element={protectedLayout(CareerRoadmap)} />
      <Route path="/market" element={protectedLayout(ForumHub)} />
      <Route path="/forum/thread/:id" element={protectedLayout(ThreadDetailsPage)} />
      <Route path="/interview-boardroom" element={protectedLayout(InterviewPage)} />
      <Route path="/creator-corner" element={protectedLayout(CreatorCorner)} />
      <Route path="/podcast-studio" element={<Navigate to="/dashboard" replace />} />
      <Route path="/upgrade" element={protectedLayout(UpgradePage)} />

      {/* Admin / professor */}
      <Route
        path="/admin"
        element={protectedLayout(AdminDashboard, { roles: ["admin", "professor"] })}
      />
      <Route
        path="/admin/kb"
        element={protectedLayout(AdminKBPage, { roles: ["admin"] })}
      />

      <Route path="/accomplishments" element={<Navigate to="/profile" replace />} />
      <Route path="/forum" element={<Navigate to="/market" replace />} />
      <Route path="/protocols" element={<Navigate to="/market" replace />} />
      <Route path="*" element={publicPage(NotFound)} />
    </Routes>
  );
}
