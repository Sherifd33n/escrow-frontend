CREATE DATABASE IF NOT EXISTS `escrow_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `escrow_db`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('client', 'provider', 'admin') NOT NULL DEFAULT 'client',
  `phone` VARCHAR(50) DEFAULT NULL,
  `kyc_tier` INT NOT NULL DEFAULT 1,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- OTP codes table
CREATE TABLE IF NOT EXISTS `otp_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `code` VARCHAR(6) NOT NULL,
  `type` ENUM('signup', 'forgot') NOT NULL DEFAULT 'signup',
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Wallets table
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Transactions (Escrow deals) table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `txn_code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `buyer_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `status` ENUM('pending', 'funded', 'inprogress', 'inspection', 'audit', 'approved', 'revision', 'completed', 'disputed') NOT NULL DEFAULT 'pending',
  `review_days` INT NOT NULL DEFAULT 3,
  `milestones_count` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Milestones table
CREATE TABLE IF NOT EXISTS `milestones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('pending', 'paid', 'due', 'upcoming') NOT NULL DEFAULT 'pending',
  `deliverable_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Wallet transactions (history) table
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wallet_id` INT NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'escrow_refund') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `reference` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `plan_id` VARCHAR(50) NOT NULL DEFAULT 'silver',
  `billing_cycle` ENUM('monthly', 'annual') NOT NULL DEFAULT 'monthly',
  `status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `starts_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ends_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Disputes table
CREATE TABLE IF NOT EXISTS `disputes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` INT NOT NULL,
  `filed_by` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `evidence` TEXT DEFAULT NULL,
  `status` ENUM('filed', 'under_review', 'resolved') NOT NULL DEFAULT 'filed',
  `resolution` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`filed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
