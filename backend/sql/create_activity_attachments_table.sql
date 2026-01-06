-- SQL to create activity_attachments table
CREATE TABLE IF NOT EXISTS activity_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE
);
