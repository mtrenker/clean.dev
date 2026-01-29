#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE="clean-dev"
OUTPUT_FILE="../k8s/postgres-secrets-sealed.yaml"

echo -e "${GREEN}=== PostgreSQL Sealed Secrets Generator ===${NC}\n"

# Check if kubeseal is installed
if ! command -v kubeseal &> /dev/null; then
    echo -e "${RED}Error: kubeseal is not installed${NC}"
    echo "Install it with: brew install kubeseal (macOS) or see https://github.com/bitnami-labs/sealed-secrets"
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: kubectl is not configured or cluster is not accessible${NC}"
    exit 1
fi

echo -e "${YELLOW}This script will generate sealed secrets for PostgreSQL${NC}"
echo -e "Namespace: ${NAMESPACE}\n"

# Generate or prompt for superuser password
echo -e "${GREEN}Generating superuser password...${NC}"
POSTGRES_PASSWORD=$(openssl rand -base64 32)
echo "Generated password for postgres superuser (will be sealed)"

# Generate or prompt for app user password
echo -e "${GREEN}Generating app user password...${NC}"
APP_PASSWORD=$(openssl rand -base64 32)
echo "Generated password for cleandev user (will be sealed)"

echo -e "\n${GREEN}Creating sealed secrets...${NC}\n"

# Create temporary file for combined secrets
TEMP_FILE=$(mktemp)

# Create superuser secret
kubectl create secret generic clean-dev-pg-superuser \
  --namespace="$NAMESPACE" \
  --from-literal=username=postgres \
  --from-literal=password="$POSTGRES_PASSWORD" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml --controller-namespace=kube-system --controller-name=sealed-secrets-controller > "$TEMP_FILE"

# Create app user secret
kubectl create secret generic clean-dev-pg-app \
  --namespace="$NAMESPACE" \
  --from-literal=username=cleandev \
  --from-literal=password="$APP_PASSWORD" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml --controller-namespace=kube-system --controller-name=sealed-secrets-controller >> "$TEMP_FILE"

# Move to output file
mv "$TEMP_FILE" "$OUTPUT_FILE"

echo -e "${GREEN}✓ Sealed secrets created: ${OUTPUT_FILE}${NC}"
echo -e "\n${YELLOW}Important notes:${NC}"
echo "1. The sealed secrets file is safe to commit to git"
echo "2. Original passwords are NOT stored anywhere - only encrypted versions"
echo "3. Apply with: kubectl apply -f $OUTPUT_FILE"
echo "4. After cluster deployment, get app password with:"
echo "   kubectl get secret clean-dev-pg-app -n $NAMESPACE -o jsonpath='{.data.password}' | base64 -d"
echo ""
