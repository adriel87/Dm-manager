# Delta Spec: Group Domain

## Status
Part of: dashboard-homepage change

## Overview
This spec extends the Group domain to support dashboard queries for recent groups with full member details including player names.

## Modified Requirements

### ADDED: Dashboard Query Support

**REQ-GROUP-001**: The group repository SHALL support querying groups sorted by `createdAt` in descending order.

**Scenario: Retrieving recent groups**
- **GIVEN** multiple groups exist in the database
- **WHEN** a query requests recent groups sorted by creation date
- **THEN** groups SHALL be returned ordered by `createdAt` descending, with newest first

**REQ-GROUP-002**: The group repository SHALL support counting total groups.

**Scenario: Counting all groups**
- **GIVEN** multiple groups exist
- **WHEN** a count request is made
- **THEN** the total count of all groups SHALL be returned

### ADDED: Dashboard Data Projection

**REQ-GROUP-003**: Group data for dashboard display SHALL include full member details.

**Scenario: Getting group members with all details**
- **GIVEN** a group exists with members
- **WHEN** the group is retrieved for dashboard display
- **THEN** each member SHALL include `id`, `name`, `classType`, `level`, and `playerName`

**Scenario: Displaying group with NPC members**
- **GIVEN** a group exists with both player characters and NPCs
- **WHEN** the group is retrieved for dashboard display
- **THEN** all members SHALL be included regardless of isNPC status

**REQ-GROUP-004**: Group members without playerName SHALL display with null/undefined playerName.

**Scenario: Member without player name**
- **GIVEN** a group member exists without a playerName value
- **WHEN** the group is displayed on the dashboard
- **THEN** the member SHALL be displayed with playerName as empty or not shown

## Dashboard Member Display Format

**REQ-GROUP-005**: The dashboard SHALL display each group member with:
- Player real name (from playerName field, if available)
- Character name (from name field)
- Character class (from classType field)
- Character level (from level field)

**Scenario: Displaying member with player name**
- **GIVEN** a group member has both character name and playerName
- **WHEN** the group is displayed on the dashboard
- **THEN** both the player name and character name SHALL be visible

**Scenario: Displaying member without player name**
- **GIVEN** a group member has only character name (no playerName)
- **WHEN** the group is displayed on the dashboard
- **THEN** only the character name SHALL be visible

## Acceptance Criteria

- [ ] Group repository can query recent groups sorted by createdAt DESC
- [ ] Group repository can count total groups
- [ ] Group members include id, name, classType, level, and playerName
- [ ] Dashboard displays player name when available
- [ ] Dashboard displays character name, class, and level for all members
- [ ] Members without playerName are handled gracefully