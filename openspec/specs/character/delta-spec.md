# Delta Spec: Character Domain

## Status
Part of: dashboard-homepage change

## Overview
This spec modifies the Character entity to add an optional `playerName` field for tracking the real name of the player behind a character.

## Modified Requirements

### ADDED: playerName Field

**REQ-CHAR-001**: The Character interface SHALL include an optional `playerName` field of type `string`.

**Scenario: Creating a character with player name**
- **GIVEN** a user is creating a new character
- **WHEN** they provide a value for the player name field
- **THEN** the character SHALL be stored with the `playerName` property set to the provided value

**Scenario: Creating a character without player name**
- **GIVEN** a user is creating a new character
- **WHEN** they do not provide a value for the player name field
- **THEN** the character SHALL be stored with `playerName` set to `undefined` or not present

**Scenario: Updating character player name**
- **GIVEN** an existing character with no player name
- **WHEN** the user updates the character to include a player name
- **THEN** the character SHALL have the `playerName` property updated to the new value

**Scenario: Editing character to remove player name**
- **GIVEN** an existing character with a player name
- **WHEN** the user explicitly removes the player name value
- **THEN** the character SHALL have `playerName` set to `undefined` or removed

### MODIFIED: Group Member Display

**REQ-CHAR-002**: The Character interface used in Group members SHALL include the `playerName` field for display purposes.

**Scenario: Displaying group member details**
- **GIVEN** a group exists with members
- **WHEN** the group member list is retrieved for display
- **THEN** each member SHALL include `playerName`, `name`, `classType`, and `level`

## Backwards Compatibility

**REQ-CHAR-003**: The addition of `playerName` field SHALL NOT break existing character queries or operations.

- **GIVEN** existing characters without `playerName`
- **WHEN** they are retrieved
- **THEN** they SHALL be returned without errors, with `playerName` being `undefined`

## Data Mapping

**REQ-CHAR-004**: The MongoDB mapper SHALL correctly map the `playerName` field between MongoDB documents and the Character interface.

**REQ-CHAR-005**: The Zod validation schema for character input SHALL include an optional `playerName` field that accepts string values.

## Acceptance Criteria

- [ ] Character entity includes optional `playerName?: string` field
- [ ] Character can be created with or without playerName
- [ ] Character can be updated to add/remove playerName
- [ ] Group members include playerName for display
- [ ] Existing characters without playerName remain functional
- [ ] Zod schema includes optional playerName field
- [ ] MongoDB mapper handles playerName field correctly