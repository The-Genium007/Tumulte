# Tumulte Monitoring Stack

Stack de monitoring Prometheus + Grafana pour l'application Tumulte, avec support multi-environnement et intégration Cloudflare Tunnel.

## Structure des fichiers

```
monitoring/
├── docker-compose.yml              # Configuration de base
├── docker-compose.staging.yml      # Override staging
├── docker-compose.production.yml   # Override production
├── .env.example                    # Template des variables d'environnement
├── scripts/
│   └── deploy.sh                   # Script de déploiement simplifié
├── prometheus/
│   ├── prometheus.yml              # Config principale Prometheus
│   ├── alerts.yml                  # Règles d'alertes
│   └── targets/                    # Targets par environnement
│       ├── backend.staging.yml
│       ├── backend.production.yml
│       ├── frontend.staging.yml
│       └── frontend.production.yml
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/            # Config auto des datasources
│   │   └── dashboards/             # Config auto des dashboards
│   └── dashboards/
│       └── tumulte-overview.json
├── alertmanager/
│   ├── alertmanager.yml            # Config des notifications Discord
│   └── templates/
│       └── discord.tmpl            # Template messages Discord
└── cloudflare/
    └── docker-compose.tunnel.yml   # Tunnel Cloudflare sécurisé
```

---

## Quick Start

### Développement local

```bash
cd monitoring
cp .env.example .env
# Éditer .env avec tes valeurs
./scripts/deploy.sh dev
```

### Staging (avec Cloudflare Tunnel)

```bash
cp .env.example .env.staging
# Configurer CLOUDFLARE_TUNNEL_TOKEN, DISCORD_*_WEBHOOK_URL, etc.
./scripts/deploy.sh staging --tunnel
```

### Production (avec Cloudflare Tunnel)

```bash
cp .env.example .env.production
# Configurer toutes les variables de production
./scripts/deploy.sh prod --tunnel
```

---

## Configuration des environnements

### Variables d'environnement

Crée un fichier `.env` (dev), `.env.staging` ou `.env.production` :

```bash
# === ENVIRONNEMENT ===
ENVIRONMENT=staging                    # development | staging | production
ENV_SUFFIX=staging                     # dev | staging | prod

# === GRAFANA ===
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=secure_password_here
GRAFANA_ROOT_URL=https://monitoring-staging.tumulte.app

# === DISCORD WEBHOOKS ===
# Crée des webhooks dans Discord: Server Settings > Integrations > Webhooks
DISCORD_MONITORING_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
DISCORD_CRITICAL_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/zzz

# === CLOUDFLARE TUNNEL ===
# Dashboard: https://one.dash.cloudflare.com/ > Access > Tunnels
CLOUDFLARE_TUNNEL_TOKEN=eyJhxxxxx
GRAFANA_PUBLIC_DOMAIN=monitoring-staging.tumulte.app

# === EXPORTERS ===
DATA_SOURCE_NAME=postgresql://user:pass@host:5432/twitch_polls?sslmode=disable
REDIS_ADDR=host.docker.internal:6379
REDIS_PASSWORD=
```

### Commandes du script deploy.sh

```bash
# Démarrer
./scripts/deploy.sh dev                    # Développement local
./scripts/deploy.sh staging                # Staging sans tunnel
./scripts/deploy.sh staging --tunnel       # Staging avec Cloudflare
./scripts/deploy.sh prod --tunnel          # Production avec Cloudflare

# Gestion
./scripts/deploy.sh staging --down         # Arrêter
./scripts/deploy.sh staging --restart      # Redémarrer
./scripts/deploy.sh staging --logs         # Voir les logs
./scripts/deploy.sh staging --status       # Statut des containers
```

---

## Cloudflare Tunnel

Le tunnel Cloudflare permet d'exposer Grafana de manière sécurisée sans ouvrir de ports sur le serveur.

### Configuration

