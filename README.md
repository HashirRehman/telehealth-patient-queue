# Hospital Management System

A comprehensive hospital management system built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure login and signup with Supabase Auth
- 👥 **User Management**: Role-based access control
- 🏥 **Dashboard**: Overview of hospital operations
- 📱 **Responsive Design**: Modern UI with shadcn/ui components
- 🔒 **Protected Routes**: Secure access to sensitive pages

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (Authentication, Database)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hospital-management-system
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
yarn dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Add these to your `.env.local` file
4. Enable email authentication in Authentication > Settings
5. Configure email templates if needed

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Protected dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout with AuthProvider
│   └── page.tsx          # Home page
├── components/
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx   # Authentication context
└── lib/
    ├── supabase.ts       # Supabase client configuration
    └── utils.ts          # Utility functions
```

## Authentication Flow

1. **Sign Up**: Users can create an account with email/password
2. **Email Verification**: Supabase sends verification email
3. **Sign In**: Users can log in with verified credentials
4. **Protected Routes**: Dashboard requires authentication
5. **Sign Out**: Users can securely log out

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
