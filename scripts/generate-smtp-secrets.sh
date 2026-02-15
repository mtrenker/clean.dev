#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE="clean-dev"
OUTPUT_FILE="../k8s/smtp-secrets-sealed.yaml"

echo -e "${GREEN}=== SMTP Sealed Secrets Generator ===${NC}\n"

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

echo -e "${YELLOW}This script will generate sealed secrets for SMTP configuration${NC}"
echo -e "Namespace: ${NAMESPACE}\n"

# Prompt for SMTP configuration
read -p "SMTP Host (e.g., smtp.tem.scaleway.com): " SMTP_HOST
read -p "SMTP Port (e.g., 587): " SMTP_PORT
read -p "SMTP Secure (true for port 465, false for port 587): " SMTP_SECURE
read -p "SMTP Username/Project ID: " SMTP_USER
read -sp "SMTP Password/Secret Key: " SMTP_PASS
echo ""
read -p "SMTP From Address (e.g., no-reply <no-reply@example.com>): " SMTP_FROM

echo -e "\n${GREEN}Creating sealed secrets...${NC}\n"

# Create sealed secret
kubectl create secret generic clean-dev-smtp \
  --namespace="$NAMESPACE" \
  --from-literal=host="$SMTP_HOST" \
  --from-literal=port="$SMTP_PORT" \
  --from-literal=secure="$SMTP_SECURE" \
  --from-literal=user="$SMTP_USER" \
  --from-literal=password="$SMTP_PASS" \
  --from-literal=from="$SMTP_FROM" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml --controller-namespace=kube-system --controller-name=sealed-secrets-controller > "$OUTPUT_FILE"

echo -e "${GREEN}✓ Sealed secrets created: ${OUTPUT_FILE}${NC}"
echo -e "\n${YELLOW}Important notes:${NC}"
echo "1. The sealed secrets file is safe to commit to git"
echo "2. Original credentials are NOT stored anywhere - only encrypted versions"
echo "3. Apply with: kubectl apply -f $OUTPUT_FILE"
echo "4. Update deployment environment variables to reference this secret"
echo ""
