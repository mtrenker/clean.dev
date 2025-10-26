# PostgreSQL Cluster Deployment Summary

## What Was Added

A complete CloudNativePG PostgreSQL cluster with monitoring has been added to
your clean.dev deployment.

### Components Created

#### 1. PostgreSQL Cluster (`postgres-cluster.yaml`)

- **3-node HA cluster** with automatic failover
- PostgreSQL 16.1
- 10Gi storage per instance
- Custom configuration optimized for small-medium workloads
- Prepared for S3 backups (requires configuration)
- Anti-affinity rules to spread pods across nodes

#### 2. Connection Pooler (`postgres-pooler.yaml`)

- **PgBouncer** with 2 instances
- Transaction-mode pooling
- Up to 1000 client connections
- Automatic metrics export

#### 3. Monitoring Configuration

**Custom Queries** (`postgres-monitoring-queries.yaml`):

- Database and table sizes
- Connection statistics
- Cache hit ratios
- Slow query detection
- Index usage stats
- Replication lag
- Deadlock detection

**ServiceMonitors** (`postgres-servicemonitor.yaml`):

- Automatic Prometheus scraping of PostgreSQL metrics
- PgBouncer metrics collection
- 30-second scrape interval

**Grafana Dashboard** (`postgres-grafana-dashboard.yaml`):

- Pre-configured dashboard with 10+ panels
- Real-time metrics visualization
- Performance insights
- Resource usage tracking

**Prometheus Alerts** (`postgres-alerts.yaml`):

- 20+ alerting rules covering:
  - Cluster health and availability
  - Replication lag
  - Connection exhaustion
  - Performance degradation
  - Storage capacity
  - Backup failures
  - Resource usage

#### 4. Secrets Template (`postgres-secrets.yaml`)

- Template for PostgreSQL superuser credentials
- Template for application user credentials
- Ready for sealing with kubeseal

#### 5. Application Integration (`deployment.yaml`)

- Environment variables for database connection
- Automatic DATABASE_URL construction
- Secure credential injection from secrets

#### 6. Helper Scripts

**`scripts/setup-postgres.sh`**:

- Interactive setup wizard
- Generates sealed secrets
- Deploys cluster
- Validates deployment
- Provides connection information

**`scripts/check-postgres.sh`**:

- Real-time cluster status
- Health checks
- Connection information
- Quick command reference

**`scripts/validate-k8s.sh`** (updated):

- Enhanced validation for PostgreSQL resources
- Resource summary

#### 7. Documentation

**`k8s/POSTGRES.md`**:

- Complete PostgreSQL operations guide
- Setup instructions
- Connection examples
- Backup and recovery procedures
- Scaling guide
- Troubleshooting tips
- Security best practices

**`k8s/README.md`** (updated):

- Added PostgreSQL to prerequisites
- Added component overview
- Reference to POSTGRES.md

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clean.dev App                        │
│                     (Next.js Deployment)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ DATABASE_URL
                           ↓
                  ┌─────────────────┐
                  │   PgBouncer     │
                  │   (Pooler)      │
                  │   2 replicas    │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │  PG-1   │←─────→│  PG-2   │←─────→│  PG-3   │
   │ Primary │       │ Replica │       │ Replica │
   └─────────┘       └─────────┘       └─────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ↓
                    ┌─────────────┐
                    │ Prometheus  │
                    │  (Metrics)  │
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
                    │   Grafana   │
                    │ (Dashboard) │
                    └─────────────┘
```

## Monitoring Metrics

### Key Metrics Exposed

1. **PostgreSQL Core Metrics**:
   - Active connections
   - Transaction rate (commits/rollbacks)
   - Cache hit ratio
   - Database size
   - Replication lag
   - Query duration

2. **Custom Application Metrics**:
   - Table sizes
   - Index usage
   - Slow queries
   - Connection states
   - Deadlock count

3. **PgBouncer Metrics**:
   - Client connections
   - Server connections
   - Waiting clients
   - Pool saturation

4. **Resource Metrics**:
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

### Alerting

All alerts are configured with appropriate severity levels:

- **Critical**: Requires immediate action (cluster down, connections exhausted)
- **Warning**: Requires investigation (high replication lag, low cache hit
  ratio)

Alerts can be routed to:

- Slack
- PagerDuty
- Email
- Other Alertmanager integrations

## Quick Start

### Prerequisites

Install on your cluster:

```bash
# CloudNativePG Operator
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.21/releases/cnpg-1.21.0.yaml

# Prometheus Operator (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
```

### Deploy

```bash
# Run the setup script
./scripts/setup-postgres.sh

# Or manually:
# 1. Create secrets (see k8s/POSTGRES.md)
# 2. Uncomment sealed secrets in k8s/kustomization.yaml
# 3. Apply: kubectl apply -k k8s/
```

### Verify

```bash
# Check status
./scripts/check-postgres.sh

# Or manually:
kubectl get cluster -n clean-dev
kubectl get pods -n clean-dev -l cnpg.io/cluster=clean-dev-pg
```

### Connect

```bash
# From your app - automatic via environment variables
# DATABASE_URL is already set

# From local machine
kubectl port-forward -n clean-dev svc/clean-dev-pg-pooler-rw 5432:5432
psql -h localhost -U cleandev -d cleandev
```

## Next Steps

1. **Configure Backups**:
   - Set up S3 bucket
   - Create backup credentials
   - Enable scheduled backups
   - See `k8s/POSTGRES.md` for details

2. **Set Up Grafana**:
   - Import the dashboard from the ConfigMap
   - Configure Prometheus datasource
   - Set up alert notifications

3. **Security Hardening**:
   - Enable SSL/TLS for connections
   - Set up Network Policies
   - Review and rotate credentials
   - Configure WAL encryption

4. **Performance Tuning**:
   - Monitor metrics
   - Adjust PostgreSQL parameters
   - Scale resources as needed
   - Optimize queries based on metrics

5. **Test Failover**:
   - Trigger manual failover
   - Verify application resilience
   - Document recovery procedures

## File Structure

```
k8s/
├── postgres-cluster.yaml           # Main PostgreSQL cluster
├── postgres-pooler.yaml            # PgBouncer connection pooler
├── postgres-monitoring-queries.yaml # Custom Prometheus queries
├── postgres-servicemonitor.yaml    # Prometheus ServiceMonitors
├── postgres-grafana-dashboard.yaml # Grafana dashboard ConfigMap
├── postgres-alerts.yaml            # Prometheus alerting rules
├── postgres-secrets.yaml           # Secret templates (not deployed)
├── POSTGRES.md                     # Complete operations guide
└── kustomization.yaml              # Updated with PostgreSQL resources

scripts/
├── setup-postgres.sh               # Interactive setup wizard
├── check-postgres.sh               # Status and health checks
└── validate-k8s.sh                 # Enhanced validation
```

## Troubleshooting

See `k8s/POSTGRES.md` for comprehensive troubleshooting guide.

Quick checks:

```bash
# Cluster status
kubectl describe cluster clean-dev-pg -n clean-dev

# Pod logs
kubectl logs -n clean-dev clean-dev-pg-1 -c postgres

# Events
kubectl get events -n clean-dev --sort-by='.lastTimestamp'

# Connection test
kubectl run -it --rm psql-test --image=postgres:16 -n clean-dev -- \
  psql -h clean-dev-pg-pooler-rw -U cleandev -d cleandev
```

## Resources

- [CloudNativePG Documentation](https://cloudnative-pg.io/documentation/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Prometheus Operator](https://prometheus-operator.dev/)

---

**Note**: Remember to configure backups before using in production!
