-- Add instructor_id and instructor_username columns to notifications table
-- This migration adds instructor information to grade/feedback notifications

ALTER TABLE `notifications` 
ADD COLUMN `instructor_id` INT(11) NULL AFTER `type`,
ADD COLUMN `instructor_username` VARCHAR(255) NULL AFTER `instructor_id`,
ADD COLUMN `instructor_avatar_url` VARCHAR(512) NULL AFTER `instructor_username`;

-- Add foreign key constraint for instructor_id
ALTER TABLE `notifications`
ADD CONSTRAINT `notifications_instructor_fk` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
