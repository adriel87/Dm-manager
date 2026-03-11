# Delta Spec: Dashboard Domain

## Status
Part of: dashboard-homepage change

## Overview
This spec defines the new Dashboard domain for the homepage feature. The Dashboard aggregates data from Character, Campaign, and Group domains to provide a unified view for Dungeon Masters.

## New Requirements

### ADDED: Dashboard Stats

**REQ-DASH-001**: The dashboard SHALL provide a stats block displaying:
- Total campaigns count
- Active campaigns count (status = 'Activa')
- Total groups count
- Total human players count (characters that are not NPCs with playerName)
- Next session date (earliest upcoming session across all active campaigns)

**Scenario: Displaying all stats with data**
- **GIVEN** the database contains campaigns, groups, and characters
- **WHEN** the dashboard stats are requested
- **THEN** all five stat values SHALL be displayed

**Scenario: Displaying stats with empty database**
- **GIVEN** the database is empty (no campaigns, groups, or characters)
- **WHEN** the dashboard stats are requested
- **THEN** all stat values SHALL be zero or null as appropriate

**Scenario: Finding next session with multiple active campaigns**
- **GIVEN** three active campaigns exist with nextSessionAt dates of tomorrow, next week, and next month
- **WHEN** the dashboard calculates the next session date
- **THEN** the result SHALL be tomorrow's date (earliest)

**Scenario: No active campaigns**
- **GIVEN** no campaigns exist with status 'Activa'
- **WHEN** the dashboard calculates active campaigns count
- **THEN** the count SHALL be zero and next session SHALL be null

### ADDED: Recent Campaigns

**REQ-DASH-002**: The dashboard SHALL display a list of recent campaigns (up to 5).

**Scenario: Displaying recent campaigns**
- **GIVEN** more than 5 campaigns exist
- **WHEN** recent campaigns are requested
- **THEN** only the 5 most recent campaigns SHALL be returned (sorted by lastSessionAt DESC)

**Scenario: Displaying campaign card details**
- **GIVEN** a campaign exists with associated group
- **WHEN** the campaign card is rendered
- **THEN** it SHALL display:
  - Campaign title
  - Campaign state (Activa/Pausada/Finalizada)
  - Group name
  - Sessions played count
  - Next session date (if set)
  - Last session date (if set)

**Scenario: Campaign without sessions**
- **GIVEN** a campaign exists with sessions = 0
- **WHEN** the campaign card is rendered
- **THEN** "0 sessions" SHALL be displayed

**Scenario: Campaign without next or last session**
- **GIVEN** a campaign exists with no nextSessionAt or lastSessionAt
- **WHEN** the campaign card is rendered
- **THEN** the session date fields SHALL show "No scheduled" or "No sessions yet"

### ADDED: Recent Groups

**REQ-DASH-003**: The dashboard SHALL display a list of recent groups (up to 5).

**Scenario: Displaying recent groups**
- **GIVEN** more than 5 groups exist
- **WHEN** recent groups are requested
- **THEN** only the 5 most recent groups SHALL be returned (sorted by createdAt DESC)

**Scenario: Displaying group member details**
- **GIVEN** a group exists with members
- **WHEN** the group is rendered on the dashboard
- **THEN** each member SHALL display:
  - Player real name (if playerName is set)
  - Character name
  - Character class
  - Character level

**Scenario: Group with single member**
- **GIVEN** a group exists with only one member
- **WHEN** the group is rendered
- **THEN** the single member SHALL be displayed in the member list

**Scenario: Group with multiple members**
- **GIVEN** a group exists with multiple members
- **WHEN** the group is rendered
- **THEN** all members SHALL be displayed in a list

## Performance Requirements

**REQ-DASH-004**: Dashboard data SHALL be retrieved within 2 seconds.

**REQ-DASH-005**: Dashboard queries SHALL use pagination/limits to prevent loading excessive data.

## API Endpoints

**REQ-DASH-006**: The system SHALL provide the following API endpoints:
- `GET /api/dashboard/stats` - Returns dashboard statistics
- `GET /api/dashboard/recent-campaigns` - Returns recent campaigns
- `GET /api/dashboard/recent-groups` - Returns recent groups with member details

## Acceptance Criteria

- [ ] Dashboard stats block shows total campaigns count
- [ ] Dashboard stats block shows active campaigns count (status = 'Activa')
- [ ] Dashboard stats block shows total groups count
- [ ] Dashboard stats block shows total human players (non-NPC characters with playerName)
- [ ] Dashboard stats block shows next session date (earliest from active campaigns)
- [ ] Recent campaigns shows up to 5 campaigns sorted by lastSessionAt DESC
- [ ] Each campaign card shows: title, state, group name, sessions count, next/last session
- [ ] Recent groups shows up to 5 groups sorted by createdAt DESC
- [ ] Each group shows all members with player name, character name, class, level
- [ ] Dashboard loads within 2 seconds
- [ ] API endpoints return proper JSON responses