# Havana Chat - Testing Guide

This project includes testing with both unit tests (Vitest) and end-to-end tests (Cypress).

## Test Setup

Before running tests, ensure you have completed the initial setup from `SETUP.md`:

1. Node.js 24.x
2. Dependencies installed (`yarn install`)
3. Database set up (`yarn db:reset`)
4. Database seeded (`yarn db:seed`)

## Unit Tests (Vitest)

Unit tests use Vitest and test individual API endpoints and functions.

### Running Unit Tests

```bash
# Run all unit tests once
yarn test:run

# Run tests in watch mode (re-runs on file changes)
yarn test

# Run tests with UI interface
yarn test:ui
```

### What Unit Tests Cover

- **API Endpoints**: Testing `/api/users` endpoint with various parameters
- **Data Validation**: Ensuring correct response structures
- **Edge Cases**: Handling invalid inputs, zero counts, etc.
- **Database Operations**: Verifying data retrieval and manipulation

### Example Unit Test Output

```
✓ lib/api/__tests__/api.users.test.js (5 tests) 12ms
  ✓ /api/users > should return users with default limit 3ms
  ✓ /api/users > should return users with custom limit 1ms
  ✓ /api/users > should return users with correct structure 1ms
  ✓ /api/users > should handle zero count 0ms
  ✓ /api/users > should handle invalid count parameter 0ms

Test Files  1 passed (1)
Tests  5 passed (5)
```

## End-to-End Tests (Cypress)

E2E tests simulate real user interactions across the entire application.

### Running E2E Tests

```bash
# Make sure you are running the app
yarn dev

# Run all E2E tests (headless)
yarn e2e

# Open Cypress Test Runner (interactive)
yarn e2e:open

# Alternative commands
yarn cypress:run    # Same as yarn e2e
yarn cypress:open   # Same as yarn e2e:open
```

### What E2E Tests Cover

The test suite includes comprehensive scenarios:

#### Scenario 1: AI Chat Functionality

- ✅ AI responses about university tuition fees
- ✅ Follow-up questions about scholarships
- ✅ Natural conversation flow

#### Scenario 2: Escalation and Human Handoff

- ✅ Escalation when requesting human help
- ✅ Booking offer display
- ✅ Different escalation triggers

#### Scenario 3: Complete Booking Flow

- ✅ Full booking process completion
- ✅ Booking offer dismissal
- ✅ Navigation through booking steps

#### Error Handling and Edge Cases

- ✅ Empty message handling
- ✅ Loading states display
- ✅ Booking form validation

### Example E2E Test Output

```
Student Chat Flow E2E Tests
  Scenario 1: AI answers about university prices
    ✓ should get AI response about university tuition fees (14814ms)
    ✓ should handle follow-up questions about scholarships (19441ms)
  Scenario 2: Escalation to human and booking prompt
    ✓ should escalate when requesting human help and show booking offer (14637ms)
    ✓ should handle different escalation triggers (13384ms)
  Scenario 3: Complete booking flow
    ✓ should complete the full booking process (15907ms)
    ✓ should allow user to dismiss booking offer (13710ms)
    ✓ should allow navigation back through booking steps (14695ms)
  Error handling and edge cases
    ✓ should handle empty messages gracefully (5901ms)
    ✓ should show proper loading states (12312ms)
    ✓ should handle booking form validation (13512ms)

10 passing (2m)
```

## Test Configuration

### Vitest Configuration

- Config file: `vitest.config.ts`
- Test files: `**/*.test.{js,ts}`
- Setup file: `test/setup.js`

### Cypress Configuration

- Config file: `cypress.config.ts`
- Test files: `cypress/e2e/**/*.cy.{js,ts}`
- Support files: `cypress/support/`
- Fixtures: `cypress/fixtures/`

## Running Tests in CI/CD

For continuous integration, use:

```bash
# Run all tests
yarn test:run && yarn e2e

# Or run them separately
yarn test:run    # Unit tests
yarn e2e         # E2E tests
```

## Test Data

- **Unit tests**: Use seeded database data
- **E2E tests**: Use fixtures and database commands in `cypress/support/database-commands.ts`

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
yarn test api.users.test.js

# Run with verbose output
yarn test --reporter=verbose
```

### E2E Tests

```bash
# Open Cypress with specific test
yarn cypress:open --spec "cypress/e2e/student-chat-flow.cy.ts"

# Run with video recording
yarn e2e --record
```

## Test Coverage

Current test coverage includes:

- ✅ API endpoint functionality
- ✅ Database operations
- ✅ User interface interactions
- ✅ Complete user workflows
- ✅ Error handling
- ✅ Form validation
- ✅ Loading states

## Troubleshooting

### Common Issues

1. **Tests fail with database errors**

   - Run `yarn db:reset` to reset database
   - Run `yarn db:seed` to add test data

2. **Cypress tests timeout**

   - Ensure dev server is running (`yarn dev`)
   - Check that all API endpoints are working

3. **Node.js version issues**
   - Ensure you're using Node.js 24.x
   - Run `nvm use 24` if using NVM

### Test Environment

- **Database**: SQLite (same as development)
- **Browser**: Electron (Cypress default)
- **Node.js**: v24.8.0
- **Test Runner**: Vitest v3.2.4
- **E2E Framework**: Cypress v15.2.0

## Adding New Tests

### Unit Tests

1. Create test file: `lib/api/__tests__/api.new-feature.test.js`
2. Import necessary modules and test utilities
3. Write test cases using Vitest syntax
4. Run with `yarn test`

### E2E Tests

1. Create test file: `cypress/e2e/new-feature.cy.ts`
2. Use Cypress commands for interactions
3. Use database commands for setup/cleanup
4. Run with `yarn e2e:open` for development

## Performance

- **Unit tests**: ~1.5 seconds for full suite
- **E2E tests**: ~2.5 minutes for full suite
- **Total test time**: ~3 minutes

Both test suites are optimized for speed while maintaining comprehensive coverage.
