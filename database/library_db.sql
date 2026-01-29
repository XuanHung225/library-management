-- Library Management Database Schema
-- Author: [Your Name/Team]
-- Last updated: 2026-01-29

-- 1. Database & Charset
CREATE DATABASE IF NOT EXISTS library_management
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE library_management;

-- 2. Drop tables if exist (for dev/test only)
DROP TABLE IF EXISTS fines, logs, loans, password_resets, email_verifications, users, roles, books, categories;

-- 3. Categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role_id INT NOT NULL,
  is_active TINYINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  refresh_token VARCHAR(512),
  phone VARCHAR(15),
  address VARCHAR(255),
  date_of_birth DATE,
  gender ENUM('male','female','other'),
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Books
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(50) UNIQUE,
  publisher VARCHAR(255),
  published_year YEAR,
  total_quantity INT DEFAULT 0,
  available_quantity INT DEFAULT 0,
  image VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Loans
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loan_date DATETIME,
  due_date DATETIME NOT NULL,
  return_date DATETIME,
  status ENUM('pending','approved','borrowed','returned','overdue','lost','rejected') DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  KEY idx_loans_user (user_id),
  KEY idx_loans_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Fines
CREATE TABLE fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fine_type ENUM('late','lost'),
  reason TEXT,
  is_paid TINYINT DEFAULT 0,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  KEY idx_fines_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Logs
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id INT,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Email Verifications
CREATE TABLE email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_email_verifications_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Password Resets
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  user_id INT,
  code VARCHAR(16) NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Sample Data (Insert only if needed for dev/test)
-- INSERT INTO roles (name) VALUES ('user'), ('librarian'), ('admin');
-- INSERT INTO categories (name, description) VALUES (...);

-- 13. Indexes, constraints, and other options are already included above.

-- End of schema