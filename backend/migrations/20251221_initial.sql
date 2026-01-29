-- Initial migration (2025-12-21)
-- Creates core tables: roles, users, books, password_resets, loans, fines

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role_id INT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(50) UNIQUE,
  publisher VARCHAR(255),
  published_year YEAR NULL,
  total_quantity INT DEFAULT 0,
  available_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_resets (
  username VARCHAR(255) NOT NULL PRIMARY KEY,
  user_id INT NULL,
  code VARCHAR(16) NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loan_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME NOT NULL,
  return_date DATETIME NULL,
  status ENUM('borrowed','returned','late','lost') DEFAULT 'borrowed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reason VARCHAR(255),
  is_paid TINYINT(1) DEFAULT 0,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_books_author ON books(author(50));
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_fines_user ON fines(user_id);

-- Seed roles and a placeholder admin user
INSERT INTO roles (name) 
VALUES ('user'), ('librarian'), ('admin') 
AS new_roles 
ON DUPLICATE KEY UPDATE name = new_roles.name;

-- Insert admin if not exists (password is placeholder 'admin' - hash it later with script)
INSERT INTO users (username, email, password, full_name, role_id)
SELECT 'admin', 'admin@example.com', 'admin', 'Administrator', r.id FROM (SELECT id FROM roles WHERE name = 'admin') r
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Sample books (insert conditionally depending on schema)
SET @has_isbn = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books' AND COLUMN_NAME = 'isbn');

SET @sql = IF(@has_isbn > 0,
  "INSERT INTO books (title, author, isbn, publisher, published_year, total_quantity, available_quantity) 
   VALUES ('Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008, 3, 3), 
          ('The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Addison-Wesley', 1999, 2, 2) 
   AS nb ON DUPLICATE KEY UPDATE title = nb.title;",
  "INSERT INTO books (title, author, publisher, published_year, total_quantity, available_quantity) 
   VALUES ('Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 3, 3), 
          ('The Pragmatic Programmer', 'Andrew Hunt', 'Addison-Wesley', 1999, 2, 2) 
   AS nb ON DUPLICATE KEY UPDATE title = nb.title;"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;