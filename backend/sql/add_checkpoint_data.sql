-- Add checkpoint_data column to activity_submissions table for DragDrop game progress tracking
ALTER TABLE `activity_submissions` ADD COLUMN `checkpoint_data` JSON DEFAULT NULL AFTER `feedback`;
