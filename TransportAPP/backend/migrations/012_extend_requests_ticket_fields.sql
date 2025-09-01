-- Extend requests table for ticket management
ALTER TABLE requests 
  MODIFY status ENUM('pending','approved','rejected','in_progress','resolved') DEFAULT 'pending';

ALTER TABLE requests 
  ADD COLUMN IF NOT EXISTS priority TINYINT NOT NULL DEFAULT 2 AFTER status,
  ADD COLUMN IF NOT EXISTS subject VARCHAR(255) NULL AFTER message;

-- Indexes to support search/sort
ALTER TABLE requests 
  ADD INDEX IF NOT EXISTS idx_requests_requested_at (requested_at DESC),
  ADD INDEX IF NOT EXISTS idx_requests_priority (priority); 