-- Professional E-Commerce Features Migration
-- This migration adds enterprise-level features to the database

-- Add new columns to existing tables
ALTER TABLE `admins` 
ADD COLUMN `email` VARCHAR(191) NULL UNIQUE,
ADD COLUMN `role_id` INTEGER NULL,
ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN `last_login` DATETIME(3) NULL;

ALTER TABLE `categories` 
ADD COLUMN `display_order` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `meta_keywords` VARCHAR(255) NULL,
ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `deleted_at` DATETIME(3) NULL;

ALTER TABLE `products` 
ADD COLUMN `discount_start` DATETIME(3) NULL,
ADD COLUMN `discount_end` DATETIME(3) NULL,
ADD COLUMN `low_stock_alert` INTEGER NOT NULL DEFAULT 5,
ADD COLUMN `barcode` VARCHAR(191) NULL UNIQUE,
ADD COLUMN `weight` DECIMAL(8,2) NULL,
ADD COLUMN `dimensions` TEXT NULL,
ADD COLUMN `meta_keywords` VARCHAR(255) NULL,
ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `sales_count` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- Create new tables for professional features

-- Admin Roles
CREATE TABLE `admin_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL UNIQUE,
    `description` VARCHAR(191) NULL,
    `permissions` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
);

-- Product Variants
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10,2) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `sku` VARCHAR(191) NULL UNIQUE,
    `image` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `product_variants_product_id_name_value_key`(`product_id`, `name`, `value`)
);

-- Product Relations (Related, Cross-sell, Up-sell)
CREATE TABLE `product_relations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `main_product_id` INTEGER NOT NULL,
    `related_product_id` INTEGER NOT NULL,
    `relation_type` ENUM('RELATED', 'CROSS_SELL', 'UP_SELL', 'BUNDLE') NOT NULL DEFAULT 'RELATED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `product_relations_main_product_id_related_product_id_key`(`main_product_id`, `related_product_id`)
);

-- Inventory Logs
CREATE TABLE `inventory_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `type` ENUM('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
);

-- Audit Logs
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entity_id` INTEGER NULL,
    `old_values` TEXT NULL,
    `new_values` TEXT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `product_id` INTEGER NULL,
    `category_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
);

-- Discounts/Coupons
CREATE TABLE `discounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL UNIQUE,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING') NOT NULL,
    `value` DECIMAL(10,2) NOT NULL,
    `min_amount` DECIMAL(10,2) NULL,
    `max_amount` DECIMAL(10,2) NULL,
    `usage_limit` INTEGER NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `user_limit` INTEGER NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `categories` TEXT NULL,
    `products` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
);

-- Analytics
CREATE TABLE `analytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL UNIQUE,
    `product_views` INTEGER NOT NULL DEFAULT 0,
    `orders` INTEGER NOT NULL DEFAULT 0,
    `revenue` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `visitors` INTEGER NOT NULL DEFAULT 0,
    `data` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
);

-- Add Foreign Key Constraints
ALTER TABLE `admins` ADD CONSTRAINT `admins_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `product_relations` ADD CONSTRAINT `product_relations_main_product_id_fkey` FOREIGN KEY (`main_product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `product_relations` ADD CONSTRAINT `product_relations_related_product_id_fkey` FOREIGN KEY (`related_product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventory_logs` ADD CONSTRAINT `inventory_logs_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `inventory_logs` ADD CONSTRAINT `inventory_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create Indexes for Performance
CREATE INDEX `idx_products_status_deleted` ON `products`(`status`, `is_deleted`);
CREATE INDEX `idx_products_stock` ON `products`(`stock`);
CREATE INDEX `idx_products_featured` ON `products`(`featured`);
CREATE INDEX `idx_products_category_status` ON `products`(`category_id`, `status`);
CREATE INDEX `idx_categories_parent_status` ON `categories`(`parent_id`, `status`);
CREATE INDEX `idx_categories_display_order` ON `categories`(`display_order`);
CREATE INDEX `idx_audit_logs_admin_date` ON `audit_logs`(`admin_id`, `created_at`);
CREATE INDEX `idx_inventory_logs_product_date` ON `inventory_logs`(`product_id`, `created_at`);
CREATE INDEX `idx_analytics_date` ON `analytics`(`date`);

-- Insert default admin role
INSERT INTO `admin_roles` (`name`, `description`, `permissions`, `created_at`, `updated_at`) 
VALUES (
    'Super Admin', 
    'Full system access', 
    '["*"]', 
    NOW(), 
    NOW()
);

-- Insert sample analytics data for current date
INSERT INTO `analytics` (`date`, `product_views`, `orders`, `revenue`, `visitors`, `created_at`, `updated_at`) 
VALUES (
    CURDATE(), 
    0, 
    0, 
    0.00, 
    0, 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE `updated_at` = NOW();