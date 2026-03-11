# Groups UI Specification

## Purpose

This spec defines the requirements and behaviors for the Groups Management UI — a dedicated page for creating, viewing, editing, and deleting player groups (parties) that can be assigned to campaigns.

## Requirements

### Requirement: Groups List Page

The system MUST display a page at `/groups` that shows all groups in the system.

#### Scenario: View all groups

- GIVEN the user navigates to `/groups`
- WHEN the page loads
- THEN all groups from the database SHALL be displayed as cards
- AND each card SHALL show the group name, description, and member count

#### Scenario: Empty groups list

- GIVEN there are no groups in the system
- WHEN the user navigates to `/groups`
- THEN an empty state SHALL be displayed with a message to create the first group
- AND a "Create Group" button SHALL be visible

### Requirement: Group Card Display

The system MUST display group information in a card format.

#### Scenario: Display group with members

- GIVEN a group has members
- WHEN the group is displayed as a card
- THEN each member SHALL be shown as a chip with their name and class
- AND the member count SHALL be displayed

#### Scenario: Display group without members

- GIVEN a group has no members
- WHEN the group is displayed as a card
- THEN "Sin miembros" SHALL be displayed
- AND no member chips SHALL be shown

### Requirement: Create Group

The system MUST provide a modal form to create new groups.

#### Scenario: Create group with all fields

- GIVEN the user clicks "Nuevo Grupo" button
- WHEN the create modal opens
- AND the user enters a valid name, description, and selects members
- AND clicks "Crear"
- THEN a new group SHALL be created in the database
- AND the modal SHALL close
- AND the groups list SHALL refresh to show the new group

#### Scenario: Create group without members

- GIVEN the user clicks "Nuevo Grupo" button
- WHEN the create modal opens
- AND the user enters name and description but no members
- AND clicks "Crear"
- THEN the group SHALL be created successfully with an empty members array

#### Scenario: Create group with validation error

- GIVEN the user clicks "Nuevo Grupo" button
- WHEN the create modal opens
- AND the user leaves the name field empty
- AND clicks "Crear"
- THEN an error message SHALL be displayed
- AND the group SHALL NOT be created

### Requirement: Edit Group

The system MUST allow editing existing groups.

#### Scenario: Edit group successfully

- GIVEN the user clicks the edit button on a group card
- WHEN the edit modal opens with current values
- AND the user modifies the name
- AND clicks "Guardar"
- THEN the group SHALL be updated in the database
- AND the modal SHALL close
- AND the groups list SHALL reflect the changes

### Requirement: Delete Group

The system MUST allow deleting groups.

#### Scenario: Delete group with confirmation

- GIVEN the user clicks the delete button on a group card
- WHEN a confirmation dialog appears
- AND the user confirms the deletion
- THEN the group SHALL be removed from the database
- AND the groups list SHALL refresh

#### Scenario: Cancel delete

- GIVEN the user clicks the delete button on a group card
- WHEN a confirmation dialog appears
- AND the user clicks "Cancelar"
- THEN the group SHALL NOT be deleted
- AND the dialog SHALL close

### Requirement: Assign Group to Campaign

The system MUST allow assigning a group to a campaign.

#### Scenario: Assign group to campaign

- GIVEN the user is editing a group
- AND the user selects a campaign from a dropdown
- AND clicks "Guardar"
- THEN the group SHALL be associated with the selected campaign
- AND the campaign's groups list SHALL include this group

#### Scenario: Change campaign assignment

- GIVEN a group is already assigned to a campaign
- WHEN the user edits the group and selects a different campaign
- AND clicks "Guardar"
- THEN the group SHALL be re-assigned to the new campaign
- AND removed from the previous campaign's groups

#### Scenario: Unassign from campaign

- GIVEN a group is assigned to a campaign
- WHEN the user edits the group and clears the campaign selection
- AND clicks "Guardar"
- THEN the group SHALL no longer be associated with any campaign
- AND the previous campaign's groups list SHALL not include this group

### Requirement: Navigation

The groups page MUST be accessible from the main navigation.

#### Scenario: Access groups from navigation

- GIVEN the user is on any page
- WHEN the user clicks "Grupos" in the navigation
- THEN the browser SHALL navigate to `/groups`
- AND the groups list page SHALL load

## Non-Functional Requirements

### UI Consistency

- The groups page SHALL use the same HeroUI components as other pages
- The dark theme styling SHALL match the existing campaigns and characters pages

### Accessibility

- All interactive elements SHALL be keyboard accessible
- Form errors SHALL be announced to screen readers
- ARIA labels SHALL be used for icon-only buttons
