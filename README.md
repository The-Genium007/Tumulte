# 🎲 Tumulte

**Multi-stream polling system for tabletop RPG sessions on Twitch**

Tumulte allows Game Masters (GMs) to launch synchronized Twitch polls across multiple streamers' channels during tabletop RPG sessions. Players vote on their favorite streamer's chat, and results are aggregated in real-time with a transparent OBS overlay.

> ⚠️ **Note**: This is an experimental project built for fun and community feedback. It's not intended for large-scale production deployment, but feel free to use it, fork it, and share your improvements!

---

## ✨ Features

### For Game Masters
- Launch synchronized polls across all connected streamers
- Real-time vote aggregation from all channels
- Campaign management with streamer invitations
- Session-based poll templates

### For Streamers
- One-click Twitch OAuth authentication
- Automatic poll creation on their channel
- Custom OBS overlay URL (transparent background)
- Compatibility check (Twitch Affiliate/Partner required)

### OBS Overlay
- Transparent background for seamless integration
- Real-time vote updates via WebSocket
- Progress bars and countdown timer
- Auto-show/hide on poll start/end

---

## 🛠️ Tech Stack

- **Backend**: AdonisJS v6 (REST API + WebSocket)
- **Frontend**: Vue.js 3 + Vite + Nuxt UI 4
- **Database**: PostgreSQL 16
- **Deployment**: Docker Compose (Dokploy compatible)

---

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- Docker & Docker Compose
- Twitch Developer Application ([Create one here](https://dev.twitch.tv/console/apps))

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/tumulte.git
cd tumulte

# Start PostgreSQL
docker-compose up -d

# Backend setup
cd backend
cp .env.example .env
npm install
node ace generate:key
node ace migration:run
npm run dev

# Frontend setup (in another terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 2. Configure Twitch OAuth

Create a Twitch application and add to `backend/.env`:

```env
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=http://localhost:3333/auth/twitch/callback
MJ_TWITCH_IDS=your_twitch_user_id
```

Find your Twitch User ID: https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/

### 3. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333

---

## 📦 Deployment with Dokploy

The project includes a Docker Compose configuration compatible with [Dokploy](https://docs.dokploy.com) and Cloudflare Tunnel for secure external access.

### Docker Compose Structure

```yaml
services:
  backend:     # AdonisJS API + WebSocket
  frontend:    # Vue.js Dashboard
  postgres:    # PostgreSQL Database
  cloudflared: # Cloudflare Tunnel (optional)

networks:
  dokploy-network:  # Required for Dokploy
  internal:         # Internal services communication
```

### Cloudflare Tunnel Setup

1. Create a Cloudflare Tunnel: https://one.dash.cloudflare.com/
2. Get your tunnel token
3. Add to your environment:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=your_token_here
   ```
4. Set SSL/TLS mode to "Full" or "Full (Strict)" in Cloudflare dashboard

The tunnel secures external connections while services communicate internally via `dokploy-network`.

**Resources**:
- [Dokploy Docker Compose Guide](https://docs.dokploy.com/docs/core/docker-compose)
- [Cloudflare Tunnel Documentation](https://docs.dokploy.com/docs/core/domains/cloudflare)
- [Dokploy Networking Best Practices](https://torchtree.com/en/post/dokploy-container-network-issue/)

---

## 🎯 How It Works

1. **GM creates a campaign** and invites streamers via their Twitch username
2. **Streamers accept** the invitation and authorize poll creation on their channel
3. **GM launches a poll** during the RPG session
4. **Twitch polls are created** simultaneously on all streamers' channels
5. **Votes are aggregated** in real-time and displayed on each overlay
6. **Results are shown** when the poll ends

> **Important**: Only Twitch Affiliates and Partners can use the polling feature due to Twitch API restrictions.

---

## 📁 Project Structure

```
tumulte/
├── backend/              # AdonisJS API
│   ├── app/
│   │   ├── controllers/  # HTTP & WebSocket controllers
│   │   ├── models/       # Database models (Lucid ORM)
│   │   └── services/     # Business logic
│   └── database/
│       └── migrations/   # Database schema
│
├── frontend/             # Vue.js Dashboard
│   ├── pages/           # MJ Dashboard, Streamer Dashboard, Overlay
│   ├── components/      # Reusable components
│   └── composables/     # Shared logic (useAuth, useCampaigns, etc.)
│
└── docker-compose.yml   # Multi-service configuration
```

---

## 🐛 Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### OAuth Redirect Errors

- Verify `TWITCH_REDIRECT_URI` matches exactly in Twitch Console and `.env`
- Ensure Twitch app has `channel:manage:polls` and `channel:read:polls` scopes

### Streamer Not Compatible

- Only Twitch Affiliates and Partners can create polls
- Check streamer status on their [Dashboard Settings](https://dashboard.twitch.tv/settings/affiliate)

---

## 🤝 Contributing

This is a personal project shared for educational purposes and community feedback. Feel free to:

- 🐛 Report bugs via [GitHub Issues](https://github.com/yourusername/tumulte/issues)
- 💡 Suggest features or improvements
- 🔧 Submit pull requests

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Built with [AdonisJS](https://adonisjs.com/), [Vue.js](https://vuejs.org/), and [Nuxt UI](https://ui.nuxt.com/)
- Powered by [Twitch API](https://dev.twitch.tv/docs/api/)
- Deployment tools: [Dokploy](https://dokploy.com/), [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)
