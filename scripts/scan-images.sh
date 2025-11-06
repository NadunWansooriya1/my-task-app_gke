#!/bin/bash

echo "🔍 Scanning Docker images for vulnerabilities..."
echo ""

# Scan backend
echo "📦 Scanning Backend Image..."
trivy image --severity HIGH,CRITICAL gcr.io/dev-ops-475910/nadun-task-backend:latest

echo ""
echo "📦 Scanning Frontend Image..."
trivy image --severity HIGH,CRITICAL gcr.io/dev-ops-475910/nadun-task-frontend:latest

echo ""
echo "📦 Scanning PostgreSQL Image..."
trivy image --severity HIGH,CRITICAL postgres:15-alpine

echo ""
echo "✅ Scan complete!"