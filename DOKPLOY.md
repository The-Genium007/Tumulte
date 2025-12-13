# Deploying Tumulte on Dokploy

This guide explains how to deploy Tumulte on [Dokploy](https://dokploy.com/) with Cloudflare Tunnel for secure external access.

## Prerequisites

- A Dokploy instance running
- A Cloudflare account (if using Cloudflare Tunnel)
- Twitch Developer Application configured

## Deployment Steps

### 1. Create Project in Dokploy

1. Log in to your Dokploy dashboard
2. Click **"Create Project"**
3. Select **"Docker Compose"**
4. Name your project: `tumulte`

### 2. Configure Repository

1. Connect your Git repository
2. Select the branch to deploy (e.g., `main`)
3. Dokploy will automatically detect the `docker-compose.yml`

### 3. Configure Environment Variables

In Dokploy, add the following environment variables:

#### Required Variables

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=twitch_polls

# Backend
APP_KEY=your_generated_app_key
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_REDIRECT_URI=https://api.yourdomain.com/auth/twitch/callback
MJ_TWITCH_IDS=your_twitch_user_id

# Frontend URLs (Production)
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

#### Optional: Cloudflare Tunnel

```env
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token
COMPOSE_PROFILES=cloudflare
```

### 4. Configure Domains

Dokploy uses Traefik for automatic SSL and routing.

#### Frontend Domain
1. Go to **Domains** tab
2. Click **Create Domain**
3. Add: `yourdomain.com`
4. Select service: `frontend`
5. Enable **HTTPS**

#### Backend Domain
1. Click **Create Domain** again
2. Add: `api.yourdomain.com`
3. Select service: `backend`
4. Enable **HTTPS**
5. Enable **WebSocket** support

### 5. Cloudflare Tunnel Setup (Optional)

If using Cloudflare Tunnel for additional security:

1. Create a Cloudflare Tunnel:
   - Go to https://one.dash.cloudflare.com/
   - Navigate to **Access** → **Tunnels**
   - Click **Create a tunnel**
   - Name it: `tumulte`
   - Copy the tunnel token

2. Add the token to Dokploy environment variables:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=your_token_here
   COMPOSE_PROFILES=cloudflare
   ```

3. Configure tunnel routes:
   - Public hostname: `yourdomain.com`
   - Service: `http://frontend:80`
   - Add another route:
     - Public hostname: `api.yourdomain.com`
     - Service: `http://backend:3333`

4. Set SSL/TLS mode in Cloudflare:
   - Go to **SSL/TLS** in Cloudflare dashboard
   - Set to **Full** or **Full (Strict)**

### 6. Deploy

1. Click **Deploy** in Dokploy
2. Monitor the deployment logs
3. Wait for all services to be healthy

### 7. Run Database Migrations

After first deployment, run migrations:

1. Go to Dokploy **Terminal** tab
2. Select the `backend` service
3. Run:
   ```bash
   node ace migration:run
   ```

### 8. Verify Deployment

1. Visit `https://yourdomain.com`
2. Test login with Twitch
3. Check WebSocket connection in browser console
4. Create a test campaign

## Network Configuration

Tumulte uses two networks:

- **dokploy-network**: External network managed by Dokploy (for Traefik routing)
- **internal**: Internal network for service-to-service communication

Services communicate internally using service names:
- Frontend → Backend: `http://backend:3333`
- Backend → Database: `postgres:5432`

## Troubleshooting

### Services Can't Communicate

**Solution**: Ensure all services are on the `dokploy-network`:
```yaml
networks:
  - dokploy-network
  - internal
```

### WebSocket Connection Failed

**Solution**: Enable WebSocket in domain settings:
1. Edit backend domain in Dokploy
2. Check **Enable WebSocket**
3. Redeploy

### Database Connection Error

**Solution**:
1. Check `DB_HOST` is set to `postgres` (service name)
2. Verify database credentials in environment variables
3. Check PostgreSQL container is healthy

### Cloudflare SSL Error

**Solution**:
1. Set SSL/TLS mode to **Full** or **Full (Strict)**
2. Ensure tunnel is running (`cloudflared` service)
3. Verify tunnel routes in Cloudflare dashboard

## Monitoring

### View Logs

In Dokploy dashboard:
1. Go to **Logs** tab
2. Select service: `backend`, `frontend`, or `postgres`
3. Monitor real-time logs

### Check Service Health

All services have health checks configured:
- Backend: `http://backend:3333/health`
- Frontend: `http://frontend:80/health`
- PostgreSQL: `pg_isready`

## Scaling

To scale services in Dokploy:

1. Backend can be scaled horizontally (multiple instances)
2. PostgreSQL uses a persistent volume (single instance)
3. Frontend is stateless (can scale)

## Backup

### Database Backup

```bash
# Connect to Dokploy terminal
docker exec tumulte-postgres pg_dump -U postgres twitch_polls > backup.sql
```

### Restore Database

```bash
# Connect to Dokploy terminal
docker exec -i tumulte-postgres psql -U postgres twitch_polls < backup.sql
```

## Updates

To update Tumulte:

1. Push changes to your Git repository
2. In Dokploy, go to **Deployments**
3. Click **Redeploy**
4. Dokploy will pull latest changes and rebuild

## Support

- [Dokploy Documentation](https://docs.dokploy.com)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Tumulte GitHub Issues](https://github.com/yourusername/tumulte/issues)

---

**Pro Tip**: Use Dokploy's Preview feature to test the compose configuration before deploying!
