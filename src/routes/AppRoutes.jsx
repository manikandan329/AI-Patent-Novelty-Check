import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AdminRoute from '../components/layout/AdminRoute';

// Dashboard Layout & Views
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import PatentAnalysisHubView from '../pages/dashboard/PatentAnalysisHubView';
import PatentInsightsHubView from '../pages/dashboard/PatentInsightsHubView';
import ReportsHubView from '../pages/dashboard/ReportsHubView';
import HistoryView from '../pages/dashboard/HistoryView';
import AdvancedPatentComparisonView from '../pages/dashboard/AdvancedPatentComparisonView';
import AiAssistantView from '../pages/dashboard/AiAssistantView';
import SettingsView from '../pages/dashboard/SettingsView';
import AiProcessingView from '../pages/dashboard/AiProcessingView';
import SimilarityResultsView from '../pages/dashboard/SimilarityResultsView';
import InnovationView from '../pages/dashboard/InnovationView';
import MarketInsightsView from '../pages/dashboard/MarketInsightsView';
import CollaborationView from '../pages/dashboard/CollaborationView';

// Admin Layout & Views
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardView from '../pages/admin/AdminDashboardView';
import KnowledgeBaseView from '../pages/admin/KnowledgeBaseView';
import VectorIndexView from '../pages/admin/VectorIndexView';
import UserManagementView from '../pages/admin/UserManagementView';
import SystemLogsView from '../pages/admin/SystemLogsView';
import SystemMonitoringView from '../pages/admin/SystemMonitoringView';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Protected Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboard Shell & Sub-Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* 1. Patent Analysis Hub & Legacy/Deep Routes */}
        <Route path="analysis" element={<PatentAnalysisHubView />} />
        <Route path="novelty-analysis" element={<PatentAnalysisHubView />} />
        <Route path="novelty-analysis/:analysisId" element={<PatentAnalysisHubView />} />
        <Route path="new-analysis" element={<PatentAnalysisHubView />} />
        <Route path="workspace" element={<PatentAnalysisHubView />} />
        <Route path="nlp-processing" element={<PatentAnalysisHubView />} />
        <Route path="nlp-processing/:submissionId" element={<PatentAnalysisHubView />} />

        {/* Redirect removed Patent Research route to Patent Analysis */}
        <Route path="research" element={<Navigate to="/dashboard/analysis" replace />} />

        {/* 3. Patent Comparison */}
        <Route path="compare" element={<AdvancedPatentComparisonView />} />
        <Route path="compare/:submissionId" element={<AdvancedPatentComparisonView />} />

        {/* 4. Patent Insights Hub (Tech Intelligence & Citation Graph) */}
        <Route path="insights" element={<PatentInsightsHubView />} />
        <Route path="intelligence" element={<PatentInsightsHubView />} />
        <Route path="intelligence/:submissionId" element={<PatentInsightsHubView />} />
        <Route path="relationships" element={<PatentInsightsHubView />} />
        <Route path="relationships/:submissionId" element={<PatentInsightsHubView />} />

        {/* 5. Reports Hub (Library & Generator/Viewer) */}
        <Route path="reports" element={<ReportsHubView />} />
        <Route path="reports/:reportId" element={<ReportsHubView />} />
        <Route path="report" element={<ReportsHubView />} />
        <Route path="report/:reportId" element={<ReportsHubView />} />
        <Route path="analysis/:submissionId" element={<ReportsHubView />} />

        {/* 6. History */}
        <Route path="history" element={<HistoryView />} />

        {/* Contextual & Supporting Features */}
        <Route path="ai-assistant" element={<AiAssistantView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="processing/:submissionId" element={<AiProcessingView />} />
        <Route path="results/:submissionId" element={<SimilarityResultsView />} />
        <Route path="innovation/:submissionId" element={<InnovationView />} />
        <Route path="market-insights/:submissionId" element={<MarketInsightsView />} />
        <Route path="collaboration" element={<CollaborationView />} />
      </Route>

      {/* Protected Admin Shell & Sub-Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardView />} />
        <Route path="monitoring" element={<SystemMonitoringView />} />
        <Route path="knowledge-base" element={<KnowledgeBaseView />} />
        <Route path="vector-index" element={<VectorIndexView />} />
        <Route path="users" element={<UserManagementView />} />
        <Route path="logs" element={<SystemLogsView />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
