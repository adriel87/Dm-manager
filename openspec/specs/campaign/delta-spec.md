# Delta Spec: Campaign Domain

## Status
Part of: dashboard-homepage change

## Overview
This spec extends the Campaign domain to support dashboard queries for recent campaigns and campaign statistics.

## Modified Requirements

### ADDED: Dashboard Query Support

**REQ-CAMP-001**: The campaign repository SHALL support querying campaigns sorted by `lastSessionAt` in descending order.

**Scenario: Retrieving recent campaigns**
- **GIVEN** multiple campaigns exist in the database
- **WHEN** a query requests recent campaigns sorted by last session
- **THEN** campaigns SHALL be returned ordered by `lastSessionAt` descending, with most recent first

**Scenario: Retrieving recent campaigns with no sessions**
- **GIVEN** campaigns exist but none have a `lastSessionAt` value
- **WHEN** a query requests recent campaigns
- **THEN** campaigns with `lastSessionAt` set SHALL appear before those without

**REQ-CAMP-002**: The campaign repository SHALL support filtering campaigns by status.

**Scenario: Querying active campaigns**
- **GIVEN** campaigns exist with various statuses (Activa, Pausada, Finalizada)
- **WHEN** a query filters by status = 'Activa'
- **THEN** only campaigns with status 'Activa' SHALL be returned

**REQ-CAMP-003**: The campaign repository SHALL support counting campaigns with optional status filter.

**Scenario: Counting all campaigns**
- **GIVEN** multiple campaigns exist
- **WHEN** a count request is made without status filter
- **THEN** the total count of all campaigns SHALL be returned

**Scenario: Counting active campaigns**
- **GIVEN** multiple campaigns exist with various statuses
- **WHEN** a count request is made with status filter = 'Activa'
- **THEN** the count of only 'Activa' campaigns SHALL be returned

### ADDED: Dashboard Data Projection

**REQ-CAMP-004**: Campaign data for dashboard display SHALL include associated group name.

**Scenario: Getting campaign with group info**
- **GIVEN** a campaign is associated with a group
- **WHEN** the campaign is retrieved for dashboard display
- **THEN** the campaign SHALL include the associated group's name

**REQ-CAMP-005**: Campaign data for dashboard SHALL include next and last session dates.

**Scenario: Displaying campaign with upcoming session**
- **GIVEN** a campaign has a `nextSessionAt` date in the future
- **WHEN** the campaign is displayed on the dashboard
- **THEN** the next session date SHALL be visible

**Scenario: Displaying campaign with past session**
- **GIVEN** a campaign has a `lastSessionAt` date in the past
- **WHEN** the campaign is displayed on the dashboard
- **THEN** the last session date SHALL be visible

### ADDED: Next Session Query

**REQ-CAMP-006**: The system SHALL support querying for the earliest upcoming session across all active campaigns.

**Scenario: Finding next session date**
- **GIVEN** multiple active campaigns exist with various `nextSessionAt` dates
- **WHEN** a query requests the earliest upcoming session
- **THEN** the minimum `nextSessionAt` date from active campaigns SHALL be returned

**Scenario: No upcoming sessions**
- **GIVEN** no active campaigns have a `nextSessionAt` date set
- **WHEN** a query requests the next session
- **THEN** null or undefined SHALL be returned

## Acceptance Criteria

- [ ] Campaign repository can query recent campaigns sorted by lastSessionAt DESC
- [ ] Campaign repository can filter by status
- [ ] Campaign repository can count campaigns (total and by status)
- [ ] Campaign display includes group name
- [ ] Campaign display includes nextSessionAt and lastSessionAt
- [ ] Query returns earliest nextSessionAt from active campaigns
- [ ] Query returns null when no upcoming sessions exist