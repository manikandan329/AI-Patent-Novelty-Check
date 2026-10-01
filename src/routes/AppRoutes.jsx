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
import NewAnalysisView from '../pages/dashboard/NewAnalysisView';
import HistoryView from '../pages/dashboard/HistoryView';
import ReportsView from '../pages/dashboard/ReportsView';
import AiAssistantView from '../pages/dashboard/AiAssistantView';
import SettingsView from '../pages/dashboard/SettingsView';
import AiProcessingView from '../pages/dashboard/AiProcessingView';
import SimilarityResultsView from '../pages/dashboard/SimilarityResultsView';
import PatentAnalysisReportView from '../pages/dashboard/PatentAnalysisReportView';
import ReportComparisonView from '../pages/dashboard/ReportComparisonView';
import AdvancedPatentComparisonView from '../pages/dashboard/AdvancedPatentComparisonView';
import NlpDocumentProcessingView from '../pages/dashboard/NlpDocumentProcessingView';
import PatentResearchView from '../pages/dashboard/PatentResearchView';
import PatentRelationshipView from '../pages/dashboard/PatentRelationshipView';
import TechnologyIntelligenceView from '../pages/dashboard/TechnologyIntelligenceView';
import InnovationView from '../pages/dashboard/InnovationView';
import MarketInsightsView from '../pages/dashboard/MarketInsightsView';
import CollaborationView from '../pages/dashboard/CollaborationView';
import PatentNoveltyAnalysisView from '../pages/dashboard/PatentNoveltyAnalysisView';
import PatentWorkspaceView from '../pages/dashboard/PatentWorkspaceView';

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
        <Route path="new-analysis" element={<NewAnalysisView />} />
        <Route path="workspace" element={<PatentWorkspaceView />} />
        <Route path="novelty-analysis" element={<PatentNoveltyAnalysisView />} />
        <Route path="novelty-analysis/:analysisId" element={<PatentNoveltyAnalysisView />} />
        <Route path="history" element={<HistoryView />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="ai-assistant" element={<AiAssistantView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="nlp-processing" element={<NlpDocumentProcessingView />} />
        <Route path="nlp-processing/:submissionId" element={<NlpDocumentProcessingView />} />
        <Route path="processing/:submissionId" element={<AiProcessingView />} />
        <Route path="results/:submissionId" element={<SimilarityResultsView />} />
        <Route path="analysis/:submissionId" element={<PatentAnalysisReportView />} />
        <Route path="compare" element={<AdvancedPatentComparisonView />} />
        <Route path="compare/:submissionId" element={<AdvancedPatentComparisonView />} />
        <Route path="report" element={<PatentAnalysisReportView />} />
        <Route path="report/:reportId" element={<PatentAnalysisReportView />} />
        <Route path="research" element={<PatentResearchView />} />
        <Route path="relationships" element={<PatentRelationshipView />} />
        <Route path="relationships/:submissionId" element={<PatentRelationshipView />} />
        <Route path="intelligence" element={<TechnologyIntelligenceView />} />
        <Route path="intelligence/:submissionId" element={<TechnologyIntelligenceView />} />
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
