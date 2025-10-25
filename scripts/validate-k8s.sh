#!/bin/bash

# Script to validate Kubernetes manifests
set -e

echo "🔍 Validating Kubernetes manifests..."

# Check if kustomize is available
if ! command -v kustomize &> /dev/null; then
    echo "❌ kustomize is not installed. Please install it first:"
    echo "curl -s \"https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh\" | bash"
    exit 1
fi

# Change to k8s directory
cd "$(dirname "$0")/k8s"

echo "📋 Building Kustomize manifests..."
kustomize build . > /tmp/clean-dev-manifests.yaml

echo "✅ Kustomize build successful!"

# Check if kubectl is available for validation
if command -v kubectl &> /dev/null; then
    echo "🔧 Validating manifests with kubectl..."
    kubectl apply --dry-run=client -f /tmp/clean-dev-manifests.yaml
    echo "✅ Kubernetes manifests are valid!"
else
    echo "⚠️  kubectl not found. Skipping validation (install kubectl for full validation)"
fi

echo "📄 Generated manifests saved to /tmp/clean-dev-manifests.yaml"
echo "🎉 All checks passed!"
