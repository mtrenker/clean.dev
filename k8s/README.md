# Clean.dev Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the clean.dev Next.js
application using Kustomize and ArgoCD.

## Prerequisites

- Kubernetes cluster with ArgoCD installed
- NGINX Ingress Controller
- cert-manager for TLS certificates
- Sealed Secrets controller (if using secrets)
- CloudNativePG operator (for PostgreSQL)
- Prometheus Operator (for monitoring)
- Grafana (for visualization)

## Components

- **Web Application**: Next.js app deployed with rolling updates
- **PostgreSQL Cluster**: 3-node HA cluster with CloudNativePG
- **Connection Pooler**: PgBouncer for efficient connection management
- **Monitoring**: Prometheus metrics and Grafana dashboards

See [POSTGRES.md](./POSTGRES.md) for detailed PostgreSQL setup and management.

## Local Development

### Testing Kustomize Build

```bash
# Build and validate manifests
cd k8s
kustomize build .

# Apply to local cluster
kubectl apply -k .

# Or using kubectl's built-in kustomize
kubectl apply -k k8s/
```

### Building Docker Image Locally

```bash
# Build the image
docker build -t clean-dev:local .

# Test the container
docker run -p 3000:3000 clean-dev:local
```

## Deployment Process

1. **Developer pushes code** to the main branch
2. **GitHub Actions workflow** (.github/workflows/deploy.yaml):
   - Builds Docker image
   - Pushes to ghcr.io with SHA-based tag
   - Updates k8s/kustomization.yaml with new image tag
   - Commits change back to repository
3. **ArgoCD detects change** and syncs new version to cluster
4. **Rolling update** deploys new version with zero downtime

## Configuration Files

- `kustomization.yaml` - Main Kustomize configuration
- `deployment.yaml` - Application deployment with 2 replicas
- `service.yaml` - ClusterIP service exposing port 80
- `ingress.yaml` - HTTPS ingress for clean.dev domain
- `sealedsecret.yaml.example` - Template for encrypted secrets

## Health Checks

The application exposes two health check endpoints:

- `/api/health` - Liveness probe (checks if app is running)
- `/api/ready` - Readiness probe (checks if app is ready to serve traffic)

## Monitoring Deployment

```bash
# Watch ArgoCD sync status
kubectl get applications -n argocd -w

# Check application status
kubectl get application clean-dev -n argocd -o yaml

# Watch pods
kubectl get pods -n clean-dev -w

# Check deployment status
kubectl rollout status deployment/clean-dev -n clean-dev

# View logs
kubectl logs -n clean-dev -l app=clean-dev --tail=100
```

## Managing Secrets

If your application needs secrets:

1. Copy and rename the example:
   ```bash
   cp k8s/sealedsecret.yaml.example k8s/sealedsecret.yaml
   ```

2. Create the sealed secret:
   ```bash
   kubectl create secret generic clean-dev-secrets \
     --from-literal=database-url="your-db-url" \
     --from-literal=api-key="your-api-key" \
     --dry-run=client -o yaml | \
     kubeseal -o yaml > k8s/sealedsecret.yaml
   ```

3. Uncomment the secret reference in `kustomization.yaml`

4. Uncomment the environment variables in `deployment.yaml`

## Troubleshooting

### ArgoCD not syncing

```bash
# Check application
kubectl describe application clean-dev -n argocd

# Force refresh
kubectl patch application clean-dev -n argocd \
  --type merge -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```

### Image not updating

```bash
# Check if kustomization.yaml was updated
git log -1 k8s/kustomization.yaml

# Verify ArgoCD sees the change
kubectl get application clean-dev -n argocd -o jsonpath='{.status.sync.revision}'
```

### Deployment issues

```bash
# Check pod events
kubectl describe pods -n clean-dev -l app=clean-dev

# Check deployment events
kubectl describe deployment clean-dev -n clean-dev

# View recent logs
kubectl logs -n clean-dev -l app=clean-dev --tail=50
```

## Scaling

To change the number of replicas:

```bash
# Edit deployment.yaml and change replicas value
vim k8s/deployment.yaml

# Commit and push
git add k8s/deployment.yaml
git commit -m "Scale to X replicas"
git push
```

Or manually scale:

```bash
kubectl scale deployment clean-dev -n clean-dev --replicas=3
```

## Environment Variables

Add environment variables in `deployment.yaml`:

```yaml
env:
  - name: NODE_ENV
    value: production
  - name: CUSTOM_VAR
    value: "custom-value"
  # For secrets:
  - name: SECRET_VAR
    valueFrom:
      secretKeyRef:
        name: clean-dev-secrets
        key: secret-key
```
