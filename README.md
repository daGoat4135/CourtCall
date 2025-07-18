# 🏐 CourtCall - Volleyball Scheduling App

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js">
</div>

<div align="center">
  <h3>🌟 Transform chaotic volleyball scheduling into seamless team coordination</h3>
  <p>An internal web application that makes organizing volleyball matches effortless with automated reminders, real-time updates, and gamification elements.</p>
</div>

---

## 🎯 Problem & Solution

**The Challenge:** Organizing volleyball matches at the company sand court was messy - irregular schedules, poor coordination, and low participation.

**The Solution:** CourtCall provides fixed time slots (morning, lunch, after work) that employees can join with one click, plus automated reminders and leaderboards to boost engagement.

## ✨ Key Features

- **🕐 One-Click Scheduling** - Join matches in 3 fixed time slots: Morning, Lunch, After Work
- **📅 Weekly Calendar View** - See all matches for the week at a glance
- **🔔 Smart Reminders** - Automated notifications 2 hours and 30 minutes before games
- **🏆 Leaderboards** - Gamification to encourage consistent participation
- **📊 Team Analytics** - Track games played, active players, and department participation
- **📱 Mobile-First Design** - Fully responsive for on-the-go scheduling

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[Dashboard] --> B[Weekly Calendar]
        A --> C[Leaderboard]
        A --> D[Stats Cards]
        B --> E[Match Cards]
        B --> F[Create Match Dialog]
        E --> G[Time Slot Card]
    end
    
    subgraph "Backend (Node.js + Express)"
        H[API Routes] --> I[Storage Layer]
        I --> J[PostgreSQL Database]
        H --> K[Session Management]
        H --> L[Notification System]
    end
    
    subgraph "Database Schema"
        M[Users] --> N[RSVPs]
        O[Matches] --> N
        N --> P[Notifications]
    end
    
    A --> H
    I --> M
    I --> O
    I --> P
```

## 🗃️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        string password
        string name
        string department
        string avatar
    }
    
    MATCHES {
        int id PK
        timestamp date
        string timeSlot
        int maxPlayers
        string status
        timestamp createdAt
    }
    
    RSVPS {
        int id PK
        int matchId FK
        int userId FK
        string status
        timestamp joinedAt
    }
    
    NOTIFICATIONS {
        int id PK
        int userId FK
        int matchId FK
        string type
        string message
        timestamp scheduledFor
        boolean sent
        timestamp createdAt
    }
    
    USERS ||--o{ RSVPS : "participates in"
    MATCHES ||--o{ RSVPS : "contains"
    USERS ||--o{ NOTIFICATIONS : "receives"
    MATCHES ||--o{ NOTIFICATIONS : "triggers"
```

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **Radix UI + shadcn/ui** - Accessible component library
- **React Hook Form + Zod** - Form handling with validation
- **Vite** - Lightning-fast development

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety on the server
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Reliable relational database
- **connect-pg-simple** - Session storage

### Development Tools
- **ESBuild** - Fast bundling
- **Drizzle Kit** - Database migrations
- **TSX** - TypeScript execution

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Your favorite code editor

### 1. Clone & Install
```bash
git clone [your-repo-url]
cd courtcall
npm install
```

### 2. Database Setup
```bash
# Set up your database connection
export DATABASE_URL="postgresql://user:password@localhost:5432/courtcall"

# Run database migrations
npm run db:push
```

### 3. Environment Variables
Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/courtcall
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=development
```

### 4. Start Development
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 🧪 Development Workflow

```mermaid
flowchart LR
    A[Code Changes] --> B[Vite HMR]
    B --> C[TypeScript Check]
    C --> D[Database Sync]
    D --> E[Live Reload]
    
    F[Database Changes] --> G[Update Schema]
    G --> H[Generate Types]
    H --> I[Run Migration]
    I --> J[Restart Dev Server]
```

## 📁 Project Structure

```
courtcall/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utilities and config
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express app
│   ├── index.ts           # Entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema & types
└── dist/                   # Build output
```

## 🔄 Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>F: Join Match
    F->>B: POST /api/matches/:id/join
    B->>D: Create RSVP
    D-->>B: RSVP Created
    B-->>F: Match Updated
    F->>F: Invalidate Cache
    F->>B: GET /api/matches/week
    B->>D: Query Matches + RSVPs
    D-->>B: Match Data
    B-->>F: Updated Matches
    F-->>U: UI Updates
```

## 🤝 Contributing

We love contributions! Here's how to get started:

### 1. Set Up Your Environment
```bash
# Fork and clone the repo
git clone https://github.com/your-username/courtcall.git
cd courtcall

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Development Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Keep components small and focused
- Use Tailwind classes for styling

#### Database Changes
- Update `shared/schema.ts` first
- Use Drizzle ORM for all database operations
- Run `npm run db:push` to sync changes
- Never write raw SQL queries

#### Frontend Patterns
- Use TanStack Query for server state
- Validate forms with React Hook Form + Zod
- Use shadcn/ui components when possible
- Make all interfaces mobile-responsive

### 3. Commit Guidelines
```bash
# Use conventional commits
git commit -m "feat: add match cancellation feature"
git commit -m "fix: resolve leaderboard calculation bug"
git commit -m "docs: update API documentation"
```

### 4. Pull Request Process
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and test thoroughly
3. Update documentation if needed
4. Submit a pull request with a clear description

## 🐛 Debugging & Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check connection
npm run db:push

# Reset database (development only)
DROP DATABASE courtcall;
CREATE DATABASE courtcall;
npm run db:push
```

#### TypeScript Errors
```bash
# Check types
npm run check

# Common fix - regenerate types
npm run db:push
```

#### Build Issues
```bash
# Clean build
rm -rf dist
npm run build
```

### Development Tips
- Use browser DevTools for React debugging
- Check the Network tab for API issues
- Console logs are your friend for state debugging
- Use TypeScript strict mode to catch errors early

## 📊 Key Components

### Weekly Calendar
- Displays Monday-Friday matches
- Shows player count and status
- One-click join/leave functionality

### Match Cards
- Individual match information
- RSVP management
- Player avatars and names

### Leaderboard
- Monthly player rankings
- Game count tracking
- Department participation stats

### Smart Notifications
- Automated reminder system
- Configurable timing
- Match status updates

## 🔮 Future Enhancements

- [ ] **Recurring Matches** - Set up weekly recurring games
- [ ] **Team Formation** - Automatic team balancing
- [ ] **Weather Integration** - Cancel outdoor matches automatically
- [ ] **Slack/Teams Integration** - Send reminders to team channels
- [ ] **Mobile App** - Native iOS/Android applications
- [ ] **Analytics Dashboard** - Detailed participation metrics
- [ ] **Equipment Management** - Track volleyballs, nets, etc.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for volleyball enthusiasts
- Inspired by the need for better workplace sports coordination
- Thanks to all contributors and beta testers

---

<div align="center">
  <p>Made with ❤️ for better volleyball scheduling</p>
  <p>Questions? Issues? Ideas? <a href="mailto:team@courtcall.com">Let's talk!</a></p>
</div>