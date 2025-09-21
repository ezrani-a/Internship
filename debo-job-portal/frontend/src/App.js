import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import AdminDashboard from './pages/AdminDashboard';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import ApplicationManagement from './pages/ApplicationManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-job" element={<CreateJob />} />
              <Route path="/admin/edit-job/:id" element={<EditJob />} />
              <Route path="/admin/applications" element={<ApplicationManagement />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
