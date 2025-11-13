# Movie Recommendation App

A modern, AI-powered movie search and recommendation application built with Next.js 16, featuring hybrid semantic search, advanced filtering with autocomplete, and TMDB poster integration.

## ✨ Features

- 🔍 **Hybrid Search**: AI-powered semantic search using embeddings + traditional text search
- 🎯 **Smart Filters**: Real-time autocomplete on 17 different filter fields
- 🖼️ **Movie Posters**: Automatic poster fetching from TMDB
- 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- ⚡ **Infinite Scroll**: Seamless loading of more results
- 🔒 **Secure API Proxy**: All API keys kept server-side
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or compatible runtime)
- pnpm (recommended), npm, or yarn
- Backend API URL and API key
- TMDB API key (for poster images)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd movie-recommendation
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Backend API Configuration
   BACKEND_BASE_URL=https://your-backend-api.com
   BACKEND_API_KEY=your-api-key-here

   # TMDB API Configuration (for movie posters)
   TMDB_API_KEY=your-tmdb-api-key-here
   ```

   See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[Environment Setup](./ENV_SETUP.md)** - Environment variable configuration
- **[Filter Autocomplete Guide](./FILTER_AUTOCOMPLETE_GUIDE.md)** - How to use the filter system
- **[cURL Commands](./CURL_COMMANDS.md)** - Test APIs with cURL
- **[Changelog](./CHANGELOG.md)** - Recent updates and changes

## 🎯 Key Features Explained

### Hybrid Search

The app supports two search modes:
- **Hybrid Search** (default): Combines AI embeddings with text search for semantic understanding
- **Title Search**: Fast prefix matching for exact title searches

### Smart Filters with Autocomplete

All filter fields support real-time autocomplete:
- Type to get instant suggestions from your database
- Press Enter or click to apply filters
- Results automatically refresh when filters change
- Visual feedback shows active filters

Available filters:
- Title, Director, Producer, Writer, Screenplay, Story
- Starring, Music, Cinematography, Editing
- Studio, Distributor, Country, Language
- Production Companies, Media Type

### Movie Posters

- Automatically fetches posters from TMDB
- Fallback placeholder for unavailable posters
- Cached for 24 hours for performance
- Server-side API key protection

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **HTTP Client**: Axios
- **Testing**: Vitest
- **Package Manager**: pnpm

## 🧪 Testing

Run the test suite:

```bash
pnpm test          # Run tests once
pnpm test:watch    # Run tests in watch mode
pnpm test:ui       # Run tests with UI
```

## 📝 Scripts

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm test          # Run tests
```

## 🔐 Security

- All API keys are stored server-side only
- Backend API key sent as Bearer token
- TMDB API key never exposed to client
- Environment variables validated at startup
- 10-second timeout on all API requests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [TMDB](https://www.themoviedb.org) - Movie poster images
- [Radix UI](https://www.radix-ui.com) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
