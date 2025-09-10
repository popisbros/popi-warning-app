# Popi Is Warning The Community (Test)

A Next.js Progressive Web App (PWA) for community-driven warning and POI (Point of Interest) management. Users can explore interactive maps, search for addresses/POIs, add or correct POIs in OpenStreetMap, and manage private warnings stored in Firebase.

## 🚀 Features

- **Interactive Map**: MapLibre GL JS with MapTiler tiles
- **Search Functionality**: LocationIQ integration for address and POI search
- **POI Management**: Add and correct POIs in OpenStreetMap
- **Private Warnings**: Store and manage community warnings in Firebase
- **Authentication**: Firebase Auth with email, Google, Apple, and anonymous sign-in
- **Push Notifications**: Firebase Cloud Messaging (FCM) support
- **PWA Support**: Installable as a mobile app
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL JS
- **Backend**: Firebase (Auth, Firestore, FCM)
- **Search**: LocationIQ API
- **POI Data**: OpenStreetMap API
- **PWA**: next-pwa plugin

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- MapTiler account
- LocationIQ account
- OSM account (for POI editing)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd popi-warning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # MapTiler API Key
   NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key
   
   # LocationIQ API Key
   NEXT_PUBLIC_LOCATIONIQ_API_KEY=your_locationiq_api_key
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # OSM API Credentials
   OSM_LOGIN=your_osm_username
   OSM_PASSWORD=your_osm_password
   
   # OSM API URL (use sandbox for testing)
   OSM_API_URL=https://api06.dev.openstreetmap.org/
   ```

4. **Firebase Setup**
   
   - Create a Firebase project
   - Enable Authentication (Email, Google, Apple, Anonymous)
   - Enable Firestore Database
   - Enable Cloud Messaging
   - Add your domain to authorized domains

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with PWA meta tags
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AuthComponent.tsx  # Authentication modal
│   ├── MapComponent.tsx   # Map with MapLibre GL JS
│   ├── OverlayComponent.tsx # POI/Warning details overlay
│   ├── SearchComponent.tsx # Location search
│   └── SplashScreen.tsx   # App splash screen
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Firebase authentication context
├── lib/                   # Utility libraries
│   ├── api.ts            # API functions (OSM, LocationIQ)
│   ├── firebase.ts       # Firebase configuration
│   └── utils.ts          # Utility functions
└── types/                 # TypeScript type definitions
    └── index.ts          # Application types
```

## 🎯 Usage

### 1. Splash Screen
- Displays for 3 seconds on app launch
- Shows app logo and branding

### 2. Map Interface
- Interactive map with MapTiler tiles
- Click or long-press to select points
- GPS location button to center on current location

### 3. Search
- Search for addresses and POIs using LocationIQ
- Results displayed as numbered markers on map
- Click search results to navigate to location

### 4. POI Management
- Select a point on the map to view details
- Add new POIs to OpenStreetMap
- Correct existing POI information
- View OSM data and tags

### 5. Warning Management
- Add private warnings stored in Firebase
- Correct existing warnings
- Set severity levels and expiration dates
- View warning details and metadata

### 6. Authentication
- Sign in with email/password
- Social login (Google, Apple)
- Anonymous guest access
- User profile management

## 🔐 API Keys Setup

### MapTiler
1. Sign up at [MapTiler](https://www.maptiler.com/)
2. Get your API key from the dashboard
3. Add to `NEXT_PUBLIC_MAPTILER_API_KEY`

### LocationIQ
1. Sign up at [LocationIQ](https://locationiq.com/)
2. Get your API key from the dashboard
3. Add to `NEXT_PUBLIC_LOCATIONIQ_API_KEY`

### OpenStreetMap
1. Create account at [OpenStreetMap](https://www.openstreetmap.org/)
2. Generate API credentials
3. Add to `OSM_LOGIN` and `OSM_PASSWORD`
4. Use sandbox URL for testing: `https://api06.dev.openstreetmap.org/`

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Basic offline functionality
- **Push Notifications**: Firebase Cloud Messaging
- **App-like Experience**: Full-screen, no browser UI

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**
   - Check MapTiler API key
   - Verify network connection
   - Check browser console for errors

2. **Search not working**
   - Verify LocationIQ API key
   - Check API quota limits
   - Ensure proper CORS configuration

3. **Authentication issues**
   - Verify Firebase configuration
   - Check authorized domains
   - Ensure proper API keys

4. **OSM API errors**
   - Verify OSM credentials
   - Check API rate limits
   - Use sandbox for testing

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Note**: This is a test application. Use OSM sandbox environment for development and testing. Switch to production OSM API only when ready for live deployment.