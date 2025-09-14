# Havana Chat E2E Tests

This directory contains end-to-end tests for the Havana Chat application using Cypress.

## Test Scenarios

### 1. AI Response Tests (`student-chat-flow.cy.ts`)

Tests the core functionality of the student chat interface:

- **Scenario 1**: AI answers about university prices

  - Tests AI responses to questions about tuition fees, costs, scholarships
  - Verifies appropriate keywords and information in responses

- **Scenario 2**: Escalation to human and booking prompt

  - Tests escalation triggers when students request human help
  - Verifies booking offer appears with correct content
  - Tests various escalation trigger phrases

- **Scenario 3**: Complete booking flow
  - Tests full booking process from start to finish
  - Includes form validation, date/time selection, confirmation
  - Tests navigation between booking steps
  - Tests dismissal of booking offers

### Error Handling & Edge Cases

- Empty message validation
- Loading states
- Form validation
- Network error handling

## Test Data

Test data is stored in `fixtures/test-data.json` and includes:

- Test user accounts
- Sample messages for different scenarios
- Expected response keywords

## Running Tests

```bash
# Run tests in headless mode
yarn e2e

# Open Cypress UI for interactive testing
yarn e2e:open

# Run specific test file
yarn cypress run --spec "cypress/e2e/student-chat-flow.cy.ts"
```

## Test Structure

Tests use custom commands defined in `support/commands.ts`:

- `selectUser(userName)` - Select test user from dropdown
- `sendMessage(message)` - Send message in chat
- `waitForAIResponse()` - Wait for AI response to appear
- `checkChatEscalated()` - Verify chat escalation occurred

## Database Setup

Tests automatically:

- Reset database before each test (`yarn db:reset`)
- Seed with test data (`yarn db:seed`)

## Test IDs

All interactive elements have `data-testid` attributes for reliable testing:

- `user-switcher-trigger` - User selection dropdown
- `message-input` - Message input field
- `send-button` - Send message button
- `message-bubble` - Individual chat messages
- `booking-offer` - Booking offer component
- `book-call-button` - Book call button
- Form fields, dates, time slots, etc.

## Prerequisites

1. Application must be running on `http://localhost:3000`
2. Database must be accessible and migrations applied
3. OpenAI API key configured (for AI responses)

## Troubleshooting

- If tests are flaky, increase timeout values in `cypress.config.ts`
- Check test data is properly seeded before tests run
- Verify all test IDs are present in the UI components
- Ensure dev server is running before test execution
