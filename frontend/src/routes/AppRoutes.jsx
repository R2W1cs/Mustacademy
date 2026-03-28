import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import MainLayout from "../layouts/MainLayout";

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
const PodcastStudio = lazy(() => import("../pages/PodcastStudio"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UpgradePage = lazy(() => import("../pages/UpgradePage"));
const AdminKBPage = lazy(() => import("../pages/AdminKBPage"));

const PageLoader = () => (
  <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-indigo-500" />
      <span className="text-sm font-medium text-slate-400">Loading module...</span>
    </div>
  </div>
);

// Wrapper to prevent repeating Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={withSuspense(Login)} />
      <Route path="/register" element={withSuspense(Register)} />
      <Route path="/reset-password/:token" element={withSuspense(ResetPassword)} />

      {/* App */}
      <Route path="/" element={withSuspense(LandingPage)} />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            {withSuspense(Dashboard)}
          </MainLayout>
        }
      />

      <Route path="/courses" element={<Navigate to="/library" replace />} />

      <Route
        path="/my-courses"
        element={
          <MainLayout>
            {withSuspense(MyCourses)}
          </MainLayout>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <MainLayout>
            {withSuspense(CourseDetails)}
          </MainLayout>
        }
      />

      <Route
        path="/courses/:id/roadmap"
        element={
          <MainLayout>
            {withSuspense(RoadmapView)}
          </MainLayout>
        }
      />

      <Route
        path="/topics/:id"
        element={
          <MainLayout>
            {withSuspense(TopicDetails)}
          </MainLayout>
        }
      />

      <Route
        path="/knowledge-map"
        element={withSuspense(KnowledgeMapPage)}
      />

      <Route
        path="/library"
        element={
          <MainLayout>
            {withSuspense(LibraryPage)}
          </MainLayout>
        }
      />

      <Route
        path="/neural-clash"
        element={
          <MainLayout>
            {withSuspense(NeuralClashPage)}
          </MainLayout>
        }
      />

      <Route
        path="/arena"
        element={
          <MainLayout>
            {withSuspense(NeuralClashPage)}
          </MainLayout>
        }
      />

      <Route
        path="/exams/session"
        element={
          <MainLayout>
            {withSuspense(ExamSession)}
          </MainLayout>
        }
      />

      <Route
        path="/profile/setup"
        element={
          <MainLayout>
            {withSuspense(ProfileSetup)}
          </MainLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <MainLayout>
            {withSuspense(Profile)}
          </MainLayout>
        }
      />
      <Route
        path="/career/roadmap"
        element={
          <MainLayout>
            {withSuspense(CareerRoadmap)}
          </MainLayout>
        }
      />

      <Route
        path="/career"
        element={
          <MainLayout>
            {withSuspense(CareerRoadmap)}
          </MainLayout>
        }
      />

      <Route
        path="/market"
        element={
          <MainLayout>
            {withSuspense(ForumHub)}
          </MainLayout>
        }
      />
      <Route
        path="/forum/thread/:id"
        element={
          <MainLayout>
            {withSuspense(ThreadDetailsPage)}
          </MainLayout>
        }
      />
      <Route
        path="/interview-boardroom"
        element={
          <MainLayout>
            {withSuspense(InterviewPage)}
          </MainLayout>
        }
      />
      <Route
        path="/creator-corner"
        element={
          <MainLayout>
            {withSuspense(CreatorCorner)}
          </MainLayout>
        }
      />
      <Route
        path="/podcast-studio"
        element={
          <MainLayout>
            {withSuspense(PodcastStudio)}
          </MainLayout>
        }
      />

      <Route
        path="/upgrade"
        element={
          <MainLayout>
            {withSuspense(UpgradePage)}
          </MainLayout>
        }
      />
      <Route
        path="/admin/kb"
        element={
          <MainLayout>
            {withSuspense(AdminKBPage)}
          </MainLayout>
        }
      />

      <Route path="/accomplishments" element={<Navigate to="/profile" replace />} />
      <Route path="/forum" element={<Navigate to="/market" replace />} />
      <Route path="/protocols" element={<Navigate to="/market" replace />} />
      {/* 404 */}
      <Route path="*" element={withSuspense(NotFound)} />
    </Routes>
  );
}
