# Nimto.app | Event Creation & Management Platform

A modern, full-stack event creation and management platform built with Next.js, featuring template-based event design, image editing capabilities, and comprehensive event management tools.

## Features

- 🎨 **Template-Based Event Creation** - Choose from pre-designed templates or create custom events
- 🖼️ **Advanced Image Editor** - Built-in Pixie editor for customizing event designs
- 📅 **Event Management** - Complete event lifecycle management with guest tracking
- 🎯 **Smart Navigation** - Context-aware routing and navigation
- 💾 **Data Persistence** - Redux state management with local storage caching
- 🔐 **User Authentication** - Secure user management and authorization
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15.3.x, React 19.x, Tailwind CSS 4.x
- **State Management**: Redux Toolkit
- **Database**: PostgreSQL 17.4.x with Prisma ORM
- **Image Processing**: Pixie Editor integration
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Tailwind CSS
- **File Storage**: AWS S3 integration

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- Npm or Yarn
- PostgreSQL 17.4.x
- AWS S3 account (for file storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nimto.app
```

2. Install dependencies:
```bash
npm install --force
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following environment variables in `.env.local`:
- Database connection string
- AWS S3 credentials
- NextAuth.js configuration
- API endpoints

4. Set up the database:

Deploy the database schema:
```bash
npx prisma db push
```

Generate the Prisma Client:
```bash
npx prisma generate
```

5. Run database migrations (if needed):
```bash
npx prisma migrate dev
```

### Database Issues

If you encounter a "Null constraint violation on the fields: (`id`)" error with VerificationToken, run the fix script:

```bash
npm run fix-verification-tokens
```

This will add missing `id` values to existing verification tokens in the database.

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
nimto.app/
├── app/                          # Next.js app directory
│   ├── (blank-layout)/          # Layout without sidebar
│   │   └── events/              # Event creation flow
│   ├── (protected)/             # Protected routes
│   │   ├── events/              # Event management
│   │   └── templates/           # Template management
│   ├── api/                     # API routes
│   └── components/              # Shared components
├── components/                   # Reusable UI components
│   └── image-editor/            # Pixie editor integration
├── lib/                         # Utility functions
├── store/                       # Redux store configuration
└── prisma/                      # Database schema and migrations
```

## Key Features

### Event Creation Flow
1. **Template Selection** - Choose from pre-designed templates
2. **Design Customization** - Use the integrated Pixie editor
3. **Event Details** - Add title, date, time, location, and description
4. **Guest Management** - Invite and track guests
5. **Publishing** - Make your event live

### Template System
- Pre-designed event templates
- Custom template creation
- Template preview and selection
- Template caching for performance

### Image Editor Integration
- Built-in Pixie editor
- Template design customization
- Text and shape overlays
- Image upload and processing

## API Endpoints

- `GET /api/template` - Fetch templates
- `GET /api/template/[id]` - Get specific template
- `POST /api/event` - Create new event
- `PUT /api/event/[id]` - Update event
- `DELETE /api/event/[id]` - Delete event

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.
