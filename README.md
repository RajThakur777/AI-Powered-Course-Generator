# AI-Powered Course Generator

An advanced, full-stack educational platform that uses AI to generate comprehensive, structured courses on any topic. 

This application dynamically creates course outlines, detailed lessons, interactive quizzes, multi-lingual translations (Hinglish), text-to-speech audio, and contextual YouTube video suggestions to provide a rich, multi-modal learning experience.

## ✨ Features

- **AI Course Generation**: Enter any topic and receive a fully structured curriculum with modules and lessons using Google's Gemini AI.
- **Rich Lesson Content**: AI generates detailed lesson plans containing paragraphs, code snippets, lists, and callouts.
- **Interactive Quizzes**: Each lesson can include AI-generated Multiple Choice Questions (MCQs). Quizzes are fully interactive with instant feedback and progress tracking.
- **Multi-lingual Support**: Translate complex technical lessons into Hinglish with a single click.
- **Text-to-Speech (Audio)**: Listen to your lessons on the go! Automatically generate high-quality audio representations of the lesson text.
- **Contextual Video Search**: Automatically fetches relevant, highly-rated YouTube videos to supplement the text-based learning material.
- **PDF Export**: Download lessons as beautiful PDF documents for offline reading.
- **Progress Tracking**: Track your completion and quiz scores across courses, modules, and lessons.
- **Secure Authentication**: User authentication and session management powered by Auth0.

---

## 🏗️ Project Architecture & Folder Structure

This project follows a decoupled **Client-Server architecture** (Frontend in React, Backend in Node.js/Express) and uses a **Service-Oriented Architecture** on the backend to separate business logic from routing.

```text
AI-Powered-Course-Generator/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets (icons, favicons)
│   ├── src/                    
│   │   ├── assets/             # Images and local UI assets
│   │   ├── components/         # Reusable UI components (Sidebar, LessonRenderer, etc.)
│   │   ├── pages/              # Main view containers (Home, Course, Lesson)
│   │   ├── utils/              # Helper functions (api.js for Axios config)
│   │   ├── App.jsx             # Main React component and Route definitions
│   │   ├── index.css           # Global CSS variables and resets
│   │   └── main.jsx            # React entry point and Context Providers
│   ├── vite.config.js          # Vite bundler configuration
│   └── package.json            # Frontend dependencies
│
├── server/                     # Backend Node.js/Express Application
│   ├── config/                 # Application configuration (db.js, env.js)
│   ├── controllers/            # Request handlers (processes req/res)
│   ├── middleware/             # Express middlewares (Auth, Error handling)
│   ├── models/                 # Mongoose schemas (User, Course, Module, Lesson, Progress)
│   ├── routes/                 # API route definitions (maps endpoints to controllers)
│   ├── services/               # Core business logic & API integrations
│   │   ├── audio.service.js             # Gemini Text-To-Speech integration
│   │   ├── courseGeneration.service.js  # Main logic for structuring AI courses
│   │   ├── gemini.service.js            # Base Google GenAI setup and fallback configs
│   │   ├── translation.service.js       # Hinglish translation prompt logic
│   │   └── youtube.service.js           # YouTube Data API video searching & caching
│   ├── utils/                  # Backend utilities (asyncHandler, AppError)
│   ├── validators/             # Zod validation schemas for request bodies
│   ├── app.js                  # Express app initialization and global middlewares
│   ├── server.js               # Backend entry point (starts HTTP server)
│   └── package.json            # Backend dependencies
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 with Vite
- **Styling & UI**: Chakra UI, Lucide React (Icons)
- **Routing**: React Router DOM
- **Authentication**: Auth0 React SDK
- **Utilities**: html2canvas & jsPDF (for PDF generation)

### Backend (`/server`)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gen AI SDK (Gemini Models: `gemini-3.5-flash-lite`, `gemini-3.1-flash-tts-preview`)
- **External APIs**: YouTube Data API v3
- **Validation**: Zod
- **Audio Processing**: `wav` for PCM to WAV conversions

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (Atlas or local)
- Google Gemini API Key
- YouTube Data API v3 Key
- Auth0 Domain & Client ID

### 1. Clone the repository

```bash
git clone https://github.com/RajThakur777/AI-Powered-Course-Generator.git
cd AI-Powered-Course-Generator
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure the following variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string

# Auth0 Configuration
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience

# External APIs
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.5-flash
YOUTUBE_API_KEY=your_youtube_api_key

CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory for your frontend variables:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:5173` in your browser.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
