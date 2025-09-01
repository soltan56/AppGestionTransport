ALTER TABLE weekly_plannings 
  ADD COLUMN reopen_requested TINYINT(1) DEFAULT 0 AFTER consolidated_from,
  ADD COLUMN reopen_reason TEXT NULL AFTER reopen_requested,
  ADD COLUMN reopen_requested_by INT NULL AFTER reopen_reason,
  ADD COLUMN reopen_requested_at TIMESTAMP NULL AFTER reopen_requested_by,
  ADD COLUMN reopened_by INT NULL AFTER reopen_requested_at,
  ADD COLUMN reopened_at TIMESTAMP NULL AFTER reopened_by; 