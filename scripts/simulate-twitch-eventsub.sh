#!/bin/bash
set -euo pipefail

# ==============================================================================
# simulate-twitch-eventsub.sh
# Simule des redemptions Channel Points via des requêtes HTTP signées HMAC
# envoyées directement au endpoint /webhooks/twitch/eventsub
#
# Usage:
#   ./scripts/simulate-twitch-eventsub.sh \
#     --reward-id <TWITCH_REWARD_ID> \
#     --broadcaster-id <TWITCH_USER_ID> \
#     [--count 10] [--delay 0.5] [--cost 50]
# ==============================================================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valeurs par défaut
BACKEND_URL="http://localhost:3333"
SECRET=""
REWARD_ID=""
BROADCASTER_ID=""
COUNT=1
DELAY=0.5
COST=50

usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Simule des redemptions Channel Points Twitch via le webhook EventSub."
  echo ""
  echo "Options requises:"
  echo "  --reward-id <ID>         Twitch Reward ID (doit matcher StreamerGamificationConfig.twitchRewardId)"
  echo "  --broadcaster-id <ID>    Twitch broadcaster user ID (doit matcher Streamer.twitchUserId)"
  echo ""
  echo "Options:"
  echo "  --secret <SECRET>        TWITCH_EVENTSUB_SECRET (par défaut: lu depuis backend/.env)"
  echo "  --url <URL>              URL du backend (par défaut: http://localhost:3333)"
  echo "  --count <N>              Nombre de redemptions à envoyer (par défaut: 1)"
  echo "  --delay <seconds>        Délai entre les redemptions (par défaut: 0.5)"
  echo "  --cost <N>               Coût en Channel Points (par défaut: 50)"
  echo "  --help                   Afficher cette aide"
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --reward-id)    REWARD_ID="$2"; shift 2 ;;
    --broadcaster-id) BROADCASTER_ID="$2"; shift 2 ;;
    --secret)       SECRET="$2"; shift 2 ;;
    --url)          BACKEND_URL="$2"; shift 2 ;;
    --count)        COUNT="$2"; shift 2 ;;
    --delay)        DELAY="$2"; shift 2 ;;
    --cost)         COST="$2"; shift 2 ;;
    --help)         usage ;;
    *)              echo -e "${RED}Option inconnue: $1${NC}"; usage ;;
  esac
done

# Validation des arguments requis
if [ -z "$REWARD_ID" ]; then
  echo -e "${RED}Erreur: --reward-id est requis${NC}"
  echo "Récupérez-le depuis la DB: SELECT twitch_reward_id FROM streamer_gamification_configs WHERE is_enabled = true;"
  exit 1
fi

if [ -z "$BROADCASTER_ID" ]; then
  echo -e "${RED}Erreur: --broadcaster-id est requis${NC}"
  echo "Récupérez-le depuis la DB: SELECT twitch_user_id FROM streamers;"
  exit 1
fi

# Lecture auto du secret depuis backend/.env
if [ -z "$SECRET" ]; then
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  ENV_FILE="${SCRIPT_DIR}/../backend/.env"
  if [ -f "$ENV_FILE" ]; then
    SECRET=$(grep -E '^TWITCH_EVENTSUB_SECRET=' "$ENV_FILE" | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
  fi
  if [ -z "$SECRET" ]; then
    echo -e "${RED}Erreur: TWITCH_EVENTSUB_SECRET non trouvé.${NC}"
    echo "Passez --secret ou ajoutez TWITCH_EVENTSUB_SECRET dans backend/.env"
    exit 1
  fi
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Simulation EventSub - Channel Points Redemption${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  URL:            ${BACKEND_URL}"
echo -e "  Reward ID:      ${REWARD_ID}"
echo -e "  Broadcaster ID: ${BROADCASTER_ID}"
echo -e "  Count:          ${COUNT}"
echo -e "  Delay:          ${DELAY}s"
echo -e "  Cost:           ${COST} pts"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

send_redemption() {
  local idx=$1

  # Générer des IDs uniques
  local message_id
  message_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local redemption_id
  redemption_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
  local subscription_id
  subscription_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
  local user_id=$((RANDOM * RANDOM + 100000000))
  local user_name="test_viewer_${idx}"

  # Construire le payload JSON
  local body
  body=$(cat <<PAYLOAD
{"subscription":{"id":"${subscription_id}","type":"channel.channel_points_custom_reward_redemption.add","version":"1","status":"enabled","condition":{"broadcaster_user_id":"${BROADCASTER_ID}"},"transport":{"method":"webhook","callback":"${BACKEND_URL}/webhooks/twitch/eventsub"},"created_at":"${timestamp}"},"event":{"id":"${redemption_id}","broadcaster_user_id":"${BROADCASTER_ID}","broadcaster_user_login":"test_broadcaster","broadcaster_user_name":"Test_Broadcaster","user_id":"${user_id}","user_login":"${user_name}","user_name":"${user_name}","user_input":"","status":"unfulfilled","reward":{"id":"${REWARD_ID}","title":"Gamification Test","cost":${COST},"prompt":""},"redeemed_at":"${timestamp}"}}
PAYLOAD
)

  # Calculer la signature HMAC-SHA256
  # message = messageId + timestamp + body (concaténés sans séparateur)
  local message="${message_id}${timestamp}${body}"
  local signature
  signature="sha256=$(printf '%s' "${message}" | openssl dgst -sha256 -hmac "${SECRET}" -hex 2>/dev/null | sed 's/^.* //')"

  # Envoyer la requête
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${BACKEND_URL}/webhooks/twitch/eventsub" \
    -H "Content-Type: application/json" \
    -H "Twitch-Eventsub-Message-Id: ${message_id}" \
    -H "Twitch-Eventsub-Message-Timestamp: ${timestamp}" \
    -H "Twitch-Eventsub-Message-Signature: ${signature}" \
    -H "Twitch-Eventsub-Message-Type: notification" \
    -d "${body}")

  if [ "${http_code}" = "200" ]; then
    echo -e "  [${idx}/${COUNT}] ${GREEN}OK${NC} (200) - ${user_name} - redemption: ${redemption_id:0:8}..."
  else
    echo -e "  [${idx}/${COUNT}] ${RED}FAIL${NC} (${http_code}) - ${user_name} - redemption: ${redemption_id:0:8}..."
  fi
}

# Boucle d'envoi
for i in $(seq 1 "$COUNT"); do
  send_redemption "$i"

  # Délai entre les envois (sauf le dernier)
  if [ "$i" -lt "$COUNT" ]; then
    sleep "$DELAY"
  fi
done

echo ""
echo -e "${GREEN}Simulation terminée: ${COUNT} redemption(s) envoyée(s)${NC}"