1. **Créer le tunnel** dans [Cloudflare Zero Trust](https://one.dash.cloudflare.com/):
   - Access > Tunnels > Create Tunnel
   - Nom: `tumulte-monitoring-staging` ou `tumulte-monitoring-prod`
   - Copier le token

2. **Configurer les routes publiques**:
   | Public hostname | Service |
   |-----------------|---------|
   | `monitoring-staging.tumulte.app` | `http://grafana:3000` |
   | `monitoring.tumulte.app` | `http://grafana:3000` |

3. **(Optionnel) Ajouter une Access Policy**:
   - Access > Applications > Add Application
   - Type: Self-hosted
   - Domain: `monitoring.tumulte.app`
   - Policy: Email OTP ou SSO

### Architecture avec tunnel

```
Internet
    │
    ▼
Cloudflare Edge (CDN + DDoS protection)
    │
    ▼ (tunnel chiffré TLS)
cloudflared container
    │
    └──► tumulte-grafana:3000 → monitoring.tumulte.app
```

> **Note**: Prometheus et Alertmanager ne sont PAS exposés publiquement pour des raisons de sécurité.

---

## Alertes Discord

Les alertes sont envoyées vers Discord via webhooks. Deux channels recommandés :
- **#monitoring** : Alertes normales (warnings)
- **#alertes-critiques** : Alertes critiques uniquement

### Créer un webhook Discord

1. Server Settings > Integrations > Webhooks
2. New Webhook
3. Copier l'URL
4. Coller dans `.env.staging` ou `.env.production`

### Alertes configurées

| Alerte | Condition | Sévérité |
|--------|-----------|----------|
| TumulteBackendDown | Service down > 1min | Critical |
| TumulteFrontendDown | Service down > 1min | Critical |
| HighRequestLatency | p95 > 1s pendant 5min | Warning |
| HighErrorRate | > 5% erreurs 5xx | Critical |
| HighCpuUsage | CPU > 80% pendant 10min | Warning |
| LowMemoryAvailable | RAM < 10% | Critical |
| DiskSpaceLow | Disque < 15% | Warning |
| PostgresDown | DB down | Critical |
| RedisDown | Cache down | Critical |
| ContainerRestarting | > 3 restarts/heure | Warning |

---

## Comment ça marche

```
┌─────────────────────────────────────────────────────────────────┐
│                        TON APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│  Backend (AdonisJS)          Frontend (Nuxt)                    │
│  └─ GET /metrics             └─ GET /metrics                    │
│     (prom-client)               (prom-client)                   │
└─────────────────────────────────────────────────────────────────┘
                    │                        │
                    ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PROMETHEUS                                │
│  - Scrape toutes les 15s les endpoints /metrics                 │
│  - Stocke les données en time-series                            │
│  - Évalue les alertes → Alertmanager → Discord                  │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GRAFANA                                  │
│  - Requête Prometheus via PromQL                                │
│  - Affiche les dashboards                                       │
│  - Accessible via Cloudflare Tunnel (staging/prod)              │
└─────────────────────────────────────────────────────────────────┘
```

### Flux de données

1. **Ton app expose /metrics** → Format texte Prometheus
2. **Prometheus scrape** → Toutes les 15 secondes
3. **Prometheus évalue** → Les alertes selon `alerts.yml`
4. **Alertmanager notifie** → Discord via webhooks
5. **Grafana visualise** → Dashboards en temps réel

---

## Métriques disponibles

### Backend Tumulte

| Métrique | Type | Description |
|----------|------|-------------|
| `tumulte_http_requests_total` | Counter | Nombre de requêtes HTTP |
| `tumulte_http_request_duration_seconds` | Histogram | Latence des requêtes |
| `tumulte_websocket_connections_total` | Gauge | Connexions WS actives |
| `tumulte_polls_launched_total` | Counter | Polls lancés |
| `tumulte_polls_active_total` | Gauge | Polls en cours |
| `tumulte_votes_received_total` | Counter | Votes reçus |
| `tumulte_db_connections_active` | Gauge | Connexions DB actives |
| `tumulte_db_connections_idle` | Gauge | Connexions DB idle |
| `tumulte_cache_hits_total` | Counter | Hits cache |
| `tumulte_cache_misses_total` | Counter | Misses cache |

### Exporters

| Source | Métriques clés |
|--------|----------------|
| Node Exporter | CPU, RAM, disque, réseau |
| Postgres Exporter | Connexions, transactions, locks |
| Redis Exporter | Mémoire, commandes, clients |
| cAdvisor | CPU/RAM par container Docker |

---

## Requêtes PromQL utiles

### Taux de requêtes par seconde
```promql
sum(rate(tumulte_http_requests_total[5m]))
```

### Latence p95
```promql
histogram_quantile(0.95, sum(rate(tumulte_http_request_duration_seconds_bucket[5m])) by (le))
```

### Taux d'erreurs
```promql
sum(rate(tumulte_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(tumulte_http_requests_total[5m]))
```

### Mémoire utilisée (pourcentage)
```promql
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100
```

### Cache hit rate
```promql
sum(rate(tumulte_cache_hits_total[5m])) / (sum(rate(tumulte_cache_hits_total[5m])) + sum(rate(tumulte_cache_misses_total[5m]))) * 100
```

---

## Scalabilité : quand ajouter des machines ?

Surveille ces métriques pour savoir quand scaler :

| Métrique | Seuil d'alerte | Action |
|----------|----------------|--------|
| CPU > 70% constant | Warning | Envisager scale |
| CPU > 85% constant | Critical | Scaler immédiatement |
| RAM > 80% | Warning | Augmenter RAM ou instances |
| Latence p95 > 500ms | Warning | Optimiser ou scaler |
| Latence p95 > 1s | Critical | Scaler backend |
| DB connections > 80% pool | Warning | Augmenter pool ou replicas |
| WebSocket > 500/instance | Info | Prévoir scale horizontal |

---

## Troubleshooting

### Prometheus ne scrape pas mes métriques

1. Vérifie que ton app expose `/metrics` :
   ```bash
   curl http://localhost:3333/metrics
   ```

2. Vérifie les targets dans Prometheus :
   - http://localhost:9090/targets
   - Le status doit être "UP"

3. Vérifie la connectivité réseau :
   - `host.docker.internal` fonctionne sur Mac/Windows
   - Sur Linux, utilise l'IP du host ou `--network=host`

### Grafana ne montre pas de données

1. Vérifie que la datasource Prometheus est configurée :
   - Settings → Data Sources → Prometheus
   - Test la connexion

2. Vérifie que Prometheus reçoit des données :
   - http://localhost:9090/graph
   - Tape une métrique et vérifie qu'il y a des résultats

### Les alertes Discord ne partent pas

1. Vérifie que les webhooks sont configurés dans `.env.staging` ou `.env.production`

2. Vérifie Alertmanager :
   - http://localhost:9093
   - Status → Alertmanager Config
   - Vérifie que les URLs ne contiennent pas "PLACEHOLDER"

3. Teste le webhook manuellement :
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"content": "Test depuis Tumulte Monitoring"}' \
     "$DISCORD_MONITORING_WEBHOOK_URL"
   ```

### Le tunnel Cloudflare ne fonctionne pas

1. Vérifie le token :
   ```bash
   docker logs tumulte-cloudflared-staging
   ```

2. Vérifie la configuration dans le dashboard Cloudflare Zero Trust

3. Vérifie que les routes sont bien configurées vers `http://grafana:3000`

---

## Connexion au réseau des applications

Pour que Prometheus puisse scraper les métriques des containers backend/frontend en staging/production, les containers doivent être sur le même réseau Docker.

Ajoute dans `docker-compose.staging.yml` ou `docker-compose.production.yml` :

```yaml
networks:
  monitoring:
    # Réseau par défaut du monitoring
  dokploy-network:
    external: true
    # Réseau partagé avec backend/frontend
```

Et ajoute `dokploy-network` aux services prometheus et les exporters si nécessaire.
