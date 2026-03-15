# Phase 4 Smoke Test Plan — Campaign Aggregate API Routes

## Prerequisites
1. Start MongoDB: `npm run dockerstart`
2. Start dev server: `npm run dev:no-lint`
3. Use a REST client (Postman, Insomnia, curl, or VS Code REST Client)

---

## Test Suite 1: Campaign Root Operations

### 1.1 GET /api/campaign (List campaigns with counts)
```http
GET http://localhost:3000/api/campaign
```
**Expected**:
- Status: 200
- Response includes `sessionCount` and `missionCount` fields
- `missions` and `sessions` arrays are excluded (undefined) for performance

### 1.2 POST /api/campaign (Create campaign)
```http
POST http://localhost:3000/api/campaign
Content-Type: application/json

{
  "name": "Test Campaign",
  "description": "A test campaign for aggregate",
  "status": "Activa"
}
```
**Expected**:
- Status: 201
- Response includes empty `missions: []`, `sessions: []`, `characters: []`, `group: null`
- **Save the campaign ID for subsequent tests**

### 1.3 GET /api/campaign/[id] (Get full aggregate)
```http
GET http://localhost:3000/api/campaign/{campaignId}
```
**Expected**:
- Status: 200
- Response includes full `missions`, `sessions`, `characters`, `group` arrays/object

### 1.4 PUT /api/campaign/[id] (Update campaign root fields)
```http
PUT http://localhost:3000/api/campaign/{campaignId}
Content-Type: application/json

{
  "name": "Updated Campaign Name",
  "description": "Updated description",
  "status": "Activa"
}
```
**Expected**:
- Status: 200
- Root fields updated
- Embedded collections preserved

---

## Test Suite 2: Mission Sub-Resource Operations

### 2.1 POST /api/campaign/[id]/missions (Add mission)
```http
POST http://localhost:3000/api/campaign/{campaignId}/missions
Content-Type: application/json

{
  "name": "Test Mission",
  "description": "A test mission",
  "missionGuide": "Follow the quest markers",
  "missionPriority": "High",
  "status": "Activa"
}
```
**Expected**:
- Status: 201
- Response includes generated `id` (UUID)
- **Save the mission ID for subsequent tests**

### 2.2 GET /api/campaign/[id]/missions (List missions)
```http
GET http://localhost:3000/api/campaign/{campaignId}/missions
```
**Expected**:
- Status: 200
- Array includes the mission created in 2.1

### 2.3 GET /api/campaign/[id]/missions/[missionId] (Get single mission)
```http
GET http://localhost:3000/api/campaign/{campaignId}/missions/{missionId}
```
**Expected**:
- Status: 200
- Returns the specific mission

### 2.4 PUT /api/campaign/[id]/missions/[missionId] (Update mission)
```http
PUT http://localhost:3000/api/campaign/{campaignId}/missions/{missionId}
Content-Type: application/json

{
  "name": "Updated Mission Name",
  "description": "Updated description",
  "missionGuide": "Follow the quest markers",
  "missionPriority": "Medium",
  "status": "Pausada"
}
```
**Expected**:
- Status: 200
- Mission fields updated

### 2.5 DELETE /api/campaign/[id]/missions/[missionId] (Remove mission)
```http
DELETE http://localhost:3000/api/campaign/{campaignId}/missions/{missionId}
```
**Expected**:
- Status: 200
- Message: "Misión eliminada exitosamente"

---

## Test Suite 3: Session Sub-Resource Operations

### 3.1 POST /api/campaign/[id]/sessions (Add session)
```http
POST http://localhost:3000/api/campaign/{campaignId}/sessions
Content-Type: application/json

{
  "title": "Session 1: The Beginning",
  "notes": "The party met in a tavern",
  "date": "2026-03-15T18:00:00Z"
}
```
**Expected**:
- Status: 201
- Response includes auto-generated `id` (UUID) and `sessionNumber: 1`
- **Save the session ID for subsequent tests**

### 3.2 GET /api/campaign/[id]/sessions (List sessions)
```http
GET http://localhost:3000/api/campaign/{campaignId}/sessions
```
**Expected**:
- Status: 200
- Array includes the session created in 3.1

### 3.3 GET /api/campaign/[id]/sessions/[sessionId] (Get single session)
```http
GET http://localhost:3000/api/campaign/{campaignId}/sessions/{sessionId}
```
**Expected**:
- Status: 200
- Returns the specific session

### 3.4 PUT /api/campaign/[id]/sessions/[sessionId] (Update session)
```http
PUT http://localhost:3000/api/campaign/{campaignId}/sessions/{sessionId}
Content-Type: application/json

{
  "title": "Session 1: Updated Title",
  "notes": "Updated notes",
  "date": "2026-03-15T18:00:00Z"
}
```
**Expected**:
- Status: 200
- Session updated, `sessionNumber` preserved

### 3.5 DELETE /api/campaign/[id]/sessions/[sessionId] (Remove session)
```http
DELETE http://localhost:3000/api/campaign/{campaignId}/sessions/{sessionId}
```
**Expected**:
- Status: 200
- Message: "Sesión eliminada exitosamente"

