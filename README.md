# Vamo Fellowship App

A modern web application for tracking fellowship progress, managing customer relationships, and documenting social proof during the Vamo Fellowship program.

## Features

### 🎯 Dashboard
- Real-time countdown timer showing days, hours, minutes, and seconds until the $100K milestone
- Progress tracking with visual progress bar
- Fellowship start and end date display
- Quick access to all major features

### 👥 Customer Management
- Track and manage customer relationships
- Add new customers with detailed information
- View customer list with status tracking
- Customer interaction history

### 📝 Daily Updates
- Submit daily progress updates
- Track what you can show off publicly today
- Build a chronological log of your fellowship journey
- Easy-to-use update interface

### 📄 Social Proof / Evidence Tracker
- Upload and manage evidence of customer interactions
- Email attachment functionality for sharing proof
- Organize evidence by type and date
- Visual evidence gallery

### 🤝 Contributors Management
- Manage team members and contributors
- Display real-time local time for each contributor based on their timezone
- Contact buttons (Email, LinkedIn, Github)
- Add and edit contributor details including:
  - Name and role
  - Location and timezone
  - Contact information
  - Social media links

### 🏢 My Workspace
- Slide-out workspace panel accessible from any page
- Add and display vibecoded prototype with live preview
- Edit workspace details (name, pitch, TBD items)
- Boost Book integration
- Contributors overview with real-time timezone display

### 🔐 Authentication
- Email/password authentication
- Google OAuth integration
- Separate flows for admins and contributors
- Contributor workspace join system (Slack-like experience)
- Protected routes with middleware

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Language**: TypeScript
- **Image Handling**: Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vamo-ai/vamo-fellowship-app-new.git
cd vamo-fellowship-app-new
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration (for Gmail, use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com

# Next.js & Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed sample workspaces (optional):
```bash
npx prisma db seed
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
vamo-fellowship-app-new/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── customers/         # Customer management page
│   ├── evidence/          # Social proof page
│   ├── login/            # Login page
│   ├── signup/           # Signup pages (admin & contributor)
│   ├── team/             # Contributors page
│   ├── updates/          # Daily updates page
│   └── page.tsx          # Dashboard/home page
├── components/            # Reusable React components
│   ├── CountdownTimer.tsx
│   ├── EmailAttachmentModal.tsx
│   ├── Providers.tsx
│   ├── Sidebar.tsx
│   └── WorkspacePanel.tsx
├── contexts/             # React Context providers
│   └── WorkspacePanelContext.tsx
├── lib/                  # Utility functions
│   └── email.ts
├── prisma/              # Database schema and migrations
│   └── schema.prisma
└── public/              # Static assets
```

## Key Features Explained

### Countdown Timer
The countdown timer calculates the time remaining until the fellowship end date and displays it in a user-friendly format. It updates every second and shows progress toward the $100K goal.

### Workspace Panel
A slide-out panel accessible from any page that provides quick access to workspace settings, prototype links, and contributor information. Features:
- Prototype embedding with hover-to-edit functionality
- Editable workspace details
- Real-time local time display for contributors based on timezone
- Direct contact buttons for team members

### Authentication Flow
The app supports two user types:
- **Admins**: Full access to create and manage workspaces
- **Contributors**: Must join an existing workspace using a Slack-like search interface

### Email Configuration
To enable email functionality:
1. For Gmail: Create an App Password (requires 2FA enabled)
2. For other providers: Use your SMTP credentials
3. Update the `.env` file with your SMTP settings

## Database Schema

The app uses Prisma with SQLite and includes the following main models:
- `User`: User accounts with authentication
- `Customer`: Customer relationship data
- `Update`: Daily progress updates
- `Evidence`: Social proof uploads
- `Workspace`: Organization workspaces
- `WorkspaceMember`: Workspace membership relations

## Contributing

This is a fellowship project for the Vamo Fellowship program. For questions or support, please contact the Vamo team.

## License

Private - Vamo Fellowship Program

## Support

For technical support or questions about the fellowship program, please reach out to the Vamo team.

---

Built with ❤️ for the Vamo Fellowship
