-- Add is_active column to users (default active)
ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;

-- Set to active for existing rows if NULL
UPDATE users SET is_active = 1 WHERE is_active IS NULL;