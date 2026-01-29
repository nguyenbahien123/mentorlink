-- Alter token columns to support long JWT strings
ALTER TABLE token
  MODIFY COLUMN access_token TEXT,
  MODIFY COLUMN refresh_token TEXT,
  MODIFY COLUMN reset_token TEXT;
