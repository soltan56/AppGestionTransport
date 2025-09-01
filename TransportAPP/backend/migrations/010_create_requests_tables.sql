-- Requests tables for employee/general requests
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('employee','general') NOT NULL,
  message TEXT NULL,
  content JSON NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  target_role ENUM('administrateur','rh') NULL,
  requested_by INT NOT NULL,
  approved_by INT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  INDEX idx_requests_status (status),
  INDEX idx_requests_type (type),
  INDEX idx_requests_target_role (target_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link table for requested employees (FK to requests only)
CREATE TABLE IF NOT EXISTS request_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  employee_id INT NOT NULL,
  CONSTRAINT fk_request_employees_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_request_employee (request_id, employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 