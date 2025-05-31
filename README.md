# FarBook - Farcaster Creator Booking Mini App

A Farcaster mini app that allows users to book paid time slots with creators, integrated with Dynamic.xyz for secure crypto wallet payments.

## Features

- 🎯 **Creator Discovery**: Browse and discover creators by category (founders, developers, designers, etc.)
- 💰 **Crypto Payments**: Secure payments using Dynamic.xyz wallet integration
- 📅 **Smart Scheduling**: Calendar-based time slot booking system
- 🔗 **Farcaster Integration**: Native Farcaster Frame support for seamless social integration
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: In-memory storage (easily replaceable with PostgreSQL)
- **Payments**: Dynamic.xyz crypto wallet integration
- **Deployment**: Vercel-ready configuration

## Quick Start

### Prerequisites

1. Node.js 20+
2. Dynamic.xyz account and Environment ID

### Environment Variables

Create a `.env` file with:

```env
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Vercel

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Set Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add: `VITE_DYNAMIC_ENVIRONMENT_ID` with your Dynamic.xyz environment ID

### Step 5: Redeploy
```bash
vercel --prod
```

## Dynamic.xyz Setup

1. Visit [Dynamic.xyz](https://app.dynamic.xyz/)
2. Create an account and new project
3. Copy your Environment ID from the dashboard
4. Add it to your environment variables

## API Endpoints

- `GET /api/creators` - List all creators
- `GET /api/creators/:id` - Get creator details
- `GET /api/creators/:id/timeslots` - Get available time slots
- `POST /api/bookings` - Create a booking
- `POST /api/confirm-crypto-payment` - Confirm crypto payment
- `POST /api/users` - Create/get user
- `PATCH /api/users/:id/wallet` - Update user wallet

## Farcaster Frame Integration

The app includes Frame metadata generation for easy sharing within Farcaster:

- Creator profile frames
- Booking confirmation frames
- Frame signature validation

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/           # Utility libraries
│   │   └── hooks/         # React hooks
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── vite.ts           # Vite development setup
├── shared/               # Shared types and schemas
└── vercel.json          # Vercel deployment config
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details