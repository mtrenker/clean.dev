#!/bin/bash
# Setup script for CloudNativePG PostgreSQL cluster

set -e

NAMESPACE="clean-dev"
CLUSTER_NAME="clean-dev-pg"

echo "==================================================================="
echo "CloudNativePG PostgreSQL Setup for Clean.dev"
echo "==================================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if CloudNativePG operator is installed
echo "Checking prerequisites..."
if ! kubectl get crd clusters.postgresql.cnpg.io &> /dev/null; then
    print_error "CloudNativePG operator not found!"
    echo ""
    echo "Install it with:"
    echo "  kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.21/releases/cnpg-1.21.0.yaml"
    exit 1
fi
print_status "CloudNativePG operator is installed"

# Check if Prometheus Operator is installed
if ! kubectl get crd servicemonitors.monitoring.coreos.com &> /dev/null; then
    print_warning "Prometheus Operator not found - monitoring will be limited"
    echo "  Install with: kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml"
else
    print_status "Prometheus Operator is installed"
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    print_warning "Namespace $NAMESPACE does not exist, creating it..."
    kubectl create namespace "$NAMESPACE"
fi
print_status "Namespace $NAMESPACE exists"

echo ""
echo "==================================================================="
echo "Step 1: Generate Secrets"
echo "==================================================================="
echo ""

# Check if kubeseal is available
if ! command -v kubeseal &> /dev/null; then
    print_error "kubeseal not found!"
    echo ""
    echo "Install kubeseal:"
    echo "  Linux: wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz"
    echo "         tar xfz kubeseal-0.24.0-linux-amd64.tar.gz && sudo install -m 755 kubeseal /usr/local/bin/kubeseal"
    echo "  macOS: brew install kubeseal"
    echo ""
    echo "Or you can create regular secrets (NOT RECOMMENDED for production):"
    echo "  kubectl create secret generic clean-dev-pg-superuser --namespace=$NAMESPACE --from-literal=username=postgres --from-literal=password=\$(openssl rand -base64 32)"
    echo "  kubectl create secret generic clean-dev-pg-app --namespace=$NAMESPACE --from-literal=username=cleandev --from-literal=password=\$(openssl rand -base64 32)"
    exit 1
fi

# Generate passwords
POSTGRES_SUPERUSER_PASSWORD=$(openssl rand -base64 32)
POSTGRES_APP_PASSWORD=$(openssl rand -base64 32)

echo "Generating sealed secrets..."

# Create superuser secret
kubectl create secret generic clean-dev-pg-superuser \
  --namespace="$NAMESPACE" \
  --from-literal=username=postgres \
  --from-literal=password="$POSTGRES_SUPERUSER_PASSWORD" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > k8s/postgres-secrets-sealed.yaml

print_status "Created sealed secret for PostgreSQL superuser"

# Create app user secret
kubectl create secret generic clean-dev-pg-app \
  --namespace="$NAMESPACE" \
  --from-literal=username=cleandev \
  --from-literal=password="$POSTGRES_APP_PASSWORD" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml >> k8s/postgres-secrets-sealed.yaml

print_status "Created sealed secret for application user"

echo ""
print_status "Sealed secrets saved to: k8s/postgres-secrets-sealed.yaml"
echo ""
echo "Save this connection string for your records:"
echo "-------------------------------------------------------------------"
echo "postgresql://cleandev:$POSTGRES_APP_PASSWORD@clean-dev-pg-pooler-rw:5432/cleandev"
echo "-------------------------------------------------------------------"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "==================================================================="
echo "Step 2: Enable PostgreSQL in Kustomization"
echo "==================================================================="
echo ""

# Update kustomization.yaml to include sealed secrets
if grep -q "# - postgres-secrets-sealed.yaml" k8s/kustomization.yaml; then
    sed -i 's/# - postgres-secrets-sealed.yaml/- postgres-secrets-sealed.yaml/' k8s/kustomization.yaml
    print_status "Enabled postgres-secrets-sealed.yaml in kustomization.yaml"
else
    print_warning "postgres-secrets-sealed.yaml already enabled or not found in kustomization.yaml"
fi

echo ""

echo "==================================================================="
echo "Setup Complete!"
echo "==================================================================="
echo ""
print_status "Sealed secrets created: k8s/postgres-secrets-sealed.yaml"
print_status "Kustomization updated to include secrets"
echo ""
echo "Connection Information (save this):"
echo "-------------------------------------------------------------------"
echo "  Database URL: postgresql://cleandev:$POSTGRES_APP_PASSWORD@clean-dev-pg-pooler-rw:5432/cleandev"
echo ""
echo "  From application pods:"
echo "    Host: clean-dev-pg-pooler-rw"
echo "    Port: 5432"
echo "    Database: cleandev"
echo "    User: cleandev"
echo ""
echo "  From local machine:"
echo "    kubectl port-forward -n $NAMESPACE svc/clean-dev-pg-pooler-rw 5432:5432"
echo "    PGPASSWORD='$POSTGRES_APP_PASSWORD' psql -h localhost -U cleandev -d cleandev"
echo "-------------------------------------------------------------------"
echo ""
echo "==================================================================="
echo "Next Steps"
echo "==================================================================="
echo ""
echo "1. Commit the sealed secrets to trigger ArgoCD deployment:"
echo "   git add k8s/postgres-secrets-sealed.yaml k8s/kustomization.yaml"
echo "   git commit -m 'Add PostgreSQL sealed secrets'"
echo "   git push"
echo ""
echo "2. Monitor ArgoCD sync:"
echo "   kubectl get application clean-dev -n argocd -w"
echo ""
echo "3. Check PostgreSQL cluster status after ArgoCD deploys it:"
echo "   ./scripts/check-postgres.sh"
echo ""
echo "4. Configure backups (see k8s/POSTGRES.md for details):"
echo "   - Set up S3 bucket and credentials"
echo "   - Update postgres-cluster.yaml with S3 details"
echo "   - Enable scheduled backups"
echo ""
print_status "Secrets setup complete! Push to git and ArgoCD will deploy PostgreSQL."
