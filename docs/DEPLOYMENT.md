# Production Deployment Guide: Google Cloud Run

This guide documents the production deployment workflow for **Flourish Management** on Google Cloud Run.

---

## 1. Prerequisites

1. **Google Cloud SDK (`gcloud`)**:
   Verify your active login:
   ```bash
   gcloud auth list
   ```
2. **Project ID Configuration**:
   Ensure the active project is set to `flourish-mgmt`:
   ```bash
   gcloud config set project flourish-mgmt
   ```
3. **Required APIs**:
   Ensure these Google Cloud APIs are enabled:
   - Cloud Run API (`run.googleapis.com`)
   - Cloud Build API (`cloudbuild.googleapis.com`)
   - Artifact Registry API (`artifactregistry.googleapis.com`)

---

## 2. One-Command Production Deployment

Deploy directly from the local repository directory:

```bash
gcloud run deploy flourish-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### What This Command Does:
1. Packages the repository files respecting `.dockerignore` (excluding local `node_modules` and `.env`).
2. Uploads the source bundle to Google Cloud Build.
3. Builds the Docker container using `Dockerfile` (Node 20 Alpine lightweight image).
4. Pushes the built container image to Google Artifact Registry.
5. Deploys a new revision to the `flourish-web` Cloud Run service.
6. Seamlessly routes 100% of incoming live HTTPS traffic to the new revision with zero downtime.

---

## 3. Docker Container Specifications

The application uses an optimized, multi-layer `Dockerfile`:

```dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci --only=production
COPY --chown=node:node . .
USER node
ENV PORT=8080
EXPOSE 8080
CMD [ "npm", "start" ]
```

### Key Production Features:
- **Lightweight Footprint**: Alpine Linux base keeps the container size under 120MB.
- **Security Hardening**: Runs as the unprivileged non-root `node` user (`UID 1000`).
- **Dynamic Port Injection**: Automatically adapts to Cloud Run's dynamic `$PORT` environment variable.

---

## 4. Setting Production Environment Variables

To configure SMTP email credentials on Cloud Run without baking secrets into the image:

```bash
gcloud run services update flourish-web \
  --region us-central1 \
  --set-env-vars "SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=inquiries@flourish-mgmt.com,NOTIFICATION_EMAIL=inquiries@flourish-mgmt.com"
```

For sensitive credentials like `SMTP_PASS`, use Google Secret Manager:
```bash
# Create secret in Secret Manager
echo -n "your-app-password" | gcloud secrets create smtp-password --data-file=-

# Mount secret into Cloud Run
gcloud run services update flourish-web \
  --region us-central1 \
  --set-secrets="SMTP_PASS=smtp-password:latest"
```

---

## 5. Live Service Health Checks & Verification

After deployment, verify that all systems are operational:

```bash
# 1. Check HTTP Status
curl -I https://flourish-web-151213060012.us-central1.run.app

# 2. Check 3-Pillar Article Distribution
curl -s https://flourish-web-151213060012.us-central1.run.app/api/articles | jq .counts

# 3. Test Rate Limiting Protection
for i in {1..8}; do
  curl -s -o /dev/null -w "%{http_code}
" -X POST https://flourish-web-151213060012.us-central1.run.app/api/contact
done
# (Requests 1-5 return 200/400; requests 6+ return 429 Too Many Requests)
```
