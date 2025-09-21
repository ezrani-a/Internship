// backend/config/initDatabase.js
const db = require('./db');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Check and add role column to users table if it doesn't exist
    const [userColumns] = await db.execute(
      "SELECT COUNT(*) as count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'",
      [process.env.DB_NAME]
    );
    
    if (userColumns[0].count === 0) {
      await db.execute(
        "ALTER TABLE users ADD COLUMN role ENUM('applicant', 'admin', 'super_admin') DEFAULT 'applicant'"
      );
      console.log('✅ Added role column to users table');
    }

    // Create job_posts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS job_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        required_skills TEXT,
        qualifications TEXT,
        experience_level ENUM(
          'Beginner', 'Early Beginner', 'Junior Developer', 'Mid-Level Developer',
          'Senior Developer', 'Tech Lead', 'Expert Developer', 'Master Developer'
        ) NOT NULL,
        job_type ENUM('Internship', 'Full-time', 'Part-time') NOT NULL,
        application_deadline DATE,
        is_active BOOLEAN DEFAULT true,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ job_posts table ready');

    // Create applications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        job_post_id INT NOT NULL,
        cover_letter TEXT,
        status ENUM(
          'Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'
        ) DEFAULT 'Submitted',
        admin_notes TEXT,
        assigned_level ENUM(
          'Beginner', 'Early Beginner', 'Junior Developer', 'Mid-Level Developer',
          'Senior Developer', 'Tech Lead', 'Expert Developer', 'Master Developer'
        ),
        offer_type ENUM('Unpaid Internship', 'Paid Internship', 'Full-time Employment'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_application (user_id, job_post_id)
      )
    `);
    console.log('✅ applications table ready');

    console.log('✅ All database tables initialized successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// Remove the conditional execution and just export the function
module.exports = initializeDatabase;