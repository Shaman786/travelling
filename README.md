# Host Palace - Luxurious Travel Experience

Welcome to **Host Palace**, a premium travel booking platform designed to provide a seamless and luxurious experience for travelers. This repository contains the source code for both the mobile application and the administrative dashboard.

## 📱 Project Structure

This is a monorepo containing:

- **`apps/mobile`**: The React Native (Expo) mobile application for travelers.
- **`apps/admin`**: The Next.js admin dashboard for managing bookings, consultations, and content.
- **`functions`**: Appwrite Cloud Functions for backend logic (payments, notifications).

## 🚀 Tech Stack

### Mobile App (`apps/mobile`)

- **Framework**: [Expo SDK 52](https://expo.dev) / React Native
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **UI Library**: [React Native Paper](https://reactnativepaper.com) + Custom Glassmorphism
- **Maps**: Mapbox
- **Animations**: Moti (powered by Reanimated)
- **State Management**: Zustand

### Admin Dashboard (`apps/admin`)

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Styling**: Tailwind CSS
- **Data Fetching**: Appwrite Web SDK

### Backend & Services

- **Database & Auth**: [Appwrite](https://appwrite.io)
- **Payments**: [Airwallex](https://www.airwallex.com)
- **Email**: Resend
- **Maps**: Mapbox GL

## 🛠 Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app (for mobile testing)

## 📦 Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd travelling
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## 🔑 Environment Variables

You need to configure the following environment variables. Create a `.env` file in the respective directories.

### Mobile App (`apps/mobile/.env`)

```ini
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_PLATFORM=com.travelling.app
EXPO_PUBLIC_MAPBOX_PUBLIC_KEY=your_mapbox_key
EXPO_PUBLIC_API_URL=your_api_url
APPWRITE_API_KEY=your_api_key
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=your_mapbox_secret_token
```

### Admin Dashboard (`apps/admin/.env.local`)

```ini
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=prodb
NEXT_PUBLIC_APPWRITE_BUCKET_ID=images
```

## ⚡ Running the Project

### Mobile App

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or run on emulator.

### Admin Dashboard

```bash
cd apps/admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Key Features

- **Dynamic Consulting**: AI-powered trip wizards (Trip, Visa, Budget).
- **Real-time Chat**: Connect with travel experts instantly.
- **Secure Payments**: Integrated Airwallex payment gateway.
- **Dashboard Control**: Full control over app content, bookings, and support tickets via the admin panel.
- **Dark Mode**: Beautiful dark theme support across the mobile app.

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
