-- Add missing reopen workflow columns individually (idempotent via runner)
ALTER TABLE weekly_plannings ADD COLUMN reopen_reason TEXT NULL;
ALTER TABLE weekly_plannings ADD COLUMN reopen_requested_by INT NULL;
ALTER TABLE weekly_plannings ADD COLUMN reopen_requested_at TIMESTAMP NULL;
ALTER TABLE weekly_plannings ADD COLUMN reopened_by INT NULL;
ALTER TABLE weekly_plannings ADD COLUMN reopened_at TIMESTAMP NULL; 