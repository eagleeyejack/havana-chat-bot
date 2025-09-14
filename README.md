# Havana Chat - AI-Powered Support System

A Next.js application that provides AI-powered chat support for students with human escalation capabilities and call booking functionality.

## 🚀 Quick Start

### Prerequisites

- Node.js 24.x (required for better-sqlite3 compatibility)
- OpenAI API key
- Yarn package manager

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd havana-chat
   yarn install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=file:./data/app.db
   NODE_ENV=development
   ```

3. **Initialize database and start the application:**

   ```bash
   yarn db:reset    # Reset database and run migrations
   yarn db:seed     # Add sample data
   yarn dev         # Start development server
   ```

4. **Access the application:**
   - **Admin Dashboard:** http://localhost:3000/dashboard
   - **Student Interface:** http://localhost:3000/student

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions
- **[Testing Guide](docs/TESTING.md)** - Unit and E2E testing instructions
- **[AI Usage](docs/AI_USAGE.md)** - How AI was used in development
- **[Trade-offs & Decisions](docs/TRADE_OFFS.md)** - Technical decisions and trade-offs
- **[Future Improvements](docs/IMPROVEMENTS.md)** - Planned enhancements

## 🏗️ Project Structure

```
havana-chat/
├── app/
│   ├── api/                    # API routes for database operations
│   │   ├── users/             # User management endpoints
│   │   ├── chats/             # Chat management endpoints
│   │   ├── messages/          # Message handling endpoints
│   │   ├── bookings/          # Call booking endpoints
│   │   └── ai/                # AI integration endpoints
│   ├── dashboard/             # Admin dashboard functionality
│   │   ├── calls/             # Call booking management
│   │   ├── chats/             # Chat monitoring and management
│   │   └── components/        # Admin-specific components
│   ├── student/               # Student interface (mock)
│   │   └── components/        # Student-specific components
│   └── shared/                # Shared components and utilities
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom React hooks
│       └── stores/            # State management (Zustand)
├── docs/                      # Project documentation
│   ├── SETUP.md              # Setup instructions
│   ├── TESTING.md            # Testing guide
│   ├── AI_USAGE.md           # AI usage documentation
│   ├── TRADE_OFFS.md         # Technical decisions
│   └── IMPROVEMENTS.md       # Future enhancements
├── lib/
│   ├── api/                   # API client functions
│   ├── db/                    # Database schema and actions
│   │   ├── actions/           # Database operation functions
│   │   ├── hooks/             # React Query hooks
│   │   └── migrations/        # Database migrations
│   ├── open-ai/               # OpenAI integration
│   └── static/                # Static data (knowledge base)
└── cypress/                   # E2E tests
```

## 🎯 Key Features

### For Students

- **AI Chat Interface:** Natural conversation with AI assistant
- **Knowledge Base Integration:** AI can access and reference university information
- **Human Escalation:** Automatic escalation when human help is needed
- **Call Booking:** Schedule calls with support staff
- **Real-time Updates:** Live chat experience with polling

### For Administrators

- **Chat Monitoring:** View all student conversations
- **Call Management:** Manage booking requests and availability
- **User Management:** Handle multiple student accounts
- **AI Audit Trail:** Track all AI interactions and responses (DB)
- **Polling Control:** Adjust real-time update intervals for testing and optimization

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Database:** SQLite with Drizzle ORM
- **State Management:** Zustand, React Query
- **AI Integration:** OpenAI GPT API
- **Testing:** Vitest (unit), Cypress (E2E)
- **Development:** Node.js 24, Yarn

## 🧪 Testing

### Running Tests

```bash
# Start the application first
yarn dev

# In a separate terminal, run tests
yarn test:run    # Unit tests
yarn e2e         # End-to-end tests
yarn test:ui     # Interactive test UI
```

### Test Coverage

- **Unit Tests:** API endpoints, data validation, edge cases
- **E2E Tests:** Complete user workflows, AI interactions, booking flow
- **Performance:** Pagination, loading states, error handling

## 🚀 Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server

# Database
yarn db:reset         # Reset database and run migrations
yarn db:seed          # Add sample data
yarn db:studio        # Open Drizzle Studio
yarn db:generate      # Generate new migrations
yarn db:migrate       # Run migrations

# Testing
yarn test             # Run unit tests in watch mode
yarn test:run         # Run unit tests once
yarn test:ui          # Run tests with UI
yarn e2e              # Run E2E tests
yarn e2e:open         # Open Cypress Test Runner

# Linting
yarn lint             # Run ESLint
```

## 🔧 Configuration

### Environment Variables

All variables are in the `.env.example`

- `OPENAI_API_KEY` - Required for AI functionality
- `DATABASE_URL`=file:./data/app.db
- `NODE_ENV`=development

### Database

- SQLite database file: `database.db`
- Migrations: `lib/db/migrations/`
- Schema: `lib/db/schema.ts`

## 📊 Performance Considerations

- **Pagination:** Implemented for chat lists to handle large datasets
- **Polling:** Used instead of WebSockets for simplicity and reliability
- **Database Indexing:** Optimized queries with proper indexes
- **Caching:** React Query for efficient data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `yarn test:run && yarn e2e`
5. Submit a pull request

---

**Development Time:** ~4.5 hours  
**AI Usage:** Use of AI for tooling setup, code generation, and testing  
**Focus:** MVP functionality with emphasis on core chat and escalation features
