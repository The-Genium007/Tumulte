# VTT Integration Overview

Tumulte provides integration with Virtual Tabletop (VTT) platforms to display game events in real-time on your streaming overlay.

## Supported VTT Platforms

### Foundry VTT (Supported)

Foundry VTT integration is currently supported through a REST API polling mechanism.

**Status**: Implemented
**Integration Method**: REST API polling with community modules
**Real-time Events**: Dice rolls, critical hits/failures, character updates

### Roll20 (Not Supported)

Roll20 does not provide an external REST or WebSocket API for third-party applications. The Roll20 "API" is an internal sandboxed scripting system that cannot communicate with external services.

**Status**: Not available
**Reason**: No external API provided by Roll20
**Alternative**: Manual trigger mode

### Alchemy RPG (Not Supported)

Alchemy RPG currently offers only file-based character imports (JSON upload) with no REST or WebSocket API for real-time event streaming.

**Status**: Not available
**Reason**: No real-time API available
**Future**: May be supported if Alchemy releases an API

## Architecture

The VTT integration follows a polling-based architecture:

```
┌──────────────────────────────────────────────────────────────┐
│  Foundry VTT + REST API Module                               │
└──────────────────────────────────────────────────────────────┘
                         ↓ HTTP REST API
┌──────────────────────────────────────────────────────────────┐
│  Backend Tumulte (AdonisJS)                                  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  VTT Polling Service (Singleton)                    │    │
│  │  - Active connections tracking                      │    │
│  │  - Periodic polling (every 2 seconds)              │    │
│  │  - Event detection & diffing                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  VTT Adapters (Factory Pattern)                    │    │
│  │  - FoundryAdapter                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Database (PostgreSQL)                              │    │
│  │  - Campaigns, Characters, DiceRolls                 │    │
│  │  - Last poll timestamps (cursor tracking)          │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  WebSocket Service (Transmit)                       │    │
│  │  - Emit dice:critical, dice:hidden                  │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                         ↓ WebSocket
┌──────────────────────────────────────────────────────────────┐
│  Frontend Nuxt + Overlay                                     │
│  - Displays critical hits/failures with ~300-500ms latency  │
└──────────────────────────────────────────────────────────────┘
```

## Features

### Dice Roll Events

- Automatic detection of dice rolls in VTT
- Display roll formula, result, and individual dice values
- Critical success/failure detection
- Hidden/whisper roll handling

### Character Synchronization

- Automatic character import from VTT campaigns
- Character avatar and stats sync
- Support for both Player Characters (PC) and Non-Player Characters (NPC)

### Real-time Broadcasting

- WebSocket-based real-time overlay updates
- Sub-second latency for critical events
- Multi-streamer support (broadcast to all campaign members)

## Latency Considerations

The polling-based architecture introduces some latency:

**Expected Latency Breakdown**:
1. VTT event generation: 10-50ms
2. Foundry module processing: 50-100ms
3. Polling interval: 0-2000ms (average: 1000ms)
4. Backend processing: 100-200ms
5. WebSocket broadcast: 100-200ms
6. Overlay rendering: 16-33ms (60 FPS)

**Total End-to-End Latency**: 300ms - 2.5 seconds (typical: 1-1.5 seconds)

This latency is acceptable for narrative events like critical hits, but not suitable for frame-perfect reactions.

## Manual Trigger Mode

For VTTs without API support (Roll20, Alchemy) or users who prefer simplicity, Tumulte offers a manual trigger mode:

- Click buttons in the GM dashboard to trigger overlay events
- No VTT integration required
- Works with any VTT platform
- Instant response (no polling delay)

## Next Steps

- [Foundry VTT Setup Guide](foundry-module.md) - Install and configure Foundry integration
- [API Reference](api-reference.md) - VTT webhook API documentation
- [Character Assignment](../guides/character-assignment.md) - Assign VTT characters to streamers
