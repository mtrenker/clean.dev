#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE="clean-dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="$SCRIPT_DIR/../k8s/nextauth-secrets-sealed.yaml"

echo -e "${GREEN}=== NextAuth Sealed Secrets Generator ===${NC}\n"

# Check dependencies
if ! command -v kubeseal &> /dev/null; then
    echo -e "${RED}Error: kubeseal is not installed${NC}"
    echo "Install it with: brew install kubeseal (macOS) or see https://github.com/bitnami-labs/sealed-secrets"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: kubectl is not configured or cluster is not accessible${NC}"
    exit 1
fi

echo -e "${YELLOW}This script will generate sealed secrets for GitHub + LinkedIn Auth.js configuration${NC}"
echo -e "Namespace: ${NAMESPACE}\n"

# Generate AUTH_SECRET unless one is already supplied
if [ -z "$AUTH_SECRET" ]; then
    echo -e "${GREEN}Generating AUTH_SECRET...${NC}"
    AUTH_SECRET=$(openssl rand -base64 32)
else
    echo -e "${GREEN}Using AUTH_SECRET from environment${NC}"
fi

# Prompt for OAuth credentials if not already supplied
if [ -z "$GITHUB_ID" ]; then
    read -p "GitHub OAuth Client ID: " GITHUB_ID
fi

if [ -z "$GITHUB_SECRET" ]; then
    read -sp "GitHub OAuth Client Secret: " GITHUB_SECRET
    echo
fi

if [ -z "$ALLOWED_GITHUB_USERS" ]; then
    read -p "Allowed GitHub username(s) (comma-separated): " ALLOWED_GITHUB_USERS
fi

if [ -z "$LINKEDIN_CLIENT_ID" ]; then
    read -p "LinkedIn OAuth Client ID: " LINKEDIN_CLIENT_ID
fi

if [ -z "$LINKEDIN_CLIENT_SECRET" ]; then
    read -sp "LinkedIn OAuth Client Secret: " LINKEDIN_CLIENT_SECRET
    echo
fi

echo -e "\n${GREEN}Creating sealed secret...${NC}\n"

kubectl create secret generic nextauth-secrets \
    --namespace="$NAMESPACE" \
    --from-literal=auth-secret="$AUTH_SECRET" \
    --from-literal=github-id="$GITHUB_ID" \
    --from-literal=github-secret="$GITHUB_SECRET" \
    --from-literal=allowed-github-users="$ALLOWED_GITHUB_USERS" \
    --from-literal=linkedin-client-id="$LINKEDIN_CLIENT_ID" \
    --from-literal=linkedin-client-secret="$LINKEDIN_CLIENT_SECRET" \
    --dry-run=client -o yaml | \
  kubeseal -o yaml --controller-namespace=kube-system --controller-name=sealed-secrets-controller > "$OUTPUT_FILE"

echo -e "${GREEN}✓ Sealed secret created: ${OUTPUT_FILE}${NC}"
echo -e "\n${YELLOW}Important notes:${NC}"
echo "1. The sealed secrets file is safe to commit to git"
echo "2. Original credentials are NOT stored anywhere - only encrypted versions"
echo "3. Apply with: kubectl apply -f $OUTPUT_FILE"
echo "4. This secret now includes both GitHub admin auth and LinkedIn review auth"
echo ""
