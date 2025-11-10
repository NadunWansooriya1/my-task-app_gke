# GitHub Actions Workflow Guide

## Workflow Overview

This repository uses GitHub Actions for automated CI/CD to Google Kubernetes Engine (GKE).

### Workflow Status
[![Build and Deploy to GKE](https://github.com/NadunWansooriya1/my-task-app_gke/actions/workflows/deploy.yml/badge.svg)](https://github.com/NadunWansooriya1/my-task-app_gke/actions/workflows/deploy.yml)

## Setup Instructions

### Prerequisites
1. **Google Cloud Service Account** with the following roles:
   - Kubernetes Engine Developer
   - Storage Admin (for GCR)
   - Service Account User

2. **GitHub Secrets** (Required):
   - `GCP_SA_KEY`: Base64-encoded GCP service account JSON key

### Creating the Service Account Key

```bash
# 1. Create a service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD"

# 2. Grant necessary roles
gcloud projects add-iam-policy-binding dev-ops-475910 \
  --member="serviceAccount:github-actions@dev-ops-475910.iam.gserviceaccount.com" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding dev-ops-475910 \
  --member="serviceAccount:github-actions@dev-ops-475910.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# 3. Create and download the key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@dev-ops-475910.iam.gserviceaccount.com

# 4. Encode the key for GitHub Secret
cat key.json | base64 > key-base64.txt
```

### Adding Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `GCP_SA_KEY`
   - **Value**: Contents of `key-base64.txt`

### Workflow Triggers

The workflow runs automatically on:
- **Push to main branch**: Triggers full build and deploy
- **Pull requests to main**: Triggers build and test (deploy can be conditional)
- **Manual trigger**: Via GitHub Actions UI (workflow_dispatch)

## Workflow Steps

### 1. Build Phase
- ✅ Checkout code from repository
- ✅ Setup Google Cloud SDK
- ✅ Build backend JAR with Maven
- ✅ Build frontend with npm
- ✅ Build Docker images for backend and frontend

### 2. Push Phase
- ✅ Authenticate with Google Container Registry (GCR)
- ✅ Push backend image with commit SHA and latest tags
- ✅ Push frontend image with commit SHA and latest tags

### 3. Deploy Phase
- ✅ Get GKE cluster credentials
- ✅ Apply Kubernetes ConfigMaps
- ✅ Apply Kubernetes Secrets
- ✅ Deploy PostgreSQL, Backend, and Frontend
- ✅ Update deployments with new image tags

### 4. Verification Phase
- ✅ Wait for all deployments to complete
- ✅ Check pod status
- ✅ Test backend health endpoint
- ✅ Display deployment summary

## Manual Workflow Execution

To manually trigger the workflow:

1. Go to **Actions** tab in your GitHub repository
2. Select **Build and Deploy to GKE** workflow
3. Click **Run workflow** dropdown
4. Select the branch and click **Run workflow**

## Environment Variables

The workflow uses the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PROJECT_ID` | dev-ops-475910 | GCP Project ID |
| `GKE_CLUSTER` | nadun-task-app-cluster | GKE Cluster name |
| `GKE_ZONE` | us-central1-a | GKE Cluster zone |
| `BACKEND_IMAGE` | nadun-task-backend | Backend Docker image name |
| `FRONTEND_IMAGE` | nadun-task-frontend | Frontend Docker image name |
| `NAMESPACE` | nadun-task-app | Kubernetes namespace |

## Monitoring Deployments

### View Workflow Runs
```bash
# Via GitHub CLI
gh run list --workflow=deploy.yml

# View specific run
gh run view <run-id>
```

### Check Deployment Status
```bash
# Get pods
kubectl get pods -n nadun-task-app

# Get deployments
kubectl get deployments -n nadun-task-app

# View logs
kubectl logs -n nadun-task-app -l app=backend --tail=50
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify `GCP_SA_KEY` secret is correctly set
   - Ensure service account has necessary permissions

2. **Docker Build Failed**
   - Check if Maven build completed successfully
   - Verify Dockerfile paths are correct

3. **Deployment Timeout**
   - Check pod logs: `kubectl logs -n nadun-task-app -l app=<service>`
   - Verify image pull secrets if using private registry

4. **Health Check Failed**
   - Ensure backend is fully started
   - Check backend logs for errors

## Best Practices

✅ **Tag images with commit SHA** for traceability
✅ **Use secrets** for sensitive data
✅ **Test locally** before pushing
✅ **Monitor workflow runs** for failures
✅ **Keep dependencies updated**

## Application Access

After successful deployment:
- **Production URL**: https://task-gke.nadunwansooriya.online
- **Health Endpoint**: Check via kubectl exec or port-forward

## Support

For issues with the workflow:
1. Check the workflow run logs in GitHub Actions
2. Verify GKE cluster is accessible
3. Ensure all Kubernetes manifests are valid
4. Review pod logs for application errors
