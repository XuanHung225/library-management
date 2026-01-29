-- Fix existing schema: add missing columns, populate from legacy columns, add roles and mappings

-- Ensure roles table exists
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed roles
INSERT INTO roles (name) 
VALUES ('user'), ('librarian'), ('admin') 
AS new_roles 
ON DUPLICATE KEY UPDATE name = new_roles.name;

-- Add role_id to users if missing, and attempt to migrate enum role to role_id
ALTER TABLE users ADD COLUMN role_id INT NULL;

-- If users had a role enum column named 'role', map values to role_id
SET @r = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role');

-- If enum 'role' exists, update role_id using it
-- (This will be a no-op if role column does not exist)
-- Use explicit collation when comparing role strings to avoid collation mismatch errors
UPDATE users u
JOIN roles r ON LOWER(u.role) COLLATE utf8mb4_unicode_ci = LOWER(r.name) COLLATE utf8mb4_unicode_ci
SET u.role_id = r.id
WHERE @r > 0;

-- Add foreign key if role_id exists
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- Books: add canonical columns if missing, and copy data from older columns if present
ALTER TABLE books ADD COLUMN published_year YEAR NULL;
ALTER TABLE books ADD COLUMN total_quantity INT DEFAULT 0;
ALTER TABLE books ADD COLUMN available_quantity INT DEFAULT 0;

-- Copy existing data if old columns exist (publish_year, quantity, available)
SET @has_publish = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books' AND COLUMN_NAME = 'publish_year');
SET @has_quantity = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books' AND COLUMN_NAME = 'quantity');
SET @has_available = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books' AND COLUMN_NAME = 'available');

UPDATE books SET published_year = publish_year WHERE @has_publish > 0;
UPDATE books SET total_quantity = quantity WHERE @has_quantity > 0;
UPDATE books SET available_quantity = available WHERE @has_available > 0;

-- Fines: ensure user_id exists and populate from loans
ALTER TABLE fines ADD COLUMN user_id INT NULL;
UPDATE fines f JOIN loans l ON f.loan_id = l.id SET f.user_id = l.user_id;

-- Add indexes (duplicates will be handled by runner)
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_fines_user ON fines(user_id);

-- Recreate admin user if missing (uses roles table)
INSERT INTO users (username, email, password, full_name, role_id)
SELECT 'admin', 'admin@example.com', 'admin', 'Administrator', r.id FROM (SELECT id FROM roles WHERE name = 'admin') r
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
