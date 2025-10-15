# Spec: Counter Backend

## ADDED Requirements

### Requirement: Counter Value Persistence
The system MUST persist a single global counter value in the PocketBase database that survives application restarts and can be accessed/modified by the frontend.

#### Scenario: Initialize counter on first access
**Given** the counter has never been accessed before
**When** the application requests the current counter value
**Then** a default counter record is created with value 0
**And** the value 0 is returned to the caller

#### Scenario: Retrieve existing counter value
**Given** a counter record exists with value 42
**When** the application requests the current counter value
**Then** the value 42 is returned without modifying the database

#### Scenario: Increment counter atomically
**Given** a counter record exists with value 10
**When** the increment operation is called
**Then** the counter value is incremented to 11 in the database
**And** the new value 11 is returned to the caller
**And** the operation is atomic (no race conditions)

#### Scenario: Decrement counter atomically
**Given** a counter record exists with value 10
**When** the decrement operation is called
**Then** the counter value is decremented to 9 in the database
**And** the new value 9 is returned to the caller
**And** the operation is atomic (no race conditions)

### Requirement: Counter Collection Schema
The PocketBase database MUST have a `counters` collection with a defined schema that supports counter operations.

#### Scenario: Collection exists with correct schema
**Given** PocketBase is initialized
**When** checking for the `counters` collection
**Then** the collection exists with the following fields:
- `id` (text, primary key, manual)
- `value` (number, required, default 0)
- `updated` (date, auto-updated)

#### Scenario: Single counter record enforcement
**Given** the `counters` collection exists
**When** attempting to create a second counter record with id "main"
**Then** the operation fails due to unique constraint
**Or** the existing record is updated instead (upsert behavior)

### Requirement: Counter Service Layer
The frontend MUST have a service module that encapsulates all counter-related API operations.

#### Scenario: Service fetches current value
**Given** the counterService module is imported
**When** `counterService.getValue()` is called
**Then** a GET request is made to PocketBase `/api/collections/counters/records/main`
**And** the counter value is extracted and returned

#### Scenario: Service increments counter
**Given** the counterService module is imported
**When** `counterService.increment()` is called
**Then** a PATCH request is made to PocketBase to increment the value
**And** the updated counter value is returned

#### Scenario: Service decrements counter
**Given** the counterService module is imported
**When** `counterService.decrement()` is called
**Then** a PATCH request is made to PocketBase to decrement the value
**And** the updated counter value is returned

#### Scenario: Service handles network errors
**Given** the counterService makes a request
**When** the network request fails
**Then** the service throws a descriptive error
**And** the error includes the original failure reason

## Cross-references
- Related to **Chart Data Backend** (chart-data-backend): Counter route will display both counter and charts
- Related to **Counter UI** (counter-frontend): This spec defines the backend services consumed by the UI
