import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && isAdmin()) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="error-page">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your job portal platform</p>
          <div className="header-actions">
            <Link to="/admin/create-job" className="btn btn-primary">
              Create New Job
            </Link>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3>Total Jobs</h3>
                    <div className="stat-number">
                      {dashboardData?.totalJobs || 0}
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <div className="stat-number">
                      {dashboardData?.totalUsers || 0}
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h3>Total Applications</h3>
                    <div className="stat-number">
                      {dashboardData?.totalApplications || 0}
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>Active Jobs</h3>
                    <div className="stat-number">
                      {dashboardData?.activeJobs || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="recent-activities">
                <h3>Recent Activities</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">🆕</div>
                    <div className="activity-content">
                      <p><strong>New job posted:</strong> Senior Developer at TechCorp</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-content">
                      <p><strong>New user registered:</strong> john.doe@email.com</p>
                      <span className="activity-time">4 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <p><strong>New application:</strong> Frontend Developer position</p>
                      <span className="activity-time">6 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="jobs-tab">
              <div className="tab-header">
                <h3>Job Management</h3>
                <div className="header-actions">
                  <Link to="/admin/create-job" className="btn btn-primary">
                    Create New Job
                  </Link>
                </div>
              </div>
              
              <div className="jobs-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <h4>Total Jobs</h4>
                    <div className="stat-number">{dashboardData?.totalJobs || 0}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Active Jobs</h4>
                    <div className="stat-number">{dashboardData?.activeJobs || 0}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Total Applicants</h4>
                    <div className="stat-number">{dashboardData?.totalApplicants || 0}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Avg. Applicants/Job</h4>
                    <div className="stat-number">
                      {dashboardData?.avgApplicantsPerJob || 0}
                    </div>
                  </div>
                </div>
                
                <div className="recent-jobs">
                  <h4>Recent Job Postings</h4>
                  <div className="jobs-list">
                    <div className="job-item">
                      <div className="job-info">
                        <strong>Senior React Developer</strong>
                        <span>Full-time • Remote</span>
                      </div>
                      <div className="job-stats">
                        <span className="applicant-count">15 applicants</span>
                        <span className="status-badge status-active">Active</span>
                      </div>
                      <div className="job-actions">
                        <Link to="/admin/edit-job/1" className="btn btn-sm btn-primary">
                          Edit
                        </Link>
                      </div>
                    </div>
                    <div className="job-item">
                      <div className="job-info">
                        <strong>Backend Developer</strong>
                        <span>Full-time • Addis Ababa</span>
                      </div>
                      <div className="job-stats">
                        <span className="applicant-count">8 applicants</span>
                        <span className="status-badge status-active">Active</span>
                      </div>
                      <div className="job-actions">
                        <Link to="/admin/edit-job/2" className="btn btn-sm btn-primary">
                          Edit
                        </Link>
                      </div>
                    </div>
                    <div className="job-item">
                      <div className="job-info">
                        <strong>UI/UX Designer</strong>
                        <span>Part-time • Remote</span>
                      </div>
                      <div className="job-stats">
                        <span className="applicant-count">12 applicants</span>
                        <span className="status-badge status-active">Active</span>
                      </div>
                      <div className="job-actions">
                        <Link to="/admin/edit-job/3" className="btn btn-sm btn-primary">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-tab">
              <div className="tab-header">
                <h3>Application Management</h3>
                <div className="header-actions">
                  <Link to="/admin/applications" className="btn btn-primary">
                    Manage Applications
                  </Link>
                </div>
              </div>
              
              <div className="applications-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <h4>Total Applications</h4>
                    <div className="stat-number">{dashboardData?.totalApplications || 0}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Pending Review</h4>
                    <div className="stat-number">
                      {dashboardData?.pendingApplications || 0}
                    </div>
                  </div>
                  <div className="stat-card">
                    <h4>Interviews Scheduled</h4>
                    <div className="stat-number">
                      {dashboardData?.interviewApplications || 0}
                    </div>
                  </div>
                  <div className="stat-card">
                    <h4>Accepted</h4>
                    <div className="stat-number">
                      {dashboardData?.acceptedApplications || 0}
                    </div>
                  </div>
                </div>
                
                <div className="recent-applications">
                  <h4>Recent Applications</h4>
                  <div className="applications-list">
                    <div className="application-item">
                      <div className="applicant-info">
                        <strong>John Doe</strong>
                        <span>Frontend Developer</span>
                      </div>
                      <div className="application-status">
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                    </div>
                    <div className="application-item">
                      <div className="applicant-info">
                        <strong>Jane Smith</strong>
                        <span>Backend Developer</span>
                      </div>
                      <div className="application-status">
                        <span className="status-badge status-reviewed">Reviewed</span>
                      </div>
                    </div>
                    <div className="application-item">
                      <div className="applicant-info">
                        <strong>Mike Johnson</strong>
                        <span>Full Stack Developer</span>
                      </div>
                      <div className="application-status">
                        <span className="status-badge status-interview">Interview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="tab-header">
                <h3>User Management</h3>
                <div className="search-controls">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="users-table">
                <div className="table-header">
                  <div className="table-cell">Name</div>
                  <div className="table-cell">Email</div>
                  <div className="table-cell">Role</div>
                  <div className="table-cell">Joined</div>
                  <div className="table-cell">Applications</div>
                  <div className="table-cell">Actions</div>
                </div>
                
                <div className="table-row">
                  <div className="table-cell">John Doe</div>
                  <div className="table-cell">john.doe@email.com</div>
                  <div className="table-cell">User</div>
                  <div className="table-cell">2024-01-10</div>
                  <div className="table-cell">5</div>
                  <div className="table-cell">
                    <button className="btn btn-sm btn-primary">View</button>
                    <button className="btn btn-sm btn-warning">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
