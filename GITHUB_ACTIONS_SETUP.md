# GitHub Actions Setup - Quick Start Guide

## 🔐 Setting Up GitHub Actions for Your Repository

Your code has been pushed to GitHub! Now follow these steps to enable the automated CI/CD workflow.

## Step 1: Create a GCP Service Account

Run these commands in your terminal (or Google Cloud Shell):

```bash
# 1. Create the service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD" \
  --project=dev-ops-475910

# 2. Grant Kubernetes Engine Developer role
gcloud projects add-iam-policy-binding dev-ops-475910 \
  --member="serviceAccount:github-actions@dev-ops-475910.iam.gserviceaccount.com" \
  --role="roles/container.developer"

# 3. Grant Storage Admin role (for Google Container Registry)
gcloud projects add-iam-policy-binding dev-ops-475910 \
  --member="serviceAccount:github-actions@dev-ops-475910.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# 4. Grant Service Account User role
gcloud projects add-iam-policy-binding dev-ops-475910 \
  --member="serviceAccount:github-actions@dev-ops-475910.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 5. Create and download the key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@dev-ops-475910.iam.gserviceaccount.com \
  --project=dev-ops-475910

# 6. Display the base64-encoded key (copy this output)
cat github-actions-key.json | base64 -w 0
# On Windows PowerShell, use:
# [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("github-actions-key.json"))
```

## Step 2: Add Secret to GitHub

### Using GitHub Web Interface:

1. Go to your repository: https://github.com/NadunWansooriya1/my-task-app_gke
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter:
   - **Name**: `GCP_SA_KEY`
   - **Value**: Paste the base64-encoded key from Step 1
5. Click **Add secret**

### Using GitHub CLI:

```bash
# If you have GitHub CLI installed
gh secret set GCP_SA_KEY < github-actions-key-base64.txt
```

## Step 3: Verify Workflow

### Check Workflow Status:

1. Go to the **Actions** tab in your GitHub repository
2. You should see "Build and Deploy to GKE" workflow
3. The workflow will trigger automatically on the next push to main

### Manually Trigger the Workflow:

1. Go to **Actions** tab
2. Select **Build and Deploy to GKE** workflow
3. Click **Run workflow** dropdown
4. Select `main` branch
5. Click **Run workflow**

## 🎯 What Happens Next?

When the workflow runs, it will:

1. ✅ **Build Backend**: Compile Java code with Maven
2. ✅ **Build Frontend**: Build React app with npm
3. ✅ **Create Docker Images**: Build containers for backend and frontend
4. ✅ **Push to GCR**: Upload images to Google Container Registry
5. ✅ **Deploy to GKE**: Update Kubernetes deployments
6. ✅ **Verify Health**: Test backend health endpoint
7. ✅ **Report Status**: Display deployment summary

## 📊 Monitoring Your Workflow

### View Workflow Logs:
- Go to **Actions** tab → Select workflow run → View logs

### Check Deployment Status:
```bash
# Get current deployment status
kubectl get deployments -n nadun-task-app

# View pods
kubectl get pods -n nadun-task-app

# Check logs
kubectl logs -n nadun-task-app -l app=backend --tail=50
```

## 🔧 Testing the Workflow

After setup is complete, test the workflow:

```bash
# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add README.md
git commit -m "test: Trigger CI/CD workflow"
git push origin main
```

Then check the **Actions** tab to see your workflow running!

## ⚠️ Important Security Notes

1. **Never commit** the `github-actions-key.json` file to your repository
2. **Delete local key** after adding to GitHub secrets:
   ```bash
   rm github-actions-key.json
   ```
3. **Rotate keys** periodically for security
4. **Limit permissions** to only what's needed

## 🆘 Troubleshooting

### Workflow fails with "authentication required"
- ✅ Verify `GCP_SA_KEY` secret is set correctly
- ✅ Ensure service account has the required roles

### Workflow fails at Docker push
- ✅ Check if Storage Admin role is granted
- ✅ Verify GCR is enabled in your GCP project

### Deployment timeout
- ✅ Check pod logs: `kubectl logs -n nadun-task-app -l app=<service>`
- ✅ Verify cluster has enough resources

### Health check fails
- ✅ Ensure backend pod is running
- ✅ Check if ConfigMap is applied
- ✅ Verify database connection

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

## 🎉 Success!

Once configured, every push to `main` will automatically:
- Build your application
- Create Docker images
- Deploy to GKE cluster
- Verify deployment health

Your application will be available at: **https://task-gke.nadunwansooriya.online**

---

**Next Steps:**
1. Complete the setup above
2. Make a test commit to trigger the workflow
3. Monitor the workflow execution in the Actions tab
4. Enjoy automated deployments! 🚀
