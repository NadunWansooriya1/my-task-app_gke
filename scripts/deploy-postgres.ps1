# ==========================================
# Database Deployment Script for GKE
# ==========================================
# This script deploys/updates the PostgreSQL database with initialization

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Deployment for GKE" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is available
Write-Host "Checking kubectl availability..." -ForegroundColor Yellow
$kubectlCheck = kubectl version --client 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: kubectl is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✓ kubectl is available" -ForegroundColor Green
Write-Host ""

# Check cluster connection
Write-Host "Checking GKE cluster connection..." -ForegroundColor Yellow
$clusterCheck = kubectl cluster-info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not connected to GKE cluster" -ForegroundColor Red
    Write-Host "Run: gcloud container clusters get-credentials YOUR-CLUSTER-NAME --zone=YOUR-ZONE" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Connected to GKE cluster" -ForegroundColor Green
Write-Host ""

# Create namespace if it doesn't exist
Write-Host "Ensuring namespace exists..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml
Write-Host ""

# Apply ConfigMap with initialization script
Write-Host "Applying PostgreSQL initialization ConfigMap..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-configmap.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ ConfigMap applied successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply ConfigMap" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Apply secrets
Write-Host "Applying secrets..." -ForegroundColor Yellow
kubectl apply -f k8s/secrets.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Secrets applied successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply secrets" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Apply PVC
Write-Host "Applying PostgreSQL PVC..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-pvc.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PVC applied successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply PVC" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if we need to restart PostgreSQL
Write-Host "Checking if PostgreSQL pod exists..." -ForegroundColor Yellow
$podExists = kubectl get pods -n nadun-task-app -l app=postgres 2>&1 | Select-String "postgres"

if ($podExists) {
    Write-Host "PostgreSQL pod found. Restarting to apply new initialization..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "WARNING: This will delete and recreate the PostgreSQL pod" -ForegroundColor Red
    Write-Host "All existing data will be preserved in the PersistentVolume" -ForegroundColor Yellow
    Write-Host ""
    
    $confirmation = Read-Host "Do you want to restart PostgreSQL? (yes/no)"
    if ($confirmation -eq "yes") {
        Write-Host "Deleting existing PostgreSQL pod..." -ForegroundColor Yellow
        kubectl delete pod -n nadun-task-app -l app=postgres
        Write-Host "Waiting for pod to terminate..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Skipping PostgreSQL restart. Apply deployment manually if needed." -ForegroundColor Yellow
    }
}
Write-Host ""

# Apply PostgreSQL deployment
Write-Host "Applying PostgreSQL deployment..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-deployment.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL deployment applied successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply deployment" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Wait for pod to be ready
Write-Host "Waiting for PostgreSQL pod to be ready..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=postgres -n nadun-task-app --timeout=120s

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL pod is ready" -ForegroundColor Green
} else {
    Write-Host "WARNING: Pod may not be ready yet. Check status with:" -ForegroundColor Yellow
    Write-Host "kubectl get pods -n nadun-task-app -l app=postgres" -ForegroundColor Cyan
}
Write-Host ""

# Show pod logs to verify initialization
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Database Initialization Logs (last 20 lines):" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 5  # Give it a moment to initialize
kubectl logs -n nadun-task-app -l app=postgres --tail=20

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  View pods:        kubectl get pods -n nadun-task-app" -ForegroundColor Cyan
Write-Host "  View logs:        kubectl logs -n nadun-task-app -l app=postgres -f" -ForegroundColor Cyan
Write-Host "  View services:    kubectl get svc -n nadun-task-app" -ForegroundColor Cyan
Write-Host "  Connect to DB:    kubectl exec -it -n nadun-task-app <pod-name> -- psql -U admin -d taskdb" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy backend:  kubectl apply -f k8s/backend-deployment.yaml" -ForegroundColor Cyan
Write-Host "  2. Deploy frontend: kubectl apply -f k8s/frontend-deployment.yaml" -ForegroundColor Cyan
Write-Host "  3. Test the app at: https://task-gke.nadunwansooriya.online" -ForegroundColor Cyan
Write-Host ""
