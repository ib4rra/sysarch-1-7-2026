-- create_notifications_v2.sql
-- Creates a new notifications table `notifications_v2` without altering the existing `notifications` table.
-- Use this when you want a fresh schema and to avoid in-place ALTERs.

CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'recipient user id',
  `actor_id` BIGINT UNSIGNED NULL COMMENT 'user who triggered the notification (e.g., instructor)',
  `actor_username` VARCHAR(255) NULL,
  `actor_avatar_url` VARCHAR(512) NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('system','announcement','activity','submission','feedback','comment','other') NOT NULL DEFAULT 'system',
  `metadata` JSON NULL COMMENT 'optional JSON payload for extra context (activity_id, announcement_id, etc.)',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_actor_id` (`actor_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: grant minimal privileges if needed (run as admin):
-- GRANT SELECT, INSERT, UPDATE, DELETE ON `notifications_v2` TO 'your_app_user'@'your_host';

-- Notes:
-- 1) This file intentionally does NOT ALTER or DROP the existing `notifications` table.
-- 2) If you want to migrate data from `notifications` into `notifications_v2`, create and run a separate migration script that copies rows and transforms fields as necessary.
-- 3) After creating the table, update backend code to write/read from `notifications_v2` when ready.
