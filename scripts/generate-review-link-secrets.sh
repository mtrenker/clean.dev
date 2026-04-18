#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE="clean-dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="$SCRIPT_DIR/../k8s/review-link-secrets-sealed.yaml"

echo -e "${GREEN}=== Review Link Sealed Secrets Generator ===${NC}\n"

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

echo -e "${YELLOW}This script will generate sealed secrets for review-link signing and delivery${NC}"
echo -e "Namespace: ${NAMESPACE}\n"

# Generate signing secret unless supplied explicitly
if [ -z "$REVIEW_LINK_SECRET" ]; then
  echo -e "${GREEN}Generating REVIEW_LINK_SECRET...${NC}"
  REVIEW_LINK_SECRET=$(openssl rand -base64 48)
else
  echo -e "${GREEN}Using REVIEW_LINK_SECRET from environment${NC}"
fi

if [ -z "$REVIEW_RECIPIENT_EMAIL" ]; then
  read -p "Review recipient email (e.g. reviews@clean.dev): " REVIEW_RECIPIENT_EMAIL
fi

if [ -z "$FEATURE_REVIEW_LINKS" ]; then
  read -p "Enable review links? (true/false) [false]: " FEATURE_REVIEW_LINKS
fi

FEATURE_REVIEW_LINKS=${FEATURE_REVIEW_LINKS:-false}

case "$FEATURE_REVIEW_LINKS" in
  true|false) ;;
  *)
    echo -e "${RED}Error: FEATURE_REVIEW_LINKS must be 'true' or 'false'${NC}"
    exit 1
    ;;
esac

case "$REVIEW_RECIPIENT_EMAIL" in
  *@*) ;;
  *)
    echo -e "${RED}Error: REVIEW_RECIPIENT_EMAIL must look like an email address${NC}"
    exit 1
    ;;
esac

echo -e "\n${GREEN}Creating sealed secret...${NC}\n"

kubectl create secret generic review-link-secrets \
  --namespace="$NAMESPACE" \
  --from-literal=signing-secret="$REVIEW_LINK_SECRET" \
  --from-literal=recipient-email="$REVIEW_RECIPIENT_EMAIL" \
  --from-literal=feature-flag="$FEATURE_REVIEW_LINKS" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml --controller-namespace=kube-system --controller-name=sealed-secrets-controller > "$OUTPUT_FILE"

echo -e "${GREEN}✓ Sealed secret created: ${OUTPUT_FILE}${NC}"
echo -e "\n${YELLOW}Important notes:${NC}"
echo "1. The sealed secrets file is safe to commit to git"
echo "2. Original credentials are NOT stored anywhere - only encrypted versions"
echo "3. Apply with: kubectl apply -f $OUTPUT_FILE"
echo "4. The generated secret configures REVIEW_LINK_SECRET, REVIEW_RECIPIENT_EMAIL, and FEATURE_REVIEW_LINKS"
echo ""
