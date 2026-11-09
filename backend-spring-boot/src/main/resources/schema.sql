-- WhatChat MySQL 8.x Database DDL
-- Production Schema for Users, Conversations, Messages, Attachments & My Space

CREATE DATABASE IF NOT EXISTS whatchat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE whatchat_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    country_code VARCHAR(8) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    avatar_url VARCHAR(500),
    about VARCHAR(255) DEFAULT 'Hey there! I am using WhatChat.',
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_phone (phone_number),
    INDEX idx_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Settings & Privacy Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id VARCHAR(36) PRIMARY KEY,
    last_seen_privacy ENUM('EVERYONE', 'CONTACTS', 'NOBODY') DEFAULT 'CONTACTS',
    read_receipts BOOLEAN DEFAULT TRUE,
    profile_photo_privacy ENUM('EVERYONE', 'CONTACTS', 'NOBODY') DEFAULT 'EVERYONE',
    phone_discovery BOOLEAN DEFAULT TRUE,
    storage_used_bytes BIGINT DEFAULT 0,
    storage_quota_bytes BIGINT DEFAULT 16106127360, -- 15 GB
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Conversations Table (1:1 and Groups)
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('DIRECT', 'GROUP') NOT NULL,
    name VARCHAR(120),
    description TEXT,
    avatar_url VARCHAR(500),
    group_category ENUM('COLLEGE', 'PROJECT', 'FAMILY', 'BUSINESS', 'COMMUNITY', 'OTHER') NULL,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_conv_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Conversation Members Table
CREATE TABLE IF NOT EXISTS conversation_members (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('MEMBER', 'ADMIN') DEFAULT 'MEMBER',
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    unread_count INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_conv_user (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    text_content TEXT,
    reply_to_id VARCHAR(36) NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted_for_everyone BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_msg_conv_time (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Message Attachments (S3 Object Storage metadata)
CREATE TABLE IF NOT EXISTS message_attachments (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    media_type ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO') NOT NULL,
    duration_seconds INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Message Delivery & Read Receipts
CREATE TABLE IF NOT EXISTS message_receipts (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    status ENUM('SENT', 'DELIVERED', 'READ') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_msg_user_receipt (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- MY SPACE: PERSONAL EVENT-BASED MEMORY STORAGE SYSTEM
-- =========================================================

-- 8. Event Categories Table
CREATE TABLE IF NOT EXISTS event_categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL, -- NULL indicates system global category
    name VARCHAR(80) NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Heart',
    description VARCHAR(255),
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Personal Events Table (Flagship Feature)
CREATE TABLE IF NOT EXISTS personal_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATE NULL,
    cover_image_key VARCHAR(500),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    memory_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE RESTRICT,
    INDEX idx_event_user_date (user_id, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Event Messages & Personal Memory Log
CREATE TABLE IF NOT EXISTS event_messages (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    message_type ENUM('NOTE', 'PHOTO', 'DOCUMENT', 'AUDIO', 'REFLECTION', 'FORWARDED_CHAT') NOT NULL,
    content TEXT NOT NULL,
    memory_date DATE NOT NULL,
    is_highlight BOOLEAN DEFAULT FALSE,
    source_chat_name VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES personal_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_msg_date (event_id, memory_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Event Attachments (S3 metadata)
CREATE TABLE IF NOT EXISTS event_attachments (
    id VARCHAR(36) PRIMARY KEY,
    event_message_id VARCHAR(36) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    media_type ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO') NOT NULL,
    duration_seconds INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_message_id) REFERENCES event_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Saved Items (Quick Bookmarks / Items saved to My Space)
CREATE TABLE IF NOT EXISTS saved_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    source_message_id VARCHAR(36) NULL,
    event_id VARCHAR(36) NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    item_type ENUM('TEXT', 'IMAGE', 'FILE', 'AUDIO') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES personal_events(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 13. PUSH NOTIFICATIONS & DEVICE REGISTRATION
-- =========================================================

-- Registered WebPush & Mobile Push Devices
CREATE TABLE IF NOT EXISTS device_push_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    device_token VARCHAR(500) NOT NULL,
    platform ENUM('WEB', 'ANDROID', 'IOS') NOT NULL,
    endpoint VARCHAR(500) NULL,
    p256dh VARCHAR(255) NULL,
    auth VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_token (user_id, device_token),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id VARCHAR(36) PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT TRUE,
    show_previews BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    group_mode ENUM('ALL', 'MENTIONS_ONLY', 'NONE') DEFAULT 'ALL',
    mention_alerts BOOLEAN DEFAULT TRUE,
    memory_milestones BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

