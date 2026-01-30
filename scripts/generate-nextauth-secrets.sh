#!/bin/bash
set -e

# Check if kubeseal is installed
if ! command -v kubeseal &> /dev/null; then
    echo "Error: kubeseal is not installed"
    echo "Install it from: https://github.com/bitnami-labs/sealed-secrets"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Generate AUTH_SECRET
echo "Generating AUTH_SECRET..."
AUTH_SECRET=$(openssl rand -base64 32)

# Prompt for GitHub OAuth credentials
if [ -z "$GITHUB_ID" ]; then
    read -p "Enter GITHUB_ID: " GITHUB_ID
fi

if [ -z "$GITHUB_SECRET" ]; then
    read -sp "Enter GITHUB_SECRET: " GITHUB_SECRET
    echo
fi

NAMESPACE="clean-dev"

# Create a temporary secret manifest
kubectl create secret generic nextauth-secrets \
    --namespace="$NAMESPACE" \
    --from-literal=auth-secret="$AUTH_SECRET" \
    --from-literal=github-id="$GITHUB_ID" \
    --from-literal=github-secret="$GITHUB_SECRET" \
    --dry-run=client -o yaml | \
kubeseal --namespace="$NAMESPACE" -o yaml > k8s/nextauth-secrets-sealed.yaml

echo "Sealed secret created: k8s/nextauth-secrets-sealed.yaml"
echo "Apply it with: kubectl apply -f k8s/nextauth-secrets-sealed.yaml"
