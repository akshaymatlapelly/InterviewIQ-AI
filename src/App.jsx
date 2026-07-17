import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { PageNotFound } from './lib/PageNotFound';
import { Toaster } from 'sonner';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession';
import InterviewHistory from './pages/InterviewHistory';
import FeedbackReport from './pages/FeedbackReport';
import ResumeCenter from './pages/ResumeCenter';
import AITips from './pages/AITips';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';
import InterviewReplay from './pages/InterviewReplay';
import CareerRoadmap from './pages/CareerRoadmap';
import JobMatching from './pages/JobMatching';
import AIPortfolioBuilder from './pages/AIPortfolioBuilder';
import PortfolioPreview from './pages/PortfolioPreview';
import { EntryLoader } from './components/EntryLoader';

export default function App() {
  const [showLoader, setShowLoader] = React.useState(() => {
    return !sessionStorage.getItem('iq_entry_loaded');
  });

  const handleLoaderComplete = () => {
    sessionStorage.setItem('iq_entry_loaded', 'true');
    setShowLoader(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {showLoader ? (
          <EntryLoader onComplete={handleLoaderComplete} />
        ) : (
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/portfolio-preview" element={<PortfolioPreview />} />

              {/* Onboarding without sidebar */}
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

              {/* Protected Routes (under proctored layouts) */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/interview" element={<InterviewSession />} />
                <Route path="/history" element={<InterviewHistory />} />
                <Route path="/feedback/:interviewId" element={<FeedbackReport />} />
                <Route path="/resume" element={<ResumeCenter />} />
                <Route path="/tips" element={<AITips />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/replay/:interviewId" element={<InterviewReplay />} />
                <Route path="/roadmap" element={<CareerRoadmap />} />
                <Route path="/jobs" element={<JobMatching />} />
                <Route path="/portfolio" element={<AIPortfolioBuilder />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </BrowserRouter>
        )}
        <Toaster theme="dark" position="top-right" closeButton richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
