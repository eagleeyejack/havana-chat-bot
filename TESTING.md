# Havana Chat E2E Testing Guide

## Overview

This project now includes comprehensive end-to-end tests using Cypress to test the core student chat functionality, including AI responses, escalation to human agents, and the complete booking flow.

## What's Been Added

### 1. Cypress Installation & Configuration

- ✅ Cypress installed with TypeScript support
- ✅ Configuration file (`cypress.config.ts`) with proper settings
- ✅ Custom commands for common test operations
- ✅ Database reset/seed commands for consistent test state

### 2. Test IDs Added to Components

The following components now have `data-testid` attributes for reliable testing:

**Message Interface:**

- `user-switcher-trigger` - User dropdown trigger
- `user-switcher-content` - User dropdown content
- `message-input` - Chat message input field
- `send-button` - Send message button
- `message-bubble` - Individual chat messages (with `data-role`)
- `new-chat-button` - Create new chat button

**Booking Components:**

- `booking-offer` - Escalation booking offer
- `book-call-button` - Primary booking button
- `booking-dismiss-button` - Dismiss booking button
- `booking-interface-container` - Main booking container

**Booking Flow Steps:**

- `booking-intro` - Initial booking screen
- `booking-form` - Contact details form
- `booking-name-input` / `booking-email-input` - Form inputs
- `date-selection` / `time-selection` - Date/time pickers
- `booking-confirmation` - Final confirmation screen

### 3. Comprehensive E2E Tests

**Test File:** `cypress/e2e/student-chat-flow.cy.ts`

**Scenario 1: AI Responses About University Prices**

- ✅ Tests AI responses to tuition fee questions
- ✅ Validates response contains relevant keywords (tuition, fee, cost, price)
- ✅ Tests follow-up questions about scholarships and financial aid

**Scenario 2: Escalation to Human & Booking Prompt**

- ✅ Tests escalation triggers ("I need human help", etc.)
- ✅ Verifies booking offer appears after escalation
- ✅ Tests various escalation trigger phrases
- ✅ Validates booking offer content and buttons

**Scenario 3: Complete Booking Flow**

- ✅ Full end-to-end booking process
- ✅ Form validation (name, email required)
- ✅ Date and time slot selection
- ✅ Booking confirmation and submission
- ✅ Navigation between booking steps
- ✅ Booking dismissal functionality

**Error Handling & Edge Cases:**

- ✅ Empty message validation
- ✅ Loading states during message sending
- ✅ Form validation for booking details
- ✅ Navigation between booking steps

## Running the Tests

### Prerequisites

1. Application running on `http://localhost:3000`
2. Database properly migrated and accessible
3. OpenAI API key configured for AI responses

### Commands

```bash
# Start the development server first
yarn dev

# Run E2E tests in headless mode
yarn e2e

# Open Cypress UI for interactive testing
yarn e2e:open

# Run specific test file
yarn cypress run --spec "cypress/e2e/student-chat-flow.cy.ts"
```

### Test Environment Setup

Tests automatically:

1. Reset database (`yarn db:reset`)
2. Seed with test data (`yarn db:seed`)
3. Select test user (Carol Brown by default)
4. Create fresh chat for each test

## Test Data & Fixtures

- **Test Users:** Alice Johnson, Carol Brown, Bob Smith
- **Sample Messages:** Predefined messages for price queries, escalation triggers
- **Expected Keywords:** Price-related terms, escalation terms, booking terms

## Custom Cypress Commands

```typescript
cy.selectUser("Carol Brown"); // Select test user
cy.sendMessage("Hello"); // Send chat message
cy.waitForAIResponse(); // Wait for AI response
cy.checkChatEscalated(); // Verify chat escalation
```

## Troubleshooting

**Flaky Tests:** Increase timeouts in `cypress.config.ts`
**Database Issues:** Ensure migrations are applied and seeding works
**AI Responses:** Verify OpenAI API key is configured
**Missing Test IDs:** Check components have proper `data-testid` attributes

## File Structure

```
cypress/
├── e2e/
│   ├── student-chat-flow.cy.ts    # Main E2E tests
│   └── README.md                  # Detailed test documentation
├── fixtures/
│   └── test-data.json            # Test data and expected responses
├── support/
│   ├── commands.ts               # Custom Cypress commands
│   ├── database-commands.ts      # Database setup commands
│   └── e2e.ts                   # Global test setup
└── cypress.config.ts             # Cypress configuration
```

## Next Steps

1. Run the tests to verify everything works
2. Add more test scenarios as needed
3. Integrate with CI/CD pipeline
4. Consider adding visual regression testing
5. Monitor test results and maintain test stability

The E2E test suite ensures the core student experience works correctly across all three critical flows: getting AI answers about university prices, requesting human help with automatic escalation, and successfully booking calls with admissions advisors.
