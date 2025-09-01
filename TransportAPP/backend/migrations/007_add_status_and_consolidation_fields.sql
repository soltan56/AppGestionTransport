ALTER TABLE weekly_plannings 
  ADD COLUMN status ENUM('draft','completed','consolidated') DEFAULT 'draft' AFTER assignments,
  ADD COLUMN is_consolidated TINYINT(1) DEFAULT 0 AFTER status,
  ADD COLUMN consolidated_from TEXT NULL AFTER is_consolidated;

-- Indexes to speed up status/consolidation queries
CREATE INDEX idx_status_year_week ON weekly_plannings (status, year, week_number);
CREATE INDEX idx_consolidated ON weekly_plannings (is_consolidated, year, week_number); 