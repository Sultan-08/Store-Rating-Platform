-- ============================================================================
-- Store Rating Platform Database Schema
-- Database Engine: MySQL 8.0+
-- Description: Complete relational schema including tables, constraints,
--              indexes, and seed data for System Admins, Store Owners, and Users.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS store_rating_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_rating_db;

-- ----------------------------------------------------------------------------
-- Table: users
-- Stores System Administrators, Store Owners, and Normal Users.
-- Constraints:
-- - Name: 20 to 60 characters
-- - Address: Up to 400 characters
-- - Password: 8 to 16 characters (1+ uppercase, 1+ special char)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
  email VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL CHECK (CHAR_LENGTH(address) <= 400),
  role ENUM('ADMIN', 'NORMAL', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL',
  store_id VARCHAR(64) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: stores
-- Stores registered stores managed by System Admin or Store Owners.
-- Constraints:
-- - Name: 20 to 60 characters
-- - Address: Up to 400 characters
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
  email VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL CHECK (CHAR_LENGTH(address) <= 400),
  owner_id VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stores_name (name),
  INDEX idx_stores_owner (owner_id),
  CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add Foreign Key for users.store_id after stores table exists
ALTER TABLE users
  ADD CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- Table: ratings
-- Stores customer ratings (1 to 5 stars) for stores.
-- Constraints:
-- - Unique constraint on (store_id, user_id) so a user rates a store once.
-- - Rating value restricted to 1..5 stars.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id VARCHAR(64) PRIMARY KEY,
  store_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_store_rating (store_id, user_id),
  INDEX idx_ratings_store (store_id),
  INDEX idx_ratings_user (user_id),
  CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA (Demo Accounts & Stores)
-- ============================================================================

-- 1. System Administrator
INSERT INTO users (id, name, email, address, role, password_hash, created_at) VALUES
('user-admin-1', 'System Administrator User Account', 'admin@storeratings.com', '100 Enterprise System Boulevard, Suite 500, Tech City, CA 94016', 'ADMIN', 'AdminPassword123!', '2026-01-01 00:00:00')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Store Owners & Normal Users
INSERT INTO users (id, name, email, address, role, password_hash, created_at) VALUES
('user-owner-1', 'Alexander James Sterling', 'alexander.sterling@techhub.com', '452 Innovation Parkway, Technology Park, San Francisco, CA 94105', 'STORE_OWNER', 'OwnerPassword123!', '2026-01-05 00:00:00'),
('user-owner-2', 'Guinevere Eleanor Vance', 'guinevere.vance@gourmet.com', '789 Culinary Boulevard, Gourmet Quarter, Chicago, IL 60611', 'STORE_OWNER', 'OwnerPassword123!', '2026-01-10 00:00:00'),
('user-normal-1', 'Christopher Harrison Montgomery', 'chris.montgomery@example.com', '1234 Residential Avenue, Apartment 4B, New York, NY 10001', 'NORMAL', 'UserPassword123!', '2026-01-15 00:00:00'),
('user-normal-2', 'Elizabeth Victoria Stanhope', 'elizabeth.stanhope@example.com', '5678 Suburban Meadows Lane, Austin, TX 78701', 'NORMAL', 'UserPassword123!', '2026-01-20 00:00:00'),
('user-normal-3', 'Jonathan Raymond Fairfax', 'jonathan.fairfax@example.com', '9012 Pacific Heights Drive, Seattle, WA 98101', 'NORMAL', 'UserPassword123!', '2026-02-01 00:00:00')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Registered Stores
INSERT INTO stores (id, name, email, address, owner_id, created_at) VALUES
('store-1', 'TechHub Electronics Superstore', 'contact@techhubelectronics.com', '452 Innovation Parkway, Technology Park, San Francisco, CA 94105', 'user-owner-1', '2026-01-05 00:00:00'),
('store-2', 'Gourmet Haven Organic Market', 'info@gourmethavenmarket.com', '789 Culinary Boulevard, Gourmet Quarter, Chicago, IL 60611', 'user-owner-2', '2026-01-10 00:00:00'),
('store-3', 'Apex Fitness & Wellness Center', 'support@apexfitnesscenter.com', '321 Health & Athletic Way, Seattle, WA 98101', NULL, '2026-01-12 00:00:00')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Link store owner user records to stores
UPDATE users SET store_id = 'store-1' WHERE id = 'user-owner-1';
UPDATE users SET store_id = 'store-2' WHERE id = 'user-owner-2';

-- 4. Initial Submitted Ratings
INSERT INTO ratings (id, store_id, user_id, rating, created_at) VALUES
('rating-1', 'store-1', 'user-normal-1', 5, '2026-02-05 00:00:00'),
('rating-2', 'store-1', 'user-normal-2', 4, '2026-02-06 00:00:00'),
('rating-3', 'store-2', 'user-normal-1', 5, '2026-02-07 00:00:00'),
('rating-4', 'store-2', 'user-normal-3', 3, '2026-02-08 00:00:00'),
('rating-5', 'store-3', 'user-normal-2', 4, '2026-02-09 00:00:00')
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
