# ==========================================
# Database Verification Script for GKE
# ==========================================
# This script verifies the PostgreSQL database setup and initialization

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Verification" -ForegroundColor Cyan
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

# Check if pod is running
Write-Host "Checking pod status..." -ForegroundColor Yellow
$podStatus = kubectl get pod $podName -n nadun-task-app -o jsonpath='{.status.phase}'

if ($podStatus -ne "Running") {
    Write-Host "WARNING: Pod status is: $podStatus" -ForegroundColor Red
    Write-Host "Expected: Running" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Pod is running" -ForegroundColor Green
Write-Host ""

# Test database connection
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Testing Database Connection" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$connectionTest = kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c "\conninfo" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection successful" -ForegroundColor Green
    Write-Host $connectionTest
} else {
    Write-Host "ERROR: Failed to connect to database" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check indexes
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Checking Database Indexes" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$indexQuery = @"
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename = 'task'
ORDER BY 
    indexname;
"@

kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $indexQuery
Write-Host ""

# Count sample tasks
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Checking Sample Data" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$countQuery = "SELECT COUNT(*) as total_tasks FROM task;"
kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $countQuery
Write-Host ""

# Show sample tasks
Write-Host "Sample Tasks (first 5):" -ForegroundColor Yellow
$sampleQuery = @"
SELECT 
    id,
    title,
    priority,
    category,
    completed
FROM 
    task
ORDER BY 
    task_date DESC
LIMIT 5;
"@

kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $sampleQuery
Write-Host ""

# Check table structure
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Checking Table Structure" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$schemaQuery = "\d task"
kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $schemaQuery
Write-Host ""

# Database size
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Database Statistics" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$statsQuery = @"
SELECT 
    pg_size_pretty(pg_database_size('taskdb')) as database_size,
    (SELECT COUNT(*) FROM task) as total_tasks,
    (SELECT COUNT(*) FROM task WHERE completed = true) as completed_tasks,
    (SELECT COUNT(*) FROM task WHERE completed = false) as pending_tasks;
"@

kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c $statsQuery
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Additional Commands:" -ForegroundColor Yellow
Write-Host "  Interactive psql:     kubectl exec -it -n nadun-task-app $podName -- psql -U admin -d taskdb" -ForegroundColor Cyan
Write-Host "  View all tasks:       kubectl exec -n nadun-task-app $podName -- psql -U admin -d taskdb -c 'SELECT * FROM task;'" -ForegroundColor Cyan
Write-Host "  View pod logs:        kubectl logs -n nadun-task-app $podName -f" -ForegroundColor Cyan
Write-Host ""
