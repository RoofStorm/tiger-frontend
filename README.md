# Tiger - Social Mood & Rewards Frontend

A modern React/Next.js frontend application for the Tiger social platform that allows users to share their moods, create mood cards, and redeem rewards.

## 🚀 Features

### Core Features

- **5 Interactive Corners**: Video player, emoji mood selection, image sharing, flip cards, and rewards
- **Mood Card Generation**: Create beautiful mood cards with html2canvas and share them
- **Image Upload & Gallery**: Upload images with captions and browse community posts
- **Rewards System**: Earn points and redeem rewards
- **Admin Panel**: Manage posts, approve redeem requests, and view analytics

### Technical Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Query** for data fetching
- **Framer Motion** for animations
- **NextAuth.js** for authentication
- **Responsive Design** for mobile and desktop
- **Accessibility** features included

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tiger-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # OAuth Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_CLIENT_ID=your-facebook-client-id
   FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

   # Cloud Storage
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── profile/           # User profile
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Corner0-4/         # Corner components
│   ├── ui/                # Reusable UI components
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
└── utils/                 # Utility functions
```

## 🎨 Corner Features

### Corner 0: Video Player

- Interactive video player with controls
- Auto-play and loop functionality
- Responsive design

### Corner 1: Mood Selection

- Emoji grid with 16 emotion options
- Select exactly 3 emojis
- Generate mood cards with whisper and reminder
- Share functionality with image generation

### Corner 2: Image Gallery

- Upload images with captions
- Browse community posts
- Like and share functionality
- Responsive gallery layout

### Corner 3: Flip Cards

- Interactive flip cards for personal development
- Action-based challenges
- Progress tracking

### Corner 4: Rewards

- Browse available rewards
- Redeem with points
- Track redemption history
- Admin approval workflow

## 🔐 Authentication

The app supports multiple authentication methods:

- Email/Password registration and login
- Google OAuth
- Facebook OAuth
- JWT token management with refresh

## 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints for all screen sizes
- Touch-friendly interactions
- Optimized for both portrait and landscape orientations

## ♿ Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management
- ARIA labels and descriptions

## 🧪 Testing

The project includes comprehensive testing setup:

- Unit tests with Jest
- Component tests with React Testing Library
- API client tests
- Coverage reporting

Run tests:

```bash
npm run test
npm run test:coverage
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

### Using Docker

```bash
docker build -t tiger-frontend .
docker run -p 3000:3000 tiger-frontend
```

## 🌐 Environment Variables

| Variable                            | Description                  | Required |
| ----------------------------------- | ---------------------------- | -------- |
| `NEXT_PUBLIC_API_BASE_URL`          | Backend API URL              | Yes      |
| `NEXTAUTH_URL`                      | Application URL              | Yes      |
| `NEXTAUTH_SECRET`                   | NextAuth secret key          | Yes      |
| `GOOGLE_CLIENT_ID`                  | Google OAuth client ID       | No       |
| `GOOGLE_CLIENT_SECRET`              | Google OAuth client secret   | No       |
| `FACEBOOK_CLIENT_ID`                | Facebook OAuth client ID     | No       |
| `FACEBOOK_CLIENT_SECRET`            | Facebook OAuth client secret | No       |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name        | No       |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`    | Cloudinary API key           | No       |
| `CLOUDINARY_API_SECRET`             | Cloudinary API secret        | No       |

## 📊 Analytics

The app includes built-in analytics tracking:

- Corner visit duration tracking
- User interaction analytics
- Batched data transmission
- Privacy-compliant data collection

## 🔧 API Integration

The frontend integrates with a RESTful API:

- Authentication endpoints
- Posts management
- Mood card creation
- Rewards system
- Admin functions
- File upload handling

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with all core features
- **v1.1.0** - Added admin panel and analytics
- **v1.2.0** - Enhanced mobile responsiveness
- **v1.3.0** - Added Docker support and testing

---

Built with ❤️ by the Tiger Team
