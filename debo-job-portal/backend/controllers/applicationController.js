// backend/controllers/applicationController.js
const db = require('../config/db');

const { 
  sendApplicationReceivedEmail, 
  sendApplicationStatusEmail 
} = require('../services/emailService');

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { job_post_id, cover_letter } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!job_post_id) {
      return res.status(400).json({
        success: false,
        message: 'Job post ID is required'
      });
    }

    // Check if job exists and is active
    const [jobs] = await db.execute(
      `SELECT id, title, application_deadline 
       FROM job_posts 
       WHERE id = ? AND is_active = TRUE 
       AND (application_deadline IS NULL OR application_deadline >= CURDATE())`,
      [job_post_id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found, not active, or deadline has passed'
      });
    }

    // Check if already applied
    const [existingApplications] = await db.execute(
      'SELECT id FROM applications WHERE user_id = ? AND job_post_id = ?',
      [user_id, job_post_id]
    );

    if (existingApplications.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const [result] = await db.execute(
      `INSERT INTO applications (user_id, job_post_id, cover_letter, applied_via) 
       VALUES (?, ?, ?, ?)`,
      [user_id, job_post_id, cover_letter, 'Web']
    );

const applicationData = {
  first_name: applications[0].first_name,
  email: applications[0].email,
  job_title: applications[0].job_title,
  application_id: result.insertId
};
await sendApplicationReceivedEmail(applicationData);
    // Get full application details
    const [applications] = await db.execute(
      `SELECT a.*, jp.title as job_title, jp.experience_level as job_level,
              u.email, p.first_name, p.last_name
       FROM applications a
       JOIN job_posts jp ON a.job_post_id = jp.id
       JOIN users u ON a.user_id = u.id
       JOIN profiles p ON a.user_id = p.user_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: applications[0]
      }
    });

  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's applications
const getUserApplications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT a.*, jp.title as job_title, jp.company, jp.location, 
             jp.experience_level as job_level, jp.job_type,
             jc.name as category_name
      FROM applications a
      JOIN job_posts jp ON a.job_post_id = jp.id
      LEFT JOIN job_categories jc ON jp.category_id = jc.id
      WHERE a.user_id = ?
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM applications a 
      WHERE a.user_id = ?
    `;

    const queryParams = [user_id];
    const countParams = [user_id];

    if (status) {
      baseQuery += ' AND a.status = ?';
      countQuery += ' AND a.status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    baseQuery += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [applications] = await db.execute(baseQuery, queryParams);
    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single application
const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [applications] = await db.execute(
      `SELECT a.*, jp.title as job_title, jp.description as job_description,
              jp.required_skills, jp.qualifications, jp.location as job_location,
              jp.job_type, jp.experience_level as job_level,
              jc.name as category_name,
              u.email, p.first_name, p.last_name, p.phone_number, p.resume_file_path,
              p.education, p.skills as applicant_skills, p.experience as applicant_experience
       FROM applications a
       JOIN job_posts jp ON a.job_post_id = jp.id
       LEFT JOIN job_categories jc ON jp.category_id = jc.id
       JOIN users u ON a.user_id = u.id
       JOIN profiles p ON a.user_id = p.user_id
       WHERE a.id = ? AND a.user_id = ?`,
      [id, user_id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application retrieved successfully',
      data: {
        application: applications[0]
      }
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [result] = await db.execute(
      'DELETE FROM applications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized to withdraw it'
      });
    }

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get all applications for a job
const getJobApplications = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT a.*, u.email, p.first_name, p.last_name, p.phone_number,
             p.education, p.skills, p.experience, p.developer_level,
             jp.title as job_title
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN profiles p ON a.user_id = p.user_id
      JOIN job_posts jp ON a.job_post_id = jp.id
      WHERE a.job_post_id = ?
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM applications a 
      WHERE a.job_post_id = ?
    `;

    const queryParams = [job_id];
    const countParams = [job_id];

    if (status) {
      baseQuery += ' AND a.status = ?';
      countQuery += ' AND a.status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    baseQuery += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [applications] = await db.execute(baseQuery, queryParams);
    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, assigned_level, offer_type } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const [result] = await db.execute(
      `UPDATE applications 
       SET status = ?, admin_notes = ?, assigned_level = ?, offer_type = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, admin_notes, assigned_level, offer_type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    
    // Add to application history
    await db.execute(
      `INSERT INTO application_history (application_id, new_status, changed_by, notes) 
       VALUES (?, ?, ?, ?)`,
      [id, status, req.user.id, `Status changed to: ${status}. Notes: ${admin_notes || 'None'}`]
    );

    // Get updated application
    const [applications] = await db.execute(
      `SELECT a.*, u.email, p.first_name, p.last_name, jp.title as job_title
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN profiles p ON a.user_id = p.user_id
       JOIN job_posts jp ON a.job_post_id = jp.id
       WHERE a.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application: applications[0]
      }
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
const [applicationDetails] = await db.execute(
  `SELECT a.*, u.email, p.first_name, p.last_name, jp.title as job_title
   FROM applications a
   JOIN users u ON a.user_id = u.id
   JOIN profiles p ON a.user_id = p.user_id
   JOIN job_posts jp ON a.job_post_id = jp.id
   WHERE a.id = ?`,
  [id]
);

if (applicationDetails.length > 0) {
  const appData = applicationDetails[0];
  const emailData = {
    first_name: appData.first_name,
    email: appData.email,
    job_title: appData.job_title,
    status: status,
    admin_notes: admin_notes || ''
}};
module.exports = {
  applyForJob,
  getUserApplications,
  getApplication,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus
};