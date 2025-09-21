import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import EmailNotification from '../components/EmailNotification';

const ApplicationManagement = () => {
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailApplication, setEmailApplication] = useState(null);

  useEffect(() => {
    if (user && isAdmin()) {
      fetchApplications();
    }
  }, [user, isAdmin]);

  const fetchApplications = async () => {
    try {
      const response = await adminService.getAllApplications();
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
      case 'shortlisted':
        return 'status-shortlisted';
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

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await adminService.updateApplicationStatus(applicationId, newStatus);
      if (response.success) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
              : app
          )
        );
        setShowModal(false);
        setSelectedApplication(null);
        
        // Show email notification option for status updates
        const application = applications.find(app => app.id === applicationId);
        if (application && ['shortlisted', 'interview', 'accepted', 'rejected'].includes(newStatus)) {
          setEmailApplication(application);
          setShowEmailModal(true);
        }
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleInterviewSchedule = async () => {
    if (!selectedApplication || !interviewDate || !interviewTime) return;
    
    try {
      const interviewData = {
        applicationId: selectedApplication.id,
        date: interviewDate,
        time: interviewTime,
        feedback: feedback
      };
      
      // This would call an interview scheduling API
      console.log('Scheduling interview:', interviewData);
      setShowModal(false);
      setSelectedApplication(null);
      setFeedback('');
      setInterviewDate('');
      setInterviewTime('');
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      app.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading">
        <p>Loading applications...</p>
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
    <div className="application-management">
      <div className="container">
        <div className="page-header">
          <h1>Application Management</h1>
          <p>Review and manage job applications</p>
        </div>

        <div className="management-filters">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Applications ({applications.length})</option>
              <option value="pending">Pending ({applications.filter(app => app.status.toLowerCase() === 'pending').length})</option>
              <option value="reviewed">Reviewed ({applications.filter(app => app.status.toLowerCase() === 'reviewed').length})</option>
              <option value="shortlisted">Shortlisted ({applications.filter(app => app.status.toLowerCase() === 'shortlisted').length})</option>
              <option value="interview">Interview ({applications.filter(app => app.status.toLowerCase() === 'interview').length})</option>
              <option value="accepted">Accepted ({applications.filter(app => app.status.toLowerCase() === 'accepted').length})</option>
              <option value="rejected">Rejected ({applications.filter(app => app.status.toLowerCase() === 'rejected').length})</option>
            </select>
          </div>
        </div>

        <div className="applications-table">
          <div className="table-header">
            <div className="table-cell">Applicant</div>
            <div className="table-cell">Job Title</div>
            <div className="table-cell">Developer Level</div>
            <div className="table-cell">Applied Date</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Actions</div>
          </div>

          {filteredApplications.map((application) => (
            <div key={application.id} className="table-row">
              <div className="table-cell">
                <div className="applicant-info">
                  <div className="applicant-name">
                    {application.user?.firstName} {application.user?.lastName}
                  </div>
                  <div className="applicant-email">{application.user?.email}</div>
                </div>
              </div>
              <div className="table-cell">
                <div className="job-info">
                  <div className="job-title">{application.job?.title}</div>
                  <div className="job-company">{application.job?.company}</div>
                </div>
              </div>
              <div className="table-cell">
                <span className={`developer-level-badge level-${application.user?.developerLevel || 'beginner'}`}>
                  {application.user?.developerLevel || 'Beginner'}
                </span>
              </div>
              <div className="table-cell">
                {new Date(application.createdAt).toLocaleDateString()}
              </div>
              <div className="table-cell">
                <span className={`status-badge ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>
              <div className="table-cell">
                <div className="action-buttons">
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowModal(true);
                    }}
                    className="btn btn-sm btn-primary"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => {
                      setEmailApplication(application);
                      setShowEmailModal(true);
                    }}
                    className="btn btn-sm btn-info"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                    className="btn btn-sm btn-success"
                    disabled={application.status === 'shortlisted'}
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    className="btn btn-sm btn-danger"
                    disabled={application.status === 'rejected'}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="no-applications">
            <h3>No applications found</h3>
            <p>No applications match your current filter criteria.</p>
          </div>
        )}

        {/* Application Review Modal */}
        {showModal && selectedApplication && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Review Application</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="application-details">
                  <div className="detail-section">
                    <h4>Applicant Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Name:</strong> {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                      </div>
                      <div className="detail-item">
                        <strong>Email:</strong> {selectedApplication.user?.email}
                      </div>
                      <div className="detail-item">
                        <strong>Phone:</strong> {selectedApplication.user?.phone || 'Not provided'}
                      </div>
                      <div className="detail-item">
                        <strong>Developer Level:</strong> 
                        <span className={`developer-level-badge level-${selectedApplication.user?.developerLevel || 'beginner'}`}>
                          {selectedApplication.user?.developerLevel || 'Beginner'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Years of Experience:</strong> {selectedApplication.user?.yearsOfExperience || 0}
                      </div>
                      <div className="detail-item">
                        <strong>Preferred Type:</strong> {selectedApplication.user?.internshipType || 'Any'}
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Job Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Position:</strong> {selectedApplication.job?.title}
                      </div>
                      <div className="detail-item">
                        <strong>Company:</strong> {selectedApplication.job?.company}
                      </div>
                      <div className="detail-item">
                        <strong>Location:</strong> {selectedApplication.job?.location}
                      </div>
                      <div className="detail-item">
                        <strong>Type:</strong> {selectedApplication.job?.type}
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Cover Letter</h4>
                    <div className="cover-letter-content">
                      {selectedApplication.coverLetter || 'No cover letter provided'}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Skills</h4>
                    <div className="skills-list">
                      {selectedApplication.user?.skills?.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      )) || <span>No skills listed</span>}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <div className="action-section">
                    <h4>Quick Actions</h4>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'reviewed')}
                        className="btn btn-primary"
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'shortlisted')}
                        className="btn btn-success"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="action-section">
                    <h4>Schedule Interview</h4>
                    <div className="interview-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Interview Date</label>
                          <input
                            type="date"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Interview Time</label>
                          <input
                            type="time"
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Additional Notes</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows="3"
                          placeholder="Add any additional notes or feedback..."
                        />
                      </div>
                      <button
                        onClick={handleInterviewSchedule}
                        className="btn btn-primary"
                        disabled={!interviewDate || !interviewTime}
                      >
                        Schedule Interview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Notification Modal */}
        {showEmailModal && emailApplication && (
          <EmailNotification
            application={emailApplication}
            onClose={() => {
              setShowEmailModal(false);
              setEmailApplication(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