---

## Test Suite 4: Character Sub-Resource Operations

### 4.1 Create a test character (prerequisite)
```http
POST http://localhost:3000/api/character
Content-Type: application/json

{
  "name": "Aragorn",
  "classType": "Ranger",
  "level": 5,
  "race": "Human",
  "playerName": "Player 1",
  "type": "PC"
}
```
**Save the character ID**

### 4.2 POST /api/campaign/[id]/characters (Assign character)
```http
POST http://localhost:3000/api/campaign/{campaignId}/characters
Content-Type: application/json

{
  "characterId": "{characterId}"
}
```
**Expected**:
- Status: 201
- Response includes CharacterRef snapshot (id, name, classType, level)

### 4.3 GET /api/campaign/[id]/characters (List characters)
```http
GET http://localhost:3000/api/campaign/{campaignId}/characters
```
**Expected**:
- Status: 200
- Array includes the character assigned in 4.2

### 4.4 DELETE /api/campaign/[id]/characters/[characterId] (Remove character)
```http
DELETE http://localhost:3000/api/campaign/{campaignId}/characters/{characterId}
```
**Expected**:
- Status: 200
- Message: "Personaje removido exitosamente"

---

## Test Suite 5: Group Sub-Resource Operations

### 5.1 Create a test group (prerequisite)
```http
POST http://localhost:3000/api/group
Content-Type: application/json

{
  "name": "The Fellowship",
  "description": "A group of adventurers",
  "members": []
}
```
**Save the group ID**

### 5.2 PUT /api/campaign/[id]/group (Assign group)
```http
PUT http://localhost:3000/api/campaign/{campaignId}/group
Content-Type: application/json

{
  "groupId": "{groupId}"
}
```
**Expected**:
- Status: 200
- Response includes GroupSnapshot (id, name, members, description, snapshotAt)

### 5.3 GET /api/campaign/[id]/group (Get group)
```http
GET http://localhost:3000/api/campaign/{campaignId}/group
```
**Expected**:
- Status: 200
- Returns the group snapshot

### 5.4 DELETE /api/campaign/[id]/group (Remove group)
```http
DELETE http://localhost:3000/api/campaign/{campaignId}/group
```
**Expected**:
- Status: 200
- Message: "Grupo removido exitosamente"

### 5.5 GET /api/campaign/[id]/group (Verify no group)
```http
GET http://localhost:3000/api/campaign/{campaignId}/group
```
**Expected**:
- Status: 404
- Error: "No hay grupo asignado a esta campaña"

---

## Test Suite 6: Deprecated Endpoints (410 Gone)

### 6.1 GET /api/mission (Deprecated)
```http
GET http://localhost:3000/api/mission
```
**Expected**:
- Status: 410
- Error message indicates endpoint moved to `/api/campaign/{campaignId}/missions`

### 6.2 POST /api/mission (Deprecated)
```http
POST http://localhost:3000/api/mission
Content-Type: application/json

{ "name": "Test" }
```
**Expected**:
- Status: 410

### 6.3 GET /api/mission/[id] (Deprecated)
```http
GET http://localhost:3000/api/mission/123
```
**Expected**:
- Status: 410

### 6.4 PUT /api/mission/[id] (Deprecated)
```http
PUT http://localhost:3000/api/mission/123
```
**Expected**:
- Status: 410

### 6.5 DELETE /api/mission/[id] (Deprecated)
```http
DELETE http://localhost:3000/api/mission/123
```
**Expected**:
- Status: 410

### 6.6 GET /api/session (Deprecated)
```http
GET http://localhost:3000/api/session
```
**Expected**:
- Status: 410
- Error message indicates endpoint moved to `/api/campaign/{campaignId}/sessions`

### 6.7 POST /api/session (Deprecated)
```http
POST http://localhost:3000/api/session
Content-Type: application/json

{ "title": "Test" }
```
**Expected**:
- Status: 410

### 6.8 GET /api/session/[id] (Deprecated)
```http
GET http://localhost:3000/api/session/123
```
**Expected**:
- Status: 410

### 6.9 PUT /api/session/[id] (Deprecated)
```http
PUT http://localhost:3000/api/session/123
```
**Expected**:
- Status: 410

### 6.10 DELETE /api/session/[id] (Deprecated)
```http
DELETE http://localhost:3000/api/session/123
```
**Expected**:
- Status: 410

---

## Test Suite 7: Dashboard API

### 7.1 GET /api/dashboard/stats
```http
GET http://localhost:3000/api/dashboard/stats
```
**Expected**:
- Status: 200
- Response includes: `totalCampaigns`, `activeCampaigns`, `totalGroups`, `totalPlayers`, `nextSessionAt`
- Note: `totalMissions` and `totalSessions` NOT included (TODO in FR-14)

---

## Notes

- All tests assume REPOSITORY_TYPE is not set to "memory" (i.e., using MongoDB)
- Clean up test data after testing by deleting the test campaign
- If any test fails, check server logs for detailed error messages
- Expected error responses have `{ error: "message" }` format
