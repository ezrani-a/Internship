import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsService } from '../services/api';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await applicationsService.getApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'reviewed':
        return 'status-reviewed';
      case 'interview':
        return 'status-interview';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="loading">
        <p>Loading applications...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-page">
        <h2>Please log in to view your applications</h2>
        <p>You need to be logged in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="container">
        <div className="applications-header">
          <h1>My Applications</h1>
          <p>Track the status of your job applications</p>
        </div>

        <div className="applications-filters">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({applications.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({applications.filter(app => app.status.toLowerCase() === 'pending').length})
            </button>
            <button
              className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
              onClick={() => setFilter('reviewed')}
            >
              Reviewed ({applications.filter(app => app.status.toLowerCase() === 'reviewed').length})
            </button>
            <button
              className={`filter-btn ${filter === 'interview' ? 'active' : ''}`}
              onClick={() => setFilter('interview')}
            >
              Interview ({applications.filter(app => app.status.toLowerCase() === 'interview').length})
            </button>
            <button
              className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
              onClick={() => setFilter('accepted')}
            >
              Accepted ({applications.filter(app => app.status.toLowerCase() === 'accepted').length})
            </button>
            <button
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({applications.filter(app => app.status.toLowerCase() === 'rejected').length})
            </button>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="no-applications">
            <div className="no-applications-content">
              <h3>No applications found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                  : `No applications with status "${filter}" found.`
                }
              </p>
              {filter === 'all' && (
                <Link to="/jobs" className="btn btn-primary">
                  Browse Jobs
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-header">
                  <div className="job-info">
                    <h3>{application.job?.title || 'Job Title'}</h3>
                    <p className="company">{application.job?.company || 'Company Name'}</p>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-item">
                    <strong>Applied:</strong> {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {application.job?.location || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {application.job?.type || 'N/A'}
                  </div>
                  {application.updatedAt !== application.createdAt && (
                    <div className="detail-item">
                      <strong>Last Updated:</strong> {new Date(application.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {application.coverLetter && (
                  <div className="cover-letter">
                    <h4>Cover Letter</h4>
                    <p>{application.coverLetter}</p>
                  </div>
                )}

                <div className="application-actions">
                  <Link 
                    to={`/jobs/${application.jobId}`} 
                    className="btn btn-primary"
                  >
                    View Job
                  </Link>
                  <button className="btn btn-secondary">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="application-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Applications</h3>
              <div className="stat-number">{applications.length}</div>
            </div>
            <div className="stat-card">
              <h3>Pending Review</h3>
              <div className="stat-number">
                {applications.filter(app => app.status.toLowerCase() === 'pending').length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Interviews</h3>
              <div className="stat-number">
                {applications.filter(app => app.status.toLowerCase() === 'interview').length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Accepted</h3>
              <div className="stat-number">
                {applications.filter(app => app.status.toLowerCase() === 'accepted').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
