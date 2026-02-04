#!/bin/bash
# =============================================================================
# Tumulte Monitoring Stack - Deploy Script
# =============================================================================
#
# Ce script facilite le déploiement de la stack de monitoring pour chaque
# environnement (development, staging, production).
#
# Usage:
#   ./scripts/deploy.sh [environment] [options]
#
# Environments:
#   dev, development   - Développement local (défaut)
#   staging            - Environnement de staging
#   prod, production   - Environnement de production
#
# Options:
#   --tunnel           - Activer le tunnel Cloudflare (staging/prod)
#   --down             - Arrêter la stack au lieu de la démarrer
#   --restart          - Redémarrer la stack
#   --logs             - Afficher les logs
#   --status           - Afficher le statut des containers
#   --help             - Afficher cette aide
#
# Exemples:
#   ./scripts/deploy.sh dev                    # Démarre en local
#   ./scripts/deploy.sh staging --tunnel      # Staging avec tunnel Cloudflare
#   ./scripts/deploy.sh prod --tunnel         # Production avec tunnel
#   ./scripts/deploy.sh staging --down        # Arrête staging
#   ./scripts/deploy.sh prod --logs           # Affiche les logs de prod
#
# =============================================================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="development"
USE_TUNNEL=false
ACTION="up"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    head -45 "$0" | tail -40
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development)
            ENVIRONMENT="development"
            shift
            ;;
        staging)
            ENVIRONMENT="staging"
            shift
            ;;
        prod|production)
            ENVIRONMENT="production"
            shift
            ;;
        --tunnel)
            USE_TUNNEL=true
            shift
            ;;
        --down)
            ACTION="down"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        --logs)
            ACTION="logs"
            shift
            ;;
        --status)
            ACTION="status"
            shift
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            ;;
    esac
done

# Se placer dans le bon répertoire
cd "$MONITORING_DIR"

# Définir les fichiers compose selon l'environnement
COMPOSE_FILES="-f docker-compose.yml"
ENV_FILE=".env"

case $ENVIRONMENT in
    development)
        ENV_SUFFIX="dev"
        if [[ -f ".env" ]]; then
            ENV_FILE=".env"
        fi
        ;;
    staging)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.staging.yml"
        ENV_SUFFIX="staging"
        if [[ -f ".env.staging" ]]; then
            ENV_FILE=".env.staging"
        else
            log_warning "Fichier .env.staging non trouvé, utilisation de .env"
        fi
        ;;
    production)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.production.yml"
        ENV_SUFFIX="prod"
        if [[ -f ".env.production" ]]; then
            ENV_FILE=".env.production"
        else
            log_warning "Fichier .env.production non trouvé, utilisation de .env"
        fi
        ;;
esac

# Ajouter le tunnel si demandé
if [[ "$USE_TUNNEL" == true ]]; then
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log_warning "Le tunnel Cloudflare n'est pas recommandé en développement local"
    fi
    COMPOSE_FILES="$COMPOSE_FILES -f cloudflare/docker-compose.tunnel.yml"
fi

# Préparer la configuration d'Alertmanager avec les webhooks Discord
prepare_alertmanager_config() {
    log_info "Préparation de la configuration Alertmanager..."

    if [[ -f "$ENV_FILE" ]]; then
        # Charger les variables d'environnement
        set -a
        source "$ENV_FILE"
        set +a

        # Créer une copie temporaire d'alertmanager.yml avec les webhooks substitués
        ALERTMANAGER_SRC="alertmanager/alertmanager.yml"
        ALERTMANAGER_TMP="alertmanager/alertmanager.generated.yml"

        if [[ -n "$DISCORD_MONITORING_WEBHOOK_URL" ]]; then
            sed "s|DISCORD_MONITORING_WEBHOOK_PLACEHOLDER|$DISCORD_MONITORING_WEBHOOK_URL|g" "$ALERTMANAGER_SRC" > "$ALERTMANAGER_TMP"
        else
            cp "$ALERTMANAGER_SRC" "$ALERTMANAGER_TMP"
            log_warning "DISCORD_MONITORING_WEBHOOK_URL non défini - webhooks désactivés"
        fi

        if [[ -n "$DISCORD_CRITICAL_WEBHOOK_URL" ]]; then
            sed -i.bak "s|DISCORD_CRITICAL_WEBHOOK_PLACEHOLDER|$DISCORD_CRITICAL_WEBHOOK_URL|g" "$ALERTMANAGER_TMP"
            rm -f "$ALERTMANAGER_TMP.bak"
        else
            log_warning "DISCORD_CRITICAL_WEBHOOK_URL non défini - alertes critiques non envoyées"
        fi

        log_success "Configuration Alertmanager préparée"
    else
        log_warning "Fichier $ENV_FILE non trouvé - configuration par défaut utilisée"
    fi
}

