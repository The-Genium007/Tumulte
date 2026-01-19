# Foundry VTT Integration Guide

This guide explains how to integrate Foundry VTT with Tumulte for real-time dice roll overlays.

## Prerequisites

- Foundry VTT v12 or higher (self-hosted instance)
- Foundry instance accessible via network (local network or internet)
- Admin access to your Foundry VTT server
- Active Tumulte account with GM role

## Installation Steps

### 1. Install the Foundry REST API Module

Tumulte uses a community module to communicate with Foundry VTT.

**Recommended Module**: [Foundry REST API by ThreeHats](https://github.com/ThreeHats/foundryvtt-rest-api)

1. Open your Foundry VTT instance
2. Navigate to **Setup** → **Add-on Modules**
3. Click **Install Module**
4. Search for "Foundry REST API"
5. Click **Install**

### 2. Configure the REST API Module

1. Launch a game world
2. Go to **Settings** → **Module Settings**
3. Find "Foundry REST API" in the list
4. Click **Configure**
5. **Generate an API Key** (save this securely)
6. Enable the module features:
   - ✅ Enable REST API
   - ✅ Allow chat message access
   - ✅ Allow actor (character) access
7. Click **Save Changes**

### 3. Note Your Foundry Endpoint

Your Foundry API endpoint is the base URL of your Foundry instance:

- **Local Network**: `http://192.168.1.100:30000` (replace with your IP)
- **Internet**: `https://foundry.example.com` (if you have a domain)
- **Port**: Default is 30000 (check your Foundry configuration)

**Important**: For internet access, you may need to:
- Configure port forwarding on your router
- Set up a reverse proxy (nginx/Caddy)
- Use HTTPS for secure connections

### 4. Create VTT Connection in Tumulte

1. Log into Tumulte as a GM
2. Navigate to **Settings** → **VTT Integration**
3. Click **Add VTT Connection**
4. Fill in the form:
   - **Provider**: Select "Foundry VTT"
   - **Connection Name**: e.g., "My Foundry Server"
   - **API Endpoint**: Your Foundry URL (e.g., `http://192.168.1.100:30000`)
   - **API Key**: Paste the API key from step 2
5. Click **Test Connection** to verify
6. Click **Create Connection**

### 5. Import Campaign from Foundry

1. In Tumulte, go to **Campaigns**
2. Click **Create Campaign**
3. Select **Import from VTT**
4. Choose your Foundry connection
5. Select the Foundry world you want to import
6. Click **Import**

Tumulte will:
- Create a campaign linked to your Foundry world
- Import all characters (PCs and NPCs)
- Start polling for dice roll events

### 6. Assign Characters to Streamers

1. Open the campaign in Tumulte
2. Go to **Campaign Settings** → **Characters**
3. For each character, select the streamer who plays them
4. Click **Save Assignments**

This ensures dice rolls appear on the correct streamer's overlay.

## Testing the Integration

### Quick Test

1. In Tumulte, open your campaign dashboard
2. In Foundry VTT, roll a d20 with any character
3. Within 1-2 seconds, the roll should appear in the Tumulte dashboard
4. The roll should also trigger the overlay (if configured)

### Test Critical Hits

1. Roll a natural 20 on a d20
2. Verify the event is marked as "Critical Success" in Tumulte
3. Check that the overlay shows the critical hit animation

### Test Hidden Rolls

1. In Foundry, whisper a roll to the GM (`/w gm 1d20`)
2. Verify the roll is marked as "Hidden" in Tumulte
3. The overlay should respect the hidden status

## Troubleshooting

### Connection Failed

**Error**: "Cannot connect to Foundry VTT"

**Solutions**:
1. Verify Foundry is running and accessible
2. Check the API endpoint URL (no trailing slash)
3. Verify the API key is correct
4. Test the endpoint in your browser: `http://your-foundry-url/api/status`
5. Check firewall settings (port 30000 must be open)

### Invalid API Key

**Error**: "403 Forbidden - Invalid API Key"

**Solutions**:
1. Regenerate the API key in Foundry module settings
2. Update the key in Tumulte VTT connection settings
3. Ensure no extra spaces before/after the key

### Dice Rolls Not Appearing

**Error**: Rolls in Foundry don't show in Tumulte

**Solutions**:
1. Verify polling is enabled (check connection status in Tumulte)
2. Check the campaign is linked to the correct Foundry world
3. Ensure characters are assigned to streamers
4. Review backend logs for polling errors
5. Verify the REST API module is active in the game world

### Latency Too High

**Issue**: Rolls take >3 seconds to appear

**Solutions**:
1. Reduce polling interval in VTT connection settings (default: 2 seconds)
2. Check network latency between Tumulte server and Foundry
3. If using internet connection, consider hosting Tumulte closer to Foundry
4. Verify Redis is running (Transmit uses Redis for WebSocket pub/sub)

### Module Compatibility

**Error**: "Foundry module version not supported"

**Solutions**:
1. Update Foundry VTT to v12 or higher
2. Update the REST API module to v2.0 or higher
3. Check Tumulte version pinning policy (supports Foundry v12+)

## Advanced Configuration

### Custom Polling Interval

By default, Tumulte polls Foundry every 2 seconds. You can adjust this:

1. Go to **VTT Connection Settings**
2. Find **Polling Interval** (in seconds)
3. Lower values = faster updates, but more server load
4. Recommended: 1-3 seconds

### Self-Hosted WebSocket Relay

For advanced users who want to remove the dependency on third-party relay servers:

1. Clone the Tumulte repository
2. Use the provided Docker Compose file to host your own relay
3. Update the Foundry module configuration to point to your relay
4. Update Tumulte connection settings with the new relay URL

See [Self-Hosted Relay Guide](../guides/self-hosted-relay.md) for details.

## Security Considerations

### API Key Storage

- API keys are encrypted in the Tumulte database
- Never share your API key publicly
- Rotate keys regularly (every 3-6 months)

### Network Security

- Use HTTPS for internet-exposed Foundry instances
- Consider VPN for local network access
- Implement firewall rules to restrict API access

### Access Control

- Only grant API access to trusted applications
- Review Foundry REST API module permissions
- Disable unused API endpoints in module settings

## Next Steps

- [Character Assignment Guide](../guides/character-assignment.md)
- [Overlay Customization](../overlay-studio/customization.md)
- [VTT API Reference](api-reference.md)
