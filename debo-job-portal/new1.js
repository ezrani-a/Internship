// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { JobSeekerRoute, EmployerRoute, AdminRoute } from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobManagement from './pages/admin/JobManagement';
import ApplicationReview from './pages/admin/ApplicationReview';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes - All authenticated users */}
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Job Seeker only routes */}
              <Route path="/applications" element={
                <JobSeekerRoute>
                  <div>Applications Page (Job Seeker Only)</div>
                </JobSeekerRoute>
              } />

              {/* Employer only routes */}
              <Route path="/employer/jobs" element={
                <EmployerRoute>
                  <div>Employer Jobs Management</div>
                </EmployerRoute>
              } />

              {/* Admin only routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;