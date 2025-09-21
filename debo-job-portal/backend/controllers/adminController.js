// backend/controllers/adminController.js
const db = require('../config/db');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingApplications,
      hiredApplications
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM users WHERE role = "applicant"'),
      db.execute('SELECT COUNT(*) as count FROM job_posts'),
      db.execute('SELECT COUNT(*) as count FROM applications'),
      db.execute('SELECT COUNT(*) as count FROM job_posts WHERE is_active = TRUE AND (application_deadline IS NULL OR application_deadline >= CURDATE())'),
      db.execute('SELECT COUNT(*) as count FROM applications WHERE status = "Submitted" OR status = "Under Review"'),
      db.execute('SELECT COUNT(*) as count FROM applications WHERE status = "Hired"')
    ]);

    // Get application status counts
    const [statusCounts] = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
      ORDER BY count DESC
    `);

    // Get recent applications (last 10)
    const [recentApplications] = await db.execute(`
      SELECT a.*, u.email, p.first_name, p.last_name, jp.title as job_title
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN profiles p ON a.user_id = p.user_id
      JOIN job_posts jp ON a.job_post_id = jp.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // Get job application counts (top 5 most applied jobs)
    const [jobStats] = await db.execute(`
      SELECT jp.id, jp.title, COUNT(a.id) as application_count
      FROM job_posts jp
      LEFT JOIN applications a ON jp.id = a.job_post_id
      WHERE jp.is_active = TRUE
      GROUP BY jp.id, jp.title
      ORDER BY application_count DESC
      LIMIT 5
    `);

    // Get monthly application trends (last 6 months)
    const [monthlyTrends] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as application_count
      FROM applications 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get developer level distribution
    const [levelDistribution] = await db.execute(`
      SELECT 
        COALESCE(p.developer_level, 'Not Specified') as level,
        COUNT(*) as count
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'applicant'
      GROUP BY p.developer_level
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        stats: {
          totalUsers: totalUsers[0][0].count,
          totalJobs: totalJobs[0][0].count,
          totalApplications: totalApplications[0][0].count,
          activeJobs: activeJobs[0][0].count,
          pendingApplications: pendingApplications[0][0].count,
          hiredCandidates: hiredApplications[0][0].count
        },
        applicationStatus: statusCounts,
        recentApplications,
        popularJobs: jobStats,
        monthlyTrends,
        levelDistribution
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users with profiles
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, developer_level } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        u.id, u.email, u.role, u.is_verified, u.created_at as user_created,
        p.first_name, p.last_name, p.phone_number, p.developer_level,
        p.education, p.skills, p.experience, p.years_of_experience,
        p.resume_file_path, p.linkedin_url, p.github_url,
        (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id) as application_count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;

    const queryParams = [];
    const countParams = [];

    if (role) {
      baseQuery += ' AND u.role = ?';
      countQuery += ' AND u.role = ?';
      queryParams.push(role);
      countParams.push(role);
    }

    if (developer_level) {
      baseQuery += ' AND p.developer_level = ?';
      countQuery += ' AND p.developer_level = ?';
      queryParams.push(developer_level);
      countParams.push(developer_level);
    }

    if (search) {
      baseQuery += ' AND (u.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.skills LIKE ?)';
      countQuery += ' AND (u.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.skills LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    baseQuery += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [users] = await db.execute(baseQuery, queryParams);
    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user by ID with full details
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(`
      SELECT 
        u.id, u.email, u.role, u.is_verified, u.created_at as user_created,
        p.*,
        (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id) as total_applications,
        (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id AND a.status = 'Accepted') as accepted_applications,
        (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id AND a.status = 'Rejected') as rejected_applications
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's applications
    const [applications] = await db.execute(`
      SELECT a.*, jp.title as job_title, jp.company, jp.experience_level as job_level
      FROM applications a
      JOIN job_posts jp ON a.job_post_id = jp.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: users[0],
        applications
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['applicant', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be applicant, admin, or super_admin'
      });
    }

    // Check if user exists
    const [users] = await db.execute(
      'SELECT id, email FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [result] = await db.execute(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [role, id]
    );

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        userId: id,
        email: users[0].email,
        newRole: role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await db.execute(
      'SELECT id, email, role FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Prevent deletion of own account or super_admin
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin accounts'
      });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Delete user's applications first (due to foreign key constraints)
      await db.execute('DELETE FROM applications WHERE user_id = ?', [id]);
      
      // Delete user's profile
      await db.execute('DELETE FROM profiles WHERE user_id = ?', [id]);
      
      // Delete user
      await db.execute('DELETE FROM users WHERE id = ?', [id]);

      await db.execute('COMMIT');

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: {
          deletedUserId: id,
          deletedUserEmail: user.email
        }
      });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all applications with filters
const getAllApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      job_id, 
      developer_level,
      start_date,
      end_date 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        a.*, 
        u.email, 
        p.first_name, 
        p.last_name, 
        p.developer_level,
        p.skills,
        p.experience,
        jp.title as job_title,
        jp.experience_level as job_required_level,
        jc.name as job_category
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN profiles p ON a.user_id = p.user_id
      JOIN job_posts jp ON a.job_post_id = jp.id
      LEFT JOIN job_categories jc ON jp.category_id = jc.id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN profiles p ON a.user_id = p.user_id
      WHERE 1=1
    `;

    const queryParams = [];
    const countParams = [];

    if (status) {
      baseQuery += ' AND a.status = ?';
      countQuery += ' AND a.status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    if (job_id) {
      baseQuery += ' AND a.job_post_id = ?';
      countQuery += ' AND a.job_post_id = ?';
      queryParams.push(job_id);
      countParams.push(job_id);
    }

    if (developer_level) {
      baseQuery += ' AND p.developer_level = ?';
      countQuery += ' AND p.developer_level = ?';
      queryParams.push(developer_level);
      countParams.push(developer_level);
    }

    if (start_date) {
      baseQuery += ' AND DATE(a.created_at) >= ?';
      countQuery += ' AND DATE(a.created_at) >= ?';
      queryParams.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      baseQuery += ' AND DATE(a.created_at) <= ?';
      countQuery += ' AND DATE(a.created_at) <= ?';
      queryParams.push(end_date);
      countParams.push(end_date);
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
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllApplications
};