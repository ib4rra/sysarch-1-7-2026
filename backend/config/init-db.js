// Database initialization - creates missing tables and columns
const db = require('./db');

const createTables = () => {
  // Create activity_submissions table if it doesn't exist
  const submissionTableSQL = `
    CREATE TABLE IF NOT EXISTS \`activity_submissions\` (
      \`submission_id\` int(11) NOT NULL AUTO_INCREMENT,
      \`activity_id\` int(11) NOT NULL,
      \`student_id\` int(11) NOT NULL,
      \`submission_text\` longtext,
      \`grade\` decimal(5,2) DEFAULT NULL,
      \`feedback\` text DEFAULT NULL,
      \`submitted_at\` datetime DEFAULT current_timestamp(),
      \`updated_at\` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`submission_id\`),
      UNIQUE KEY \`unique_submission\` (\`activity_id\`,\`student_id\`),
      KEY \`idx_activity\` (\`activity_id\`),
      KEY \`idx_student\` (\`student_id\`),
      CONSTRAINT \`activity_submissions_ibfk_1\` FOREIGN KEY (\`activity_id\`) REFERENCES \`activities\` (\`activity_id\`) ON DELETE CASCADE,
      CONSTRAINT \`activity_submissions_ibfk_2\` FOREIGN KEY (\`student_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;

  db.query(submissionTableSQL, (err) => {
    if (err) {
      console.error('Error creating activity_submissions table:', err);
    } else {
      console.log('✅ activity_submissions table ready');
    }

    // Add columns if they don't exist
    const addGradeColumnSQL = `ALTER TABLE activity_submissions ADD COLUMN IF NOT EXISTS \`grade\` decimal(5,2) DEFAULT NULL`;
    db.query(addGradeColumnSQL, (err) => {
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding grade column:', err);
      } else {
        console.log('✅ grade column ready');
      }
    });

    const addFeedbackColumnSQL = `ALTER TABLE activity_submissions ADD COLUMN IF NOT EXISTS \`feedback\` text DEFAULT NULL`;
    db.query(addFeedbackColumnSQL, (err) => {
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding feedback column:', err);
      } else {
        console.log('✅ feedback column ready');
      }
    });
  });

  // Create activity_submission_attachments table if it doesn't exist
  const attachmentTableSQL = `
    CREATE TABLE IF NOT EXISTS \`activity_submission_attachments\` (
      \`attachment_id\` int(11) NOT NULL AUTO_INCREMENT,
      \`submission_id\` int(11) NOT NULL,
      \`original_name\` varchar(255),
      \`stored_name\` varchar(255),
      \`file_path\` varchar(500),
      \`mime_type\` varchar(100),
      \`file_size\` int(11),
      \`uploaded_at\` datetime DEFAULT current_timestamp(),
      PRIMARY KEY (\`attachment_id\`),
      KEY \`idx_submission\` (\`submission_id\`),
      CONSTRAINT \`activity_submission_attachments_ibfk_1\` FOREIGN KEY (\`submission_id\`) REFERENCES \`activity_submissions\` (\`submission_id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;

  db.query(attachmentTableSQL, (err) => {
    if (err) {
      console.error('Error creating activity_submission_attachments table:', err);
    } else {
      console.log('✅ activity_submission_attachments table ready');
    }
  });
};

module.exports = { createTables };
