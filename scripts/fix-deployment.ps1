# Quick Fix Script for GKE Deployment Issue
# This script rebuilds and redeploys the application with latest fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GKE Deployment Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ID = "dev-ops-475910"
$BACKEND_IMAGE = "gcr.io/$PROJECT_ID/nadun-task-backend:latest"
$FRONTEND_IMAGE = "gcr.io/$PROJECT_ID/nadun-task-frontend:latest"

# Step 1: Apply ConfigMap (already done, but ensuring it's there)
Write-Host "Step 1: Ensuring ConfigMap is applied..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-configmap.yaml
Write-Host "[OK] ConfigMap applied" -ForegroundColor Green
Write-Host ""

# Step 2: Rebuild Backend
Write-Host "Step 2: Rebuilding Backend..." -ForegroundColor Yellow
Set-Location todo-api
./mvnw clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "[OK] Backend built successfully" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Step 3: Build and Push Backend Docker Image
Write-Host "Step 3: Building and pushing Backend Docker image..." -ForegroundColor Yellow
docker build -t $BACKEND_IMAGE ./todo-api
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend Docker build failed!" -ForegroundColor Red
    exit 1
}
docker push $BACKEND_IMAGE
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend Docker push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend image pushed to GCR" -ForegroundColor Green
Write-Host ""

# Step 4: Rebuild Frontend
Write-Host "Step 4: Rebuilding Frontend..." -ForegroundColor Yellow
Set-Location todo-frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "[OK] Frontend built successfully" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Step 5: Build and Push Frontend Docker Image
Write-Host "Step 5: Building and pushing Frontend Docker image..." -ForegroundColor Yellow
docker build -t $FRONTEND_IMAGE ./todo-frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend Docker build failed!" -ForegroundColor Red
    exit 1
}
docker push $FRONTEND_IMAGE
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend Docker push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Frontend image pushed to GCR" -ForegroundColor Green
Write-Host ""

# Step 6: Restart Deployments
Write-Host "Step 6: Restarting deployments..." -ForegroundColor Yellow
kubectl rollout restart deployment/backend -n nadun-task-app
kubectl rollout restart deployment/frontend -n nadun-task-app
Write-Host "[OK] Deployments restarted" -ForegroundColor Green
Write-Host ""

# Step 7: Wait for Rollout
Write-Host "Step 7: Waiting for rollouts to complete..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
kubectl rollout status deployment/postgres -n nadun-task-app --timeout=3m
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] PostgreSQL is ready" -ForegroundColor Green
} else {
    Write-Host "[WARNING] PostgreSQL rollout timeout (check manually)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Checking Backend..." -ForegroundColor Yellow
kubectl rollout status deployment/backend -n nadun-task-app --timeout=5m
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend is ready" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Backend rollout timeout (check manually)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Checking Frontend..." -ForegroundColor Yellow
kubectl rollout status deployment/frontend -n nadun-task-app --timeout=3m
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend is ready" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Frontend rollout timeout (check manually)" -ForegroundColor Yellow
}
Write-Host ""

# Step 8: Show Pod Status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Current Pod Status:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
kubectl get pods -n nadun-task-app
Write-Host ""

# Step 9: Show Service Status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
kubectl get svc -n nadun-task-app
Write-Host ""

# Step 10: Test Health Endpoints
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Health Endpoints:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Testing backend health..." -ForegroundColor Yellow
$backendPod = kubectl get pods -n nadun-task-app -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($backendPod) {
    kubectl exec -n nadun-task-app $backendPod -- curl -s http://localhost:8080/health
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Deployment Process Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application URL:" -ForegroundColor Yellow
Write-Host "  https://task-gke.nadunwansooriya.online" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -n nadun-task-app -l app=backend --tail=50" -ForegroundColor Cyan
Write-Host "  kubectl logs -n nadun-task-app -l app=frontend --tail=50" -ForegroundColor Cyan
Write-Host "  kubectl logs -n nadun-task-app -l app=postgres --tail=50" -ForegroundColor Cyan
Write-Host ""
