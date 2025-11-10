# ==========================================
# Database Migration Script for GKE
# ==========================================
# This script adds priority and category columns to existing task table
# Run this if you already have a database with existing tasks

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Database Migration: Add Priority & Category" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Get pod name
Write-Host "Finding PostgreSQL pod..." -ForegroundColor Yellow
$podName = kubectl get pods -n nadun-task-app -l app=postgres -o jsonpath='{.items[0].metadata.name}' 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PostgreSQL pod not found" -ForegroundColor Red
    Write-Host "Run: kubectl get pods -n nadun-task-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found pod: $podName" -ForegroundColor Green
Write-Host ""

# Check current table structure
Write-Host "Checking current table structure..." -ForegroundColor Yellow
Write-Host ""

$checkQuery = "\d task"
kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $checkQuery

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Migration Plan" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Add 'priority' column (VARCHAR(50))" -ForegroundColor White
Write-Host "  2. Add 'category' column (VARCHAR(100))" -ForegroundColor White
Write-Host "  3. Create indexes for performance" -ForegroundColor White
Write-Host "  4. Set default values for existing tasks" -ForegroundColor White
Write-Host "  5. Update database statistics" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: This is a schema change operation" -ForegroundColor Red
Write-Host "   - Creates a backup first" -ForegroundColor Yellow
Write-Host "   - Safe for existing data" -ForegroundColor Yellow
Write-Host "   - Can be rolled back" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to proceed with migration? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "Migration cancelled by user." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Step 1: Creating Backup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "task_backup_$timestamp.sql"

Write-Host "Backing up task table to: $backupFile" -ForegroundColor Yellow
kubectl exec -n nadun-task-app $podName -- pg_dump -U admin -d taskdb -t task > $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backup created successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Backup failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Step 2: Adding Priority Column" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$addPriorityQuery = @"
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='task' AND column_name='priority'
    ) THEN
        ALTER TABLE task ADD COLUMN priority VARCHAR(50);
        UPDATE task SET priority = 'medium' WHERE priority IS NULL;
        RAISE NOTICE 'Priority column added successfully';
    ELSE
        RAISE NOTICE 'Priority column already exists';
    END IF;
END \$\$;
"@

kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $addPriorityQuery

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Priority column added" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to add priority column" -ForegroundColor Red
    Write-Host "Backup is saved at: $backupFile" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Step 3: Adding Category Column" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$addCategoryQuery = @"
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='task' AND column_name='category'
    ) THEN
        ALTER TABLE task ADD COLUMN category VARCHAR(100);
        UPDATE task SET category = 'Work' WHERE category IS NULL;
        RAISE NOTICE 'Category column added successfully';
    ELSE
        RAISE NOTICE 'Category column already exists';
    END IF;
END \$\$;
"@

kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $addCategoryQuery

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Category column added" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to add category column" -ForegroundColor Red
    Write-Host "Backup is saved at: $backupFile" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Step 4: Creating Indexes" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$createIndexesQuery = @"
CREATE INDEX IF NOT EXISTS idx_task_priority ON task(priority);
CREATE INDEX IF NOT EXISTS idx_task_category ON task(category);
CREATE INDEX IF NOT EXISTS idx_task_date ON task(task_date);
CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completed ON task(completed);
CREATE INDEX IF NOT EXISTS idx_task_date_completed ON task(task_date, completed);
CREATE INDEX IF NOT EXISTS idx_task_user_completed ON task(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_task_user_date ON task(user_id, task_date);
"@

kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $createIndexesQuery

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Indexes created successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: Some indexes may already exist" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Step 5: Updating Statistics" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$analyzeQuery = "ANALYZE task;"
kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $analyzeQuery

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Statistics updated" -ForegroundColor Green
} else {
    Write-Host "WARNING: Failed to update statistics" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Step 6: Verification" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "Updated table structure:" -ForegroundColor Yellow
Write-Host ""
kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $checkQuery

Write-Host ""
Write-Host "Sample data check:" -ForegroundColor Yellow
$sampleQuery = "SELECT id, title, priority, category, completed FROM task LIMIT 5;"
kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $sampleQuery

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ Priority column added" -ForegroundColor Green
Write-Host "  ✓ Category column added" -ForegroundColor Green
Write-Host "  ✓ Indexes created" -ForegroundColor Green
Write-Host "  ✓ Statistics updated" -ForegroundColor Green
Write-Host "  ✓ Backup saved: $backupFile" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Restart backend pods to apply schema changes" -ForegroundColor Cyan
Write-Host "     kubectl rollout restart deployment backend -n nadun-task-app" -ForegroundColor Cyan
Write-Host "  2. Test the application with new fields" -ForegroundColor Cyan
Write-Host "  3. Keep backup file safe: $backupFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Rollback (if needed):" -ForegroundColor Yellow
Write-Host "  kubectl exec -i -n nadun-task-app $podName -- psql -U admin -d taskdb < $backupFile" -ForegroundColor Cyan
Write-Host ""
