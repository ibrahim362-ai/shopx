-- Add reply fields to messages table
ALTER TABLE `messages` 
ADD COLUMN `hasReply` BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN `replyContent` TEXT NULL,
ADD COLUMN `repliedAt` DATETIME(3) NULL,
ADD COLUMN `repliedBy` INTEGER NULL;

-- Add foreign key constraint for repliedBy
ALTER TABLE `messages` 
ADD CONSTRAINT `messages_repliedBy_fkey` 
FOREIGN KEY (`repliedBy`) REFERENCES `admins`(`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;