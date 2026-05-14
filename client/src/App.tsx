import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectEditPage from './pages/ProjectEditPage';
import ProjectViewPage from './pages/ProjectViewPage';
import SurveyPage from './pages/SurveyPage';
import AnswerSuccessPage from './pages/AnswerSuccessPage';
import { useAuthStore } from './store/auth';

const { Header, Content, Footer } = Layout;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
          SurveyKing v2
        </div>
      </Header>
      <Content style={{ padding: '0 50px', flex: 1 }}>
        <div style={{ padding: 24, minHeight: 380 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/survey/:id" element={<SurveyPage />} />
            <Route path="/answer/success" element={<AnswerSuccessPage />} />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/new"
              element={
                <ProtectedRoute>
                  <ProjectEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ProjectEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id/preview"
              element={
                <ProtectedRoute>
                  <ProjectViewPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        SurveyKing v2 © 2025 - Built with Go + React + PostgreSQL
      </Footer>
    </Layout>
  );
};

export default App;