import React, { useState } from 'react';
import { emailService } from '../services/api';

const EmailNotification = ({ application, onClose }) => {
  const [emailData, setEmailData] = useState({
    to: application.user?.email || '',
    subject: '',
    message: '',
    type: 'status_update'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const emailTemplates = {
    status_update: {
      subject: `Application Update - ${application.job?.title}`,
      message: `Dear ${application.user?.firstName},\n\nWe wanted to update you on the status of your application for the ${application.job?.title} position at ${application.job?.company}.\n\nYour application status has been updated to: ${application.status}\n\nWe will be in touch with further updates.\n\nBest regards,\nDebo Engineering HR Team`
    },
    interview_invite: {
      subject: `Interview Invitation - ${application.job?.title}`,
      message: `Dear ${application.user?.firstName},\n\nCongratulations! We are pleased to invite you for an interview for the ${application.job?.title} position at ${application.job?.company}.\n\nInterview Details:\n- Date: [To be scheduled]\n- Time: [To be scheduled]\n- Location: [To be confirmed]\n\nPlease confirm your availability and we will send you the detailed schedule.\n\nBest regards,\nDebo Engineering HR Team`
    },
    rejection: {
      subject: `Application Update - ${application.job?.title}`,
      message: `Dear ${application.user?.firstName},\n\nThank you for your interest in the ${application.job?.title} position at ${application.job?.company}.\n\nAfter careful consideration, we have decided to move forward with other candidates for this position. However, we were impressed with your qualifications and would like to keep your profile on file for future opportunities.\n\nWe encourage you to apply for other positions that match your skills and experience.\n\nBest regards,\nDebo Engineering HR Team`
    },
    acceptance: {
      subject: `Congratulations! Job Offer - ${application.job?.title}`,
      message: `Dear ${application.user?.firstName},\n\nCongratulations! We are delighted to offer you the position of ${application.job?.title} at ${application.job?.company}.\n\nWe were impressed with your qualifications and believe you will be a valuable addition to our team.\n\nNext Steps:\n1. Please review the attached offer letter\n2. Confirm your acceptance by [date]\n3. Complete the onboarding process\n\nWe look forward to welcoming you to the team!\n\nBest regards,\nDebo Engineering HR Team`
    }
  };

  const handleTemplateChange = (type) => {
    setEmailData(prev => ({
      ...prev,
      type,
      subject: emailTemplates[type].subject,
      message: emailTemplates[type].message
    }));
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await emailService.sendNotification({
        ...emailData,
        applicationId: application.id
      });
      
      if (response.success) {
        setMessage('Email sent successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to send email');
      }
    } catch (error) {
      setError('Error sending email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-notification-modal">
      <div className="modal-overlay">
        <div className="modal-content email-modal">
          <div className="modal-header">
            <h3>Send Email Notification</h3>
            <button onClick={onClose} className="modal-close">×</button>
          </div>

          <div className="modal-body">
            {message && (
              <div className="success-message">
                {message}
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="email-form">
              <div className="form-group">
                <label>Email Template</label>
                <select
                  value={emailData.type}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="form-select"
                >
                  <option value="status_update">Status Update</option>
                  <option value="interview_invite">Interview Invitation</option>
                  <option value="rejection">Rejection Notice</option>
                  <option value="acceptance">Job Offer</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              <div className="form-group">
                <label>To</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows="8"
                  className="form-textarea"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="btn btn-primary"
                  disabled={loading || !emailData.to || !emailData.subject || !emailData.message}
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotification;
