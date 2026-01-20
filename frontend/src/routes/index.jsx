// Feature-based imports
import {
  LoginPage,
  RegisterPage
} from '../pages/auth';

// Import auth components directly
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';

import {
  AdminPage
} from '../pages/admin';



import {
  ModeratorPage
} from '../pages/moderator';

import {
  MentorDashboard,
  RegisterMentorPage,
  MentorListPage,
  MentorDetailPage,
  MentorProfilePage
} from '../pages/mentor';

// Common pages and components
import {
  HomePage,
  NotFoundPage,
  AboutPage,
  BecomeACounselorPage
} from '../pages/common';
import { ProfilePage } from '../pages/common';
import { BlogsPage, BlogDetailPage, FAQsPage, FAQDetailPage, CreateFaqPage } from '../pages/common';
import { BookingSuccessPage, BookingFailedPage, BookingHistoryPage } from '../pages/common';

import { Layout } from '../components/layout';
import { ProtectedRoute } from '../components/auth';

import { createBrowserRouter, Navigate } from "react-router-dom";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: "/about",
    element: <Layout><AboutPage /></Layout>,
  },
  {
    path: "/become-mentor",
    element: <Layout><BecomeACounselorPage /></Layout>,
  },
  {
    path: "/login",
    element: <Layout><LoginPage /></Layout>,
  },
  {
    path: "/register",
    element: <Layout><RegisterPage /></Layout>,
  },
  {
    path: "/register-mentor",
    element: <Layout><RegisterMentorPage /></Layout>,
  },
  {
    path: "/forgot-password",
    element: <Layout><ForgotPassword /></Layout>,
  },
  {
    path: "/reset-password",
    element: <Layout><ResetPassword /></Layout>,
  },
  {
    path: "/moderator",
    element: <Layout>
      <ProtectedRoute requiredRole="MODERATOR">
        <ModeratorPage />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/admin",
    element: <Layout>
      <ProtectedRoute requiredRole="ADMIN">
        <AdminPage />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/mentor/dashboard",
    element: <Layout>
      <ProtectedRoute requiredRole="MENTOR">
        <MentorDashboard />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/mentor/profile",
    element: <Layout>
      <ProtectedRoute requiredRole="MENTOR">
        <MentorProfilePage />
      </ProtectedRoute>
    </Layout>,
  },

  {
    path: "/blogs",
    element: <Layout><BlogsPage /></Layout>,
  },
  {
    path: "/blogs/:id",
    element: <Layout><BlogDetailPage /></Layout>,
  },
  {
    path: "/faqs",
    element: <Layout><FAQsPage /></Layout>,
  },
  {
    path: "/faqs/new",
    element: <Layout>
      <ProtectedRoute>
        <CreateFaqPage />
      </ProtectedRoute>
    </Layout>
  },
  {
    path: "/faqs/:id",
    element: <Layout><FAQDetailPage /></Layout>,
  },
  {
    path: "/find-mentor",
    element: <Layout><MentorListPage /></Layout>,
  },
  {
    path: "/mentors/:id",
    element: <Layout><MentorDetailPage /></Layout>,
  },

  {
    path: "/profile",
    element: <Layout>
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/booking-history",
    element: <Layout>
      <ProtectedRoute>
        <BookingHistoryPage />
      </ProtectedRoute>
    </Layout>,
  },
  {
    path: "/booking-success",
    element: <Layout><BookingSuccessPage /></Layout>,
  },
  {
    path: "/booking-failed",
    element: <Layout><BookingFailedPage /></Layout>,
  },
  {
    path: "*",
    element: <Layout><NotFoundPage /></Layout>,
  },
]);

export default routes;