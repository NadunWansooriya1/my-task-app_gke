# CI/CD Pipeline (GitHub Actions)

```mermaid
flowchart LR
  DEV[Developer Commit] --> PUSH[Push to main]
  PUSH --> GHWF[GitHub Actions Workflow]

  GHWF --> STEP1[Checkout Code]
  STEP1 --> STEP2[Setup gcloud]
  STEP2 --> STEP3[Authenticate to GCR]
  STEP3 --> STEP4[Get GKE Credentials]
  STEP4 --> STEP5[Build Backend (Maven)]
  STEP5 --> STEP6[Build Frontend (npm)]
  STEP6 --> STEP7[Docker Build Images]
  STEP7 --> STEP8[Push Images to GCR]
  STEP8 --> STEP9[Apply K8s Manifests]
  STEP9 --> STEP10[Update Deployment Images]
  STEP10 --> STEP11[Rollout Status Checks]
  STEP11 --> STEP12[Health Endpoint Test]
  STEP12 --> PROD[Production Live]

  PROD --> MONITOR[Monitoring / kubectl logs]
```