# Copier les targets Prometheus selon l'environnement
setup_prometheus_targets() {
    log_info "Configuration des targets Prometheus pour $ENVIRONMENT..."

    TARGETS_DIR="prometheus/targets"
    ACTIVE_DIR="prometheus/targets.d"

    mkdir -p "$ACTIVE_DIR"

    case $ENVIRONMENT in
        staging)
            cp "$TARGETS_DIR/backend.staging.yml" "$ACTIVE_DIR/backend.yml" 2>/dev/null || true
            cp "$TARGETS_DIR/frontend.staging.yml" "$ACTIVE_DIR/frontend.yml" 2>/dev/null || true
            ;;
        production)
            cp "$TARGETS_DIR/backend.production.yml" "$ACTIVE_DIR/backend.yml" 2>/dev/null || true
            cp "$TARGETS_DIR/frontend.production.yml" "$ACTIVE_DIR/frontend.yml" 2>/dev/null || true
            ;;
        *)
            # En dev, on garde les targets par défaut (host.docker.internal)
            rm -f "$ACTIVE_DIR"/*.yml 2>/dev/null || true
            ;;
    esac

    log_success "Targets Prometheus configurés"
}

# Commande Docker Compose
DOCKER_COMPOSE="docker compose $COMPOSE_FILES --env-file $ENV_FILE"

# Exécuter l'action
case $ACTION in
    up)
        log_info "Démarrage de la stack monitoring ($ENVIRONMENT)..."
        log_info "Fichiers compose: $COMPOSE_FILES"
        log_info "Fichier env: $ENV_FILE"

        prepare_alertmanager_config
        setup_prometheus_targets

        # Exporter les variables pour docker-compose
        export ENVIRONMENT
        export ENV_SUFFIX

        $DOCKER_COMPOSE up -d

        log_success "Stack monitoring démarrée!"
        echo ""
        log_info "Accès:"
        if [[ "$USE_TUNNEL" == true && "$ENVIRONMENT" != "development" ]]; then
            echo "  - Grafana:     https://${GRAFANA_PUBLIC_DOMAIN:-monitoring.tumulte.app}"
        else
            echo "  - Grafana:     http://localhost:3001"
            echo "  - Prometheus:  http://localhost:9090"
            echo "  - Alertmanager: http://localhost:9093"
        fi
        ;;
    down)
        log_info "Arrêt de la stack monitoring ($ENVIRONMENT)..."
        $DOCKER_COMPOSE down
        log_success "Stack monitoring arrêtée"
        ;;
    restart)
        log_info "Redémarrage de la stack monitoring ($ENVIRONMENT)..."
        $DOCKER_COMPOSE down
        prepare_alertmanager_config
        setup_prometheus_targets
        export ENVIRONMENT
        export ENV_SUFFIX
        $DOCKER_COMPOSE up -d
        log_success "Stack monitoring redémarrée"
        ;;
    logs)
        $DOCKER_COMPOSE logs -f
        ;;
    status)
        log_info "Statut de la stack monitoring ($ENVIRONMENT):"
        echo ""
        $DOCKER_COMPOSE ps
        ;;
esac
