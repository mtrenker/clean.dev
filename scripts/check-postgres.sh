#!/bin/bash
# Check PostgreSQL cluster status and health

NAMESPACE="clean-dev"
CLUSTER_NAME="clean-dev-pg"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================================================="
echo "CloudNativePG Cluster Status for clean-dev"
echo "=================================================================="
echo ""

# Check if cluster exists
if ! kubectl get cluster "$CLUSTER_NAME" -n "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}✗${NC} PostgreSQL cluster not found!"
    echo "Deploy it with: kubectl apply -k k8s/"
    exit 1
fi

# Cluster status
echo -e "${BLUE}📊 Cluster Status:${NC}"
echo "-------------------------------------------------------------------"
kubectl get cluster "$CLUSTER_NAME" -n "$NAMESPACE"
echo ""

# Phase
PHASE=$(kubectl get cluster "$CLUSTER_NAME" -n "$NAMESPACE" -o jsonpath='{.status.phase}')
if [[ "$PHASE" == "Cluster in healthy state" ]]; then
    echo -e "${GREEN}✓${NC} Cluster is healthy"
else
    echo -e "${RED}✗${NC} Cluster status: $PHASE"
fi

# Ready instances
READY=$(kubectl get cluster "$CLUSTER_NAME" -n "$NAMESPACE" -o jsonpath='{.status.readyInstances}')
INSTANCES=$(kubectl get cluster "$CLUSTER_NAME" -n "$NAMESPACE" -o jsonpath='{.status.instances}')
echo -e "  Ready instances: $READY/$INSTANCES (single-instance blog setup)"

# Primary pod
PRIMARY=$(kubectl get cluster "$CLUSTER_NAME" -n "$NAMESPACE" -o jsonpath='{.status.currentPrimary}')
echo -e "  Primary: ${GREEN}$PRIMARY${NC}"

echo ""
echo -e "${BLUE}🗄️  PostgreSQL Pods:${NC}"
echo "-------------------------------------------------------------------"
kubectl get pods -n "$NAMESPACE" -l "cnpg.io/cluster=$CLUSTER_NAME" -o wide
echo ""



echo -e "${BLUE}🌐 Services:${NC}"
echo "-------------------------------------------------------------------"
kubectl get svc -n "$NAMESPACE" | grep "$CLUSTER_NAME" || echo "No services found"
echo ""

echo -e "${BLUE}💾 Persistent Volumes:${NC}"
echo "-------------------------------------------------------------------"
kubectl get pvc -n "$NAMESPACE" | grep "$CLUSTER_NAME" || echo "No PVCs found"
echo ""

# Get metrics if available
if kubectl get servicemonitor -n "$NAMESPACE" &> /dev/null 2>&1; then
    echo -e "${BLUE}📈 Monitoring:${NC}"
    echo "-------------------------------------------------------------------"
    kubectl get servicemonitor -n "$NAMESPACE" | grep "clean-dev-pg" || echo "No ServiceMonitors found"
    echo ""
fi

# Connection information
echo -e "${BLUE}🔌 Connection Information:${NC}"
echo "-------------------------------------------------------------------"
echo "Internal (from cluster):"
echo "  Read-Write: clean-dev-pg-rw:5432"
echo "  Read-Only:  clean-dev-pg-ro:5432"
echo ""
echo "Database: cleandev"
echo "User:     cleandev (from clean-dev-pg-app secret)"
echo ""
echo "Port-forward for local access:"
echo "  kubectl port-forward -n $NAMESPACE svc/clean-dev-pg-rw 5432:5432"
echo ""

# Recent events
echo -e "${BLUE}📋 Recent Events:${NC}"
echo "-------------------------------------------------------------------"
kubectl get events -n "$NAMESPACE" \
  --sort-by='.lastTimestamp' \
  --field-selector involvedObject.kind=Cluster,involvedObject.name="$CLUSTER_NAME" \
  --tail=5 2>/dev/null || echo "No recent events"
echo ""

# Backup status
echo -e "${BLUE}💿 Backup Status:${NC}"
echo "-------------------------------------------------------------------"
BACKUPS=$(kubectl get backup -n "$NAMESPACE" 2>/dev/null | grep "$CLUSTER_NAME" || echo "No backups configured")
if [[ "$BACKUPS" == "No backups configured" ]]; then
    echo -e "${YELLOW}⚠${NC} No backups found. Configure S3 backup in postgres-cluster.yaml"
else
    echo "$BACKUPS"
fi
echo ""

# Quick health checks
echo -e "${BLUE}🏥 Health Checks:${NC}"
echo "-------------------------------------------------------------------"

# Check if single instance
REPLICA_COUNT=$(kubectl exec -n "$NAMESPACE" "$PRIMARY" -c postgres -- psql -U postgres -tAc "SELECT count(*) FROM pg_stat_replication" 2>/dev/null || echo "0")
if [[ "$REPLICA_COUNT" == "0" ]]; then
    echo -e "${GREEN}✓${NC} Single-instance mode (no replication)"
else
    echo -e "${YELLOW}⚠${NC} Active replicas: $REPLICA_COUNT (unexpected for single-instance)"
fi

# Check connections
CONN_COUNT=$(kubectl exec -n "$NAMESPACE" "$PRIMARY" -c postgres -- psql -U postgres -tAc "SELECT count(*) FROM pg_stat_activity WHERE datname='cleandev'" 2>/dev/null || echo "0")
echo -e "  Active connections to cleandev: $CONN_COUNT"

# Check database size
DB_SIZE=$(kubectl exec -n "$NAMESPACE" "$PRIMARY" -c postgres -- psql -U postgres -tAc "SELECT pg_size_pretty(pg_database_size('cleandev'))" 2>/dev/null || echo "Unknown")
echo -e "  Database size: $DB_SIZE"

echo ""
echo "=================================================================="
echo "Quick Commands:"
echo "=================================================================="
echo ""
echo "Connect to database:"
echo "  kubectl run -it --rm psql --image=postgres:16 --restart=Never -n $NAMESPACE -- \\"
echo "    psql -h clean-dev-pg-rw -U cleandev -d cleandev"
echo ""
echo "View logs:"
echo "  kubectl logs -n $NAMESPACE $PRIMARY -c postgres --tail=50"
echo ""
echo "Execute SQL:"
echo "  kubectl exec -n $NAMESPACE $PRIMARY -c postgres -- \\"
echo "    psql -U postgres -d cleandev -c \"SELECT version();\""
echo ""
echo "Trigger manual backup:"
echo "  kubectl cnpg backup $CLUSTER_NAME -n $NAMESPACE"
echo ""
echo "Scale cluster:"
echo "  kubectl cnpg scale $CLUSTER_NAME -n $NAMESPACE --instances 3"
echo ""
