# FriendFlix 🎬🍿

FriendFlix is a modern, social movie-discovery platform designed to bring movie lovers together. Built with a sleek, premium glassmorphic UI, FriendFlix allows users to find new movies, match with friends who share similar tastes, and chat in real-time.

## ✨ Features

- **Movie Discovery & Swiping:** Browse through movies powered by the **TMDB API**, select your favorites, and build your personalized watchlist.
- **Friend Matching:** Discover and connect with other users based on your shared movie preferences.
- **Real-time Chat:** Seamless direct messaging with friends and interactive group chats.
- **Custom User Profiles:** Manage your profile, update your avatar, and showcase your top movie picks.
- **Movie Lounges & Groups:** Create dedicated groups to discuss your favorite genres or plan watch parties.
- **Premium UI/UX:** A state-of-the-art dark theme featuring glassmorphism, dynamic micro-animations, and a highly responsive design.

## 🔗 Live Demo

Check out the live application here: **[https://friendflix-nu.vercel.app/](https://friendflix-nu.vercel.app/)**

## 🛠️ Technology Stack

- **Frontend Framework:** React 18
- **Animations:** Framer Motion
- **Styling:** Custom Vanilla CSS (Glassmorphism & Dark Mode)
- **Backend / Database:** Firebase (Authentication, Firestore, Storage)
- **Movie Data API:** [TMDB (The Movie Database)](https://www.themoviedb.org/)
- **API Client:** Axios
- **Build Tool:** Create React App (with CRACO)

## 🚀 Getting Started

Follow these steps to set up the project locally:

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd friendflix-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Ensure your Firebase credentials are set up. Create a `.env` file in the root directory and add your Firebase configuration variables (e.g., `REACT_APP_FIREBASE_API_KEY`, etc.).

4. **Start the development server:**
   ```bash
   npm start
   ```
   The app will automatically open in your browser at [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

- `src/components/`: Contains all the reusable React components (Navbar, Chat, MovieSwiper, Toast, etc.) along with their dedicated CSS files.
- `src/pages/`: Main application views (Home, Login, Register, MatchedFriends).
- `src/firebase.js`: Firebase initialization and configuration.

## 📜 Available Scripts

In the project directory, you can run:
- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production to the `build` folder.

---
*Designed and built for an immersive movie-sharing experience.*
