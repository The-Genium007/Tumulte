# VTT Webhook API Reference

This document describes the webhook API endpoints used for VTT integration.

## Authentication

All VTT webhook endpoints require API key authentication.

**Header**:
```http
Authorization: Bearer {api_key}
```

The API key is generated when you create a VTT connection in Tumulte and must be configured in your VTT module.

## Endpoints

### POST /webhooks/vtt/test

Test the VTT connection.

#### Request

**Headers**:
| Header | Value |
|--------|-------|
| Authorization | Bearer {api_key} |

**Body**: None

#### Response

**Success** `200 OK`:
```json
{
  "success": true,
  "message": "Connection test successful",
  "connection": {
    "id": "uuid-here",
    "name": "My Foundry Connection",
    "provider": "Foundry VTT",
    "status": "active"
  }
}
```

**Error** `401 Unauthorized`:
```json
{
  "error": "Invalid API Key"
}
```

---

### POST /webhooks/vtt/dice-roll

Record a dice roll event from a VTT.

#### Request

**Headers**:
| Header | Value |
|--------|-------|
| Content-Type | application/json |
| Authorization | Bearer {api_key} |

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| campaignId | string | Yes | VTT campaign identifier (world ID) |
| characterId | string | Yes | Character identifier in VTT |
| characterName | string | Yes | Display name of character |
| rollId | string | Yes | Unique roll identifier |
| rollFormula | string | Yes | Dice formula (e.g., "1d20+5") |
| result | number | Yes | Final roll result |
| diceResults | number[] | Yes | Individual dice roll values |
| isCritical | boolean | No | Whether this is a critical hit/failure |
| criticalType | string | No | "success" or "failure" (if critical) |
| isHidden | boolean | No | Whether roll is hidden/whispered |
| rollType | string | No | Type of roll (attack, save, skill, etc.) |
| metadata | object | No | Additional VTT-specific data |

#### Example Request

**Normal Roll**:
```json
{
  "campaignId": "foundry-world-123",
  "characterId": "char-456",
  "characterName": "Gimli",
  "rollId": "roll-789",
  "rollFormula": "1d20+5",
  "result": 18,
  "diceResults": [13, 5],
  "isCritical": false,
  "criticalType": null,
  "isHidden": false,
  "rollType": "attack",
  "metadata": {
    "foundryMessageId": "msg-abc",
    "timestamp": 1704067200000
  }
}
```

**Critical Success**:
```json
{
  "campaignId": "foundry-world-123",
  "characterId": "char-456",
  "characterName": "Gimli",
  "rollId": "roll-crit-success",
  "rollFormula": "1d20+5",
  "result": 25,
  "diceResults": [20, 5],
  "isCritical": true,
  "criticalType": "success",
  "isHidden": false,
  "rollType": "attack",
  "metadata": {
    "flavor": "Longsword Attack"
  }
}
```

**Critical Failure**:
```json
{
  "campaignId": "foundry-world-123",
  "characterId": "char-789",
  "characterName": "Legolas",
  "rollId": "roll-crit-failure",
  "rollFormula": "1d20+3",
  "result": 4,
  "diceResults": [1, 3],
  "isCritical": true,
  "criticalType": "failure",
  "isHidden": false,
  "rollType": "save",
  "metadata": {
    "flavor": "Dexterity Saving Throw"
  }
}
```

**Hidden Roll (Whisper)**:
```json
{
  "campaignId": "foundry-world-123",
  "characterId": "npc-001",
  "characterName": "Goblin Boss",
  "rollId": "roll-hidden",
  "rollFormula": "1d20+2",
  "result": 15,
  "diceResults": [13, 2],
  "isCritical": false,
  "criticalType": null,
  "isHidden": true,
  "rollType": "stealth",
  "metadata": {
    "flavor": "Stealth Check (Hidden)"
  }
}
```

#### Response

**Success** `200 OK`:
```json
{
  "success": true,
  "rollId": "uuid-of-recorded-roll",
  "message": "Dice roll recorded successfully"
}
```

**Error** `400 Bad Request`:
```json
{
  "error": "Validation failed",
  "details": {
    "rollFormula": ["Roll formula is required"]
  }
}
```

**Error** `404 Not Found`:
```json
{
  "error": "Campaign not found",
  "message": "No campaign found for VTT campaign ID: foundry-world-123"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request body or missing required fields |
| 401 | Invalid or missing API key |
| 404 | Campaign or character not found |
| 422 | Validation error (details in response) |
| 500 | Internal server error |

## Event Broadcasting

When a dice roll is successfully recorded, Tumulte broadcasts the event via WebSocket to:

1. **Campaign channel**: `campaign/{campaignId}/dice-rolls`
   - All connected clients watching this campaign

2. **Streamer channels**: `streamer/{streamerId}/dice-rolls`
   - Each streamer assigned to a character in the campaign

### WebSocket Event Format

```json
{
  "type": "dice:roll",
  "data": {
    "id": "roll-uuid",
    "characterName": "Gimli",
    "rollFormula": "1d20+5",
    "result": 18,
    "isCritical": false,
    "isHidden": false,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Critical Hit Event**:
```json
{
  "type": "dice:critical",
  "data": {
    "id": "roll-uuid",
    "characterName": "Gimli",
    "rollFormula": "1d20+5",
    "result": 25,
    "criticalType": "success",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limiting

VTT webhook endpoints have rate limits to prevent abuse:

- **Test endpoint**: 60 requests per minute
- **Dice roll endpoint**: 120 requests per minute (2 per second)

If you exceed the rate limit, you'll receive:

**Error** `429 Too Many Requests`:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

## Testing with cURL

### Test Connection

```bash
curl -X POST http://localhost:3333/webhooks/vtt/test \
  -H "Authorization: Bearer ta_your_api_key_here"
```

### Send Dice Roll

```bash
curl -X POST http://localhost:3333/webhooks/vtt/dice-roll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ta_your_api_key_here" \
  -d '{
    "campaignId": "foundry-world-123",
    "characterId": "char-456",
    "characterName": "Gimli",
    "rollId": "test-roll-1",
    "rollFormula": "1d20+5",
    "result": 18,
    "diceResults": [13, 5],
    "isCritical": false,
    "isHidden": false,
    "rollType": "attack"
  }'
```

## Next Steps

- [Foundry VTT Setup Guide](foundry-module.md)
- [Character Assignment](../guides/character-assignment.md)
- [WebSocket Integration](../architecture/backend.md#websocket)
