# Havana Chat - Setup Instructions

## Prerequisites

- Node.js 24.x (required for better-sqlite3 compatibility)
- Yarn package manager
- NVM (Node Version Manager) - recommended

## Initial Setup

### 1. Set up Node.js 24

```bash
# If using NVM
nvm install 24
nvm use 24

# Verify Node.js version
node -v  # Should show v24.x.x
```

### 2. Install Dependencies

```bash
# Install all dependencies
yarn install
```

### 3. Database Setup

The project uses SQLite with Drizzle ORM. Run these commands in order:

```bash
# Reset and create database with all tables
yarn db:reset

# Verify database tables were created
sqlite3 database.db "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see these tables:

- `__drizzle_migrations`
- `users`
- `chats`
- `messages`
- `bookings`
- `audit_llm`

### 4. Seed the Database

```bash
# Add sample data to the database
yarn db:seed
```

### 5. Verify Setup

```bash
# Start Drizzle Studio to view your database
yarn db:studio
```

This will open a web interface at `http://localhost:4983` where you can:

- View all tables
- Browse data
- Run queries
- Verify everything is working

### 6. Start Development Server

```bash
# Start the Next.js development server
yarn dev
```

The app will be available at `http://localhost:3000`

## Troubleshooting

### If you get "better-sqlite3 module version mismatch" errors:

This happens when the native module was compiled for a different Node.js version.

**Solution:**

```bash
# Remove node_modules and reinstall
rm -rf node_modules
yarn install

# Or specifically rebuild better-sqlite3
yarn add better-sqlite3@latest
```

### If database tables are missing:

```bash
# Reset database completely
yarn db:reset
```

### If Drizzle Studio won't start:

1. Make sure you're using Node.js 24
2. Rebuild native modules (see above)
3. Try: `yarn db:studio`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn db:studio` - Open Drizzle Studio
- `yarn db:reset` - Reset database and run migrations
- `yarn db:seed` - Add sample data
- `yarn db:generate` - Generate new migrations
- `yarn db:migrate` - Run migrations

## Database Schema

The project includes these main tables:

- **users** - User accounts
- **chats** - Chat conversations
- **messages** - Individual messages within chats
- **bookings** - Call booking requests
- **audit_llm** - LLM auditing

## Notes

- The database file (`database.db`) is created locally and should be added to `.gitignore` already
- All database operations use Drizzle ORM
- The project uses React Query for state management
- API routes are in `/app/api/`
