-- Create review_tokens table
CREATE TABLE IF NOT EXISTS review_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    INDEX idx_token (token),
    INDEX idx_booking_id (booking_id),
    INDEX idx_expires_at (expires_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
