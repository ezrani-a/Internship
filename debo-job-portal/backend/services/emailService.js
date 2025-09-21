// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  applicationReceived: (data) => ({
    subject: `Application Received - ${data.job_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Debo Engineering</h1>
          </div>
          <div class="content">
            <h2>Application Received</h2>
            <p>Dear <strong>${data.first_name}</strong>,</p>
            <p>Thank you for applying for the <strong>${data.job_title}</strong> position at Debo Engineering.</p>
            <p>We have received your application and will review it carefully. Our team will contact you if your qualifications match our requirements.</p>
            <p><strong>Application Details:</strong></p>
            <ul>
              <li>Position: ${data.job_title}</li>
              <li>Applied on: ${new Date().toLocaleDateString()}</li>
              <li>Reference ID: APP-${data.application_id}</li>
            </ul>
            <p>You can check your application status anytime through your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2024 Debo Engineering. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  applicationStatusUpdate: (data) => ({
    subject: `Application Update - ${data.job_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .status { 
            background: ${data.status === 'Accepted' ? '#10b981' : data.status === 'Rejected' ? '#ef4444' : '#f59e0b'}; 
            color: white; padding: 10px; text-align: center; border-radius: 5px; margin: 15px 0; 
          }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Debo Engineering</h1>
          </div>
          <div class="content">
            <h2>Application Status Update</h2>
            <p>Dear <strong>${data.first_name}</strong>,</p>
            
            <div class="status">
              <h3>Status: ${data.status}</h3>
            </div>

            <p>Your application for <strong>${data.job_title}</strong> has been updated.</p>
            
            ${data.admin_notes ? `<p><strong>Notes from our team:</strong><br>${data.admin_notes}</p>` : ''}
            
            ${data.status === 'Accepted' ? `
              <p>Congratulations! We are excited to move forward with your application.</p>
              <p>Our HR team will contact you shortly with the next steps.</p>
            ` : ''}
            
            ${data.status === 'Rejected' ? `
              <p>Thank you for your interest in Debo Engineering. Unfortunately, we have decided to move forward with other candidates at this time.</p>
              <p>We encourage you to apply for future positions that match your skills and experience.</p>
            ` : ''}
            
            <p><strong>Application Details:</strong></p>
            <ul>
              <li>Position: ${data.job_title}</li>
              <li>Status: ${data.status}</li>
              <li>Updated on: ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 Debo Engineering. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  interviewInvitation: (data) => ({
    subject: `Interview Invitation - ${data.job_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .interview-details { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Debo Engineering</h1>
          </div>
          <div class="content">
            <h2>Interview Invitation</h2>
            <p>Dear <strong>${data.first_name}</strong>,</p>
            
            <p>Congratulations! We are impressed with your application for the <strong>${data.job_title}</strong> position and would like to invite you for an interview.</p>
            
            <div class="interview-details">
              <h3>Interview Details:</h3>
              <p><strong>Date & Time:</strong> ${new Date(data.interview_date).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${data.duration_minutes} minutes</p>
              <p><strong>Type:</strong> ${data.interview_type}</p>
              ${data.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${data.meeting_link}">Join Meeting</a></p>` : ''}
              ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
            </div>

            <p><strong>Preparation Tips:</strong></p>
            <ul>
              <li>Please arrive 5 minutes early</li>
              <li>Have your portfolio and resume ready</li>
              <li>Prepare any questions you may have for us</li>
            </ul>

            <p>Please confirm your availability by replying to this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Debo Engineering. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request - Debo Engineering',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Debo Engineering</h1>
          </div>
          <div class="content">
            <h2>Password Reset</h2>
            <p>Dear <strong>${data.first_name}</strong>,</p>
            
            <p>We received a request to reset your password for your Debo Engineering account.</p>
            
            <p style="text-align: center; margin: 25px 0;">
              <a href="${data.reset_link}" class="button">Reset Password</a>
            </p>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
          </div>
          <div class="footer">
            <p>© 2024 Debo Engineering. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, templateData) => {
  try {
    // In development, log instead of sending actual emails
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Template:', templateName);
      console.log('📧 Data:', templateData);
      return { success: true, message: 'Email logged (development mode)' };
    }

    const transporter = createTransporter();
    const template = emailTemplates[templateName](templateData);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Debo Engineering" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send application received email
const sendApplicationReceivedEmail = async (applicationData) => {
  return await sendEmail(
    applicationData.email,
    'applicationReceived',
    applicationData
  );
};

// Send application status update email
const sendApplicationStatusEmail = async (applicationData) => {
  return await sendEmail(
    applicationData.email,
    'applicationStatusUpdate',
    applicationData
  );
};

// Send interview invitation email
const sendInterviewInvitationEmail = async (interviewData) => {
  return await sendEmail(
    interviewData.email,
    'interviewInvitation',
    interviewData
  );
};

// Send password reset email
const sendPasswordResetEmail = async (userData, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return await sendEmail(
    userData.email,
    'passwordReset',
    { ...userData, reset_link: resetLink }
  );
};

module.exports = {
  sendEmail,
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendInterviewInvitationEmail,
  sendPasswordResetEmail
};