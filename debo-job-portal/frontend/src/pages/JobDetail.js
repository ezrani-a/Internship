import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsService, applicationsService } from '../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobsService.getJob(id);
      if (response.success) {
        setJob(response.data);
      } else {
        setError('Job not found');
      }
    } catch (error) {
      setError('Error loading job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      const applicationData = {
        jobId: id,
        coverLetter: `I am interested in applying for the ${job.title} position at ${job.company}.`
      };

      const response = await applicationsService.createApplication(applicationData);
      if (response.success) {
        setApplicationSuccess(true);
      } else {
        setError(response.message || 'Failed to submit application');
      }
    } catch (error) {
      setError('Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="error-page">
        <h2>Job Not Found</h2>
        <p>{error}</p>
        <Link to="/jobs" className="btn btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="job-detail-header">
          <Link to="/jobs" className="back-link">
            ← Back to Jobs
          </Link>
          
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <h2 className="company-name">{job.company}</h2>
            
            <div className="job-meta">
              <span className="job-location">📍 {job.location}</span>
              <span className="job-type">⏰ {job.type}</span>
              <span className="job-salary">💰 {job.salary}</span>
              <span className="job-posted">📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="job-detail-content">
          <div className="job-main">
            <div className="job-section">
              <h3>Job Description</h3>
              <div className="job-description">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {job.requirements && (
              <div className="job-section">
                <h3>Requirements</h3>
                <ul className="requirements-list">
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && (
              <div className="job-section">
                <h3>Responsibilities</h3>
                <ul className="responsibilities-list">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="job-section">
                <h3>Required Skills</h3>
                <div className="skills-container">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.benefits && (
              <div className="job-section">
                <h3>Benefits</h3>
                <ul className="benefits-list">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="job-sidebar">
            <div className="apply-card">
              {applicationSuccess ? (
                <div className="application-success">
                  <h3>✅ Application Submitted!</h3>
                  <p>Your application has been successfully submitted. We'll review it and get back to you soon.</p>
                  <Link to="/applications" className="btn btn-primary">
                    View My Applications
                  </Link>
                </div>
              ) : (
                <>
                  <h3>Apply for this job</h3>
                  {user ? (
                    <div>
                      <p>Ready to apply? Click the button below to submit your application.</p>
                      {error && (
                        <div className="error-message">
                          {error}
                        </div>
                      )}
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="btn btn-success apply-btn"
                      >
                        {applying ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p>You need to be logged in to apply for this job.</p>
                      <Link to="/login" className="btn btn-primary">
                        Login to Apply
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="job-info-card">
              <h4>Job Information</h4>
              <div className="info-item">
                <strong>Company:</strong> {job.company}
              </div>
              <div className="info-item">
                <strong>Location:</strong> {job.location}
              </div>
              <div className="info-item">
                <strong>Type:</strong> {job.type}
              </div>
              <div className="info-item">
                <strong>Salary:</strong> {job.salary}
              </div>
              <div className="info-item">
                <strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="share-card">
              <h4>Share this job</h4>
              <div className="share-buttons">
                <button className="btn btn-secondary share-btn">
                  📧 Email
                </button>
                <button className="btn btn-secondary share-btn">
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
