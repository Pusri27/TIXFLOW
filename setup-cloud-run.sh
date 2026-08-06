#!/usr/bin/env bash
# ==============================================================================
# TIXFLOW — Google Cloud Run Automated Setup & Deployment Script
# ==============================================================================
set -e

# Configuration Variables
PROJECT_ID=${GCP_PROJECT_ID:-"your-gcp-project-id"}
REGION=${GCP_REGION:-"asia-southeast1"}
ARTIFACT_REPO="tixflow-repo"
BACKEND_SERVICE="tixflow-backend"
FRONTEND_SERVICE="tixflow-frontend"

echo "🚀 Starting Google Cloud Run Setup & Deployment for TIXFLOW..."
echo "Project ID: $PROJECT_ID | Region: $REGION"

# 1. Set active GCP project
gcloud config set project "$PROJECT_ID"

# 2. Enable required GCP Services
echo "📦 Enabling GCP APIs (Cloud Run, Artifact Registry, Cloud Build)..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

# 3. Create Artifact Registry Docker repository if not exists
echo "🏭 Creating Artifact Registry repository ($ARTIFACT_REPO)..."
gcloud artifacts repositories create "$ARTIFACT_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Docker repository for TIXFLOW services" || true

# 4. Build and Push Backend Container Image
echo "🔨 Building Backend Container Image via Cloud Build..."
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$ARTIFACT_REPO/$BACKEND_SERVICE:latest"
gcloud builds submit backend/ \
  --tag "$BACKEND_IMAGE"

# Default fallback values if environment variables are not set
DEFAULT_DB_URL=${DB_URL:-"jdbc:postgresql://ep-wandering-water-azak9ncp.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"}
DEFAULT_DB_USER=${DB_USER:-"neondb_owner"}
DEFAULT_DB_PASS=${DB_PASS:-"npg_ETsdSZKt2lM4"}
DEFAULT_JWT_SECRET=${JWT_SECRET:-"9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b"}
DEFAULT_REDIS_HOST=${SPRING_REDIS_HOST:-"localhost"}
DEFAULT_REDIS_PORT=${SPRING_REDIS_PORT:-"6379"}
DEFAULT_REDIS_PASS=${SPRING_REDIS_PASSWORD:-""}

# 5. Deploy Backend Service to Cloud Run
echo "⚡ Deploying Backend to Cloud Run ($BACKEND_SERVICE)..."
gcloud run deploy "$BACKEND_SERVICE" \
  --image "$BACKEND_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "DB_URL=${DEFAULT_DB_URL},DB_USER=${DEFAULT_DB_USER},DB_PASS=${DEFAULT_DB_PASS},SPRING_REDIS_HOST=${DEFAULT_REDIS_HOST},SPRING_REDIS_PORT=${DEFAULT_REDIS_PORT},SPRING_REDIS_PASSWORD=${DEFAULT_REDIS_PASS},JWT_SECRET=${DEFAULT_JWT_SECRET}"

# Get deployed Backend URL
BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --region "$REGION" --format 'value(status.url)')
echo "✅ Backend Deployed Successfully: $BACKEND_URL"

# 6. Build and Push Frontend Container Image
echo "🔨 Building Frontend Container Image via Cloud Build..."
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$ARTIFACT_REPO/$FRONTEND_SERVICE:latest"
gcloud builds submit frontend/ \
  --tag "$FRONTEND_IMAGE"

# 7. Deploy Frontend Service to Cloud Run
echo "⚡ Deploying Frontend to Cloud Run ($FRONTEND_SERVICE)..."
gcloud run deploy "$FRONTEND_SERVICE" \
  --image "$FRONTEND_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --region "$REGION" --format 'value(status.url)')

echo "=============================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "=============================================================================="
