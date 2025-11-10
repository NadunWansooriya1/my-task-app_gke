# Setup GCP Service Account for GitHub Actions
# This script creates a service account and generates a key for GitHub Actions

$PROJECT_ID = "dev-ops-475910"
$SA_NAME = "github-actions"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$KEY_FILE = "github-actions-key.json"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GCP Service Account Setup for GitHub Actions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Service Account
Write-Host "Step 1: Creating service account..." -ForegroundColor Yellow
gcloud iam service-accounts create $SA_NAME `
  --display-name="GitHub Actions CI/CD" `
  --project=$PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Service account created" -ForegroundColor Green
} else {
    Write-Host "[INFO] Service account may already exist" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Grant Kubernetes Engine Developer Role
Write-Host "Step 2: Granting Kubernetes Engine Developer role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/container.developer" `
  --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Kubernetes Engine Developer role granted" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Failed to grant role" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Grant Storage Admin Role
Write-Host "Step 3: Granting Storage Admin role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/storage.admin" `
  --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Storage Admin role granted" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Failed to grant role" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Grant Service Account User Role
Write-Host "Step 4: Granting Service Account User role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/iam.serviceAccountUser" `
  --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Service Account User role granted" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Failed to grant role" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Create Service Account Key
Write-Host "Step 5: Creating service account key..." -ForegroundColor Yellow
gcloud iam service-accounts keys create $KEY_FILE `
  --iam-account=$SA_EMAIL `
  --project=$PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Service account key created: $KEY_FILE" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to create key" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Convert to Base64
Write-Host "Step 6: Converting key to base64..." -ForegroundColor Yellow
$keyBytes = [System.IO.File]::ReadAllBytes($KEY_FILE)
$base64Key = [Convert]::ToBase64String($keyBytes)

# Save to file
$base64Key | Out-File -FilePath "github-actions-key-base64.txt" -Encoding ASCII -NoNewline

Write-Host "[OK] Base64 key saved to: github-actions-key-base64.txt" -ForegroundColor Green
Write-Host ""

# Display Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the content of 'github-actions-key-base64.txt'" -ForegroundColor Cyan
Write-Host "2. Go to GitHub Repository Settings → Secrets → Actions" -ForegroundColor Cyan
Write-Host "3. Create a new secret named: GCP_SA_KEY" -ForegroundColor Cyan
Write-Host "4. Paste the base64 key as the value" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Repository:" -ForegroundColor Yellow
Write-Host "  https://github.com/NadunWansooriya1/my-task-app_gke/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  SECURITY REMINDER:" -ForegroundColor Red
Write-Host "  Delete the key files after adding to GitHub:" -ForegroundColor Yellow
Write-Host "  Remove-Item $KEY_FILE, github-actions-key-base64.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view the base64 key:" -ForegroundColor Yellow
Write-Host "  Get-Content github-actions-key-base64.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "To copy to clipboard:" -ForegroundColor Yellow
Write-Host "  Get-Content github-actions-key-base64.txt | Set-Clipboard" -ForegroundColor Cyan
Write-Host ""
