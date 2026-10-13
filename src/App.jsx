import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProjectList } from './pages/ProjectList';
import { ProjectDetails } from './pages/ProjectDetails';
import { ProjectForm } from './pages/ProjectForm';
import { DomainList } from './pages/DomainList';
import { GuideList } from './pages/GuideList';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes inside Master Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectList filter="all" />} />
            <Route path="my-projects" element={<ProjectList filter="my" />} />
            <Route
              path="projects/new"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
                  <ProjectForm />
                </ProtectedRoute>
              }
            />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
            <Route path="domains" element={<DomainList />} />
            <Route path="guides" element={<GuideList />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
