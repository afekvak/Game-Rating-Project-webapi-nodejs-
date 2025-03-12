# 🎮 AI-Powered Video Game Recommender

Welcome to the **AI-Powered Video Game Recommender**, a full-stack web application that allows users to explore,
 search, and get AI-generated recommendations for video games. The platform integrates **RAWG API** for game data,
 **YouTube API** for trailers and gameplay, and **Gemini AI API** for personalized recommendations.

---

## 🚀 Features

### 🔹 Authentication & User Management
- User **registration, login, and logout** with JWT-based authentication.
- **Profile management**: Users can update their profile picture, username, and password.
- **Last visited games tracking** in the user's profile.
- **Game rating system**, allowing users to rate games and view their ratings.

### 🔍 Game Exploration & Search
- **Explore page** displaying trending games fetched from RAWG API.
- **Live search with auto-suggestions** based on user input.
- **Game details page** with trailers, descriptions, ratings, and purchase links.

### 🧠 AI-Powered Recommendations
- Users receive **personalized recommendations** based on their game ratings using **Gemini AI API**.
- **Alternative recommendation fallback** from RAWG API if AI is unavailable.

### 🛒 Game Purchase Links
- **Store links** are fetched from RAWG API for platforms like Steam, PlayStation, Xbox, and more.
- Users can view **all available purchase options** on a dedicated page.

### 🌟 Fully Responsive UI & User-Friendly Experience
- **Modern, stylish UI** with animations and interactive elements.
- **Fully responsive design** for desktop and mobile.

---

## 🏗️ Project Structure

📆 AI-Game-Recommender

📂 project-root/
├── 📂 config
│   ├── db.js               # MongoDB connection setup
│
├── 📂 controllers
│   ├── authController.js   # Handles user authentication (login, register, logout)
│   ├── gameController.js   # Fetches game data from RAWG API, YouTube trailers, and last-viewed games
│   ├── profileController.js # Manages user profile, ratings, and recently viewed games
│   ├── recommendationController.js # Uses Gemini AI to generate game recommendations
│   ├── ratingController.js  # Handles game rating submissions and deletion
│   ├── viewController.js    # Handles rendering for views (login, register, search, home)
│
├── 📂 middleware
│   ├── authMiddleware.js   # JWT-based authentication middleware
│
├── 📂 models
│   ├── User.js             # User schema (username, email, password, profile picture, last viewed games)
│   ├── Rating.js           # Rating schema (game ID, user, rating value)
│
├── 📂 public
│   ├── 📂 images           # Stores default images and logos
│   ├── 📂 js               # Contains frontend JavaScript files (search, rating)
│   ├── 📂 css              # Contains stylesheets (global.css, animations.css)
│
├── 📂 routes
│   ├── authRoutes.js       # Routes for authentication (login, register, logout)
│   ├── gameRoutes.js       # Routes for game-related pages (explore, game-info, stores)
│   ├── profileRoutes.js    # Routes for user profile management
│   ├── ratingRoutes.js     # Routes for submitting and deleting ratings
│   ├── recommendationRoutes.js # Routes for AI-powered game recommendations
│   ├── viewRoutes.js       # Routes for rendering HTML pages
│
├── 📂 services
│   ├── youtubeService.js   # Fetches game trailers and gameplay videos from YouTube API
│   ├── geminiService.js    # Fetches game recommendations from Gemini AI API
│
├── 📂 views
│   ├── 📂 partials         # Header, footer, and navbar components
│   ├── home.ejs            # Home page with popular games and AI recommendations
│   ├── explore.ejs         # Displays game gallery from RAWG API
│   ├── game-info.ejs       # Displays game details, trailers, ratings, and purchase links
│   ├── game-stores.ejs     # Displays available store links for purchasing a game
│   ├── login.ejs            # User login page
│   ├── register.ejs         # User registration page
│   ├── profile.ejs         # User profile page with last viewed games and ratings
│   ├── recommendations.ejs # AI-powered game recommendations page
│   ├── search.ejs          # Game search page with live suggestions
│
├── .env                    # Environment variables (API keys, database URL, JWT secret)
├── app.js                  # Express server setup and route handling
├── server.js               # Express server setup 
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation (this file)

---

## ⚙️ Technologies Used

### 🌐 Frontend
- **EJS (Embedded JavaScript)** for dynamic rendering.
- **CSS & Animations** for modern UI styling.

### 🖥️ Backend
- **Node.js & Express.js** for server-side logic.
- **MongoDB & Mongoose** for database management.
- **JWT (JSON Web Tokens)** for user authentication.
- **bcrypt.js** for password encryption.

### 🔌 External APIs
- **RAWG API** for fetching game data.
- **YouTube API** for fetching game trailers and gameplay videos.
- **Gemini AI API** for AI-powered game recommendations.

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/game-recommender.git
cd game-recommender
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAWG_API_KEY=your_rawg_api_key
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4️⃣ Start the Server
```sh
npm start
```

---

## 📌 API Routes

### 🔹 Authentication
| Method | Endpoint        | Description                |
|--------|---------------|----------------------------|
| POST   | `/auth/register` | Register new user       |
| POST   | `/auth/login`    | User login               |
| GET    | `/auth/logout`   | User logout              |

### 🔹 Games
| Method | Endpoint             | Description                         |
|--------|----------------------|-------------------------------------|
| GET    | `/games/explore`      | Fetch trending games from RAWG API |
| GET    | `/games/game-info/:id` | Fetch specific game details       |
| GET    | `/games/:id/stores`   | Fetch game store purchase links   |

### 🔹 Ratings
| Method | Endpoint            | Description              |
|--------|-------------------|--------------------------|
| POST   | `/ratings/submit`  | Submit a new game rating |
| POST   | `/ratings/delete`  | Delete a user rating     |

### 🔹 Recommendations
| Method | Endpoint            | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/recommendations` | Get AI-powered game recommendations |

---

## 🎯 Future Improvements
- **Game wishlists & favorites** for users.
- **Community reviews & comments** on games.
- **Real-time chat system** for discussing recommendations.
- **More AI models** for enhanced recommendations.

---


## 🙌 Credits & Contributions
- Developed by **Afek Vaknin** 🎮.
- Special thanks to **RAWG**, **YouTube**, and **Gemini AI** for providing APIs.

---

## ⭐ Support & Feedback
If you have any questions or feedback, feel free to open an **issue** or **pull request** on GitHub!

Happy gaming! 🎮🔥

