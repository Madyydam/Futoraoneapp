# 📘 FutoraOne: Internal Documentation & Analysis

Welcome to the internal guide for the FutoraOne application. This document is designed to help you understand every part of your app—from how it looks to how it saves data—in simple, human language.

---

## 1️⃣ High-Level App Overview

### What is this app?
FutoraOne is a **social networking platform specifically for developers**. Think of it as a mix between Instagram (visual feed/stories), LinkedIn (professional profiles/projects), and a developer toolkit (AI roadmaps/tools).

### Main Features
- **Dynamic Feed**: Posts with images/videos, comments, and reactions.
- **Developer Profiles**: Custom banners, tech skills, XP/Level system, and verification badges (blue checkmarks).
- **Project Showcase**: A place to show off your builds and get feedback.
- **Real-time Chat**: Personal and group messaging.
- **AI Suite**: AI Mentor, AI Roadmap generator, and Content Enhancers.
- **Engagement**: Games, Leaderboards, and Daily Challenges.

### User Flow
1. **Welcome/Auth**: User lands on a beautiful welcome page and signs up/logs in.
2. **Dashboard (Feed)**: The central hub to see what others are building.
3. **Exploration**: Search for users, projects, or categories.
4. **Interaction**: Chat with peers, play games, or use AI tools to improve skills.
5. **Growth**: Earn XP by engaging, level up, and apply for verification.

### Overall Architecture
The app follows a modern **Serverless Architecture**:
- **Frontend**: React + Vite (The "Body" - what the user sees).
- **Backend/Database**: Supabase (The "Brain & Memory" - manages users, data, and logic).
- **AI Services**: Google Gemini (The "Intelligence" - powers the AI features).

---

## 2️⃣ Frontend Explanation (The "Body")

### Framework: React + Vite
- **React**: A library for building user interfaces using "Components" (reusable blocks of code).
- **Vite**: A modern build tool that makes development **extremely fast**. It "serves" your code instantly during development and "packages" it efficiently for production.

### Folder Structure Explained (`/src`)
- `components/`: Small, reusable UI pieces (Buttons, Cards, Modals).
- `pages/`: The main "screens" of your app (Feed, Profile, Chat).
- `hooks/`: Custom logic that can be reused across components (e.g., fetching feed data).
- `services/`: Specialized code to talk to external things (like Firebase Notifications).
- `assets/`: Static files like images, icons, and global styles.
- `lib/`: Helper tools (like the Supabase client connection).

### Routing (Navigation)
The app uses `react-router-dom` (found in `App.tsx`). It works like a GPS: when you click a link like `/profile`, it tells the app exactly which "Page" component to show on the screen without reloading the whole browser.

### State Management
- **React Query**: Used to manage data from the database. It handles loading states, caching (remembering data so it doesn't have to fetch again), and background updates.
- **Context API**: Used for global info, like whether a user is online (`UserPresenceContext`).

---

## 3️⃣ Backend Explanation (The "Brain")

### How it's structured: Supabase
The app doesn't have a traditional "Backend Server" (like Express or Python). Instead, it uses **Supabase**, which provides everything as a service:
1. **Authentication**: Manages signups, logins, and passwords securely.
2. **PostgREST**: Automatically turns your database tables into an API.
3. **Edge Functions**: Small snippets of code that run in the cloud for specific tasks (like talking to AI).

### API Flow
1. **Request**: The Frontend asks: "Give me the latest posts."
2. **Processing**: Supabase checks if the user is allowed to see them (using RLS policies).
3. **Response**: Supabase sends the data back as JSON (a simple text format).

---

## 4️⃣ API Documentation

Since we use Supabase, most APIs are automatic. However, here are the key "Custom" endpoints (Edge Functions):

| Endpoint | Method | Purpose | Who uses it? |
| :--- | :--- | :--- | :--- |
| `ai-mentor` | POST | Answers tech questions using Gemini AI | AI Mentor Chat |
| `manage-verification` | POST | Handles badge applications | Admin/User Profile |
| `send-fcm-notification` | POST | Sends push notifications to phones | System/Messaging |

---

## 5️⃣ Database Explanation (The "Memory")

### Database: PostgreSQL
A powerful, reliable database that stores everything in organized tables.

### Key Tables
- **profiles**: Stores user info (names, bio, XP, level, avatar).
- **posts**: The actual content users share (text, images, video links).
- **messages**: Chat history between users.
- **projects**: Detailed showcases of developer work.
- **follows**: Who is following whom.
- **game_stats**: Scores and wins for the built-in games.

### Row Level Security (RLS) 🛡️
This is the "Security Guard" of your data. It ensures that:
- You can only edit **your own** profile.
- You can only read messages in chats **you are part of**.
- Public posts are viewable by **everyone**.

### Database Logic (Functions & Triggers)
- **Triggers**: Automated actions. For example, when a user signs up, a trigger automatically creates a entry in the `profiles` table.
- **Functions**: Custom SQL code that calculates things like "Who is the top user on the leaderboard?"

### Migrations
Migrations are like "Save Points" for your database structure. They are SQL files in `supabase/migrations` that track every change made to the tables over time.

---

## 6️⃣ File-by-File Config Explanation

- **`package.json`**: The "Shopping List" of the project. It lists every library the app needs to run.
- **`vite.config.ts`**: The "Instruction Manual" for Vite. It tells Vite how to build the app and which plugins to use.
- **`tsconfig.json`**: The "Rules" for TypeScript. It ensures the code is written correctly and helps catch bugs early.
- **`.env`**: The "Vault". It stores secret keys (like Supabase URLs) that shouldn't be shared publicly.
- **`eslint.config.js`**: The "Code Police". It checks your code for messy bits or common mistakes.

---

## 7️⃣ Technologies & Languages Used

- **TypeScript**: A "Supercharged" version of JavaScript. It adds "types" (like saying a variable must be a number), which prevents 90% of common coding errors.
- **Tailwind CSS**: A styling tool that lets us design the app directly in the code using simple classes (like `bg-blue-500` for a blue background).
- **Shadcn/UI**: A collection of beautiful, pre-made components (buttons, input boxes) that give the app its premium feel.
- **Framer Motion**: The "Animator". It powers the smooth transitions and pop-up effects.

---

## 8️⃣ Build, Run & Deploy Flow

### Local Development
When you run `npm run dev`:
1. Vite starts a local web server (usually at `localhost:8080`).
2. It watches your files. The moment you save a change, the browser updates instantly!

### Production Build
When you run `npm run build`:
1. Vite shrinks and "minifies" your code (makes it tiny and fast).
2. It creates a `dist` folder.
3. This folder is then uploaded to a hosting provider (like Vercel or Netlify) to make the app live for everyone.

---

## 9️⃣ Dependency & Risk Analysis

### ⚠️ Critical Files (Be Careful!)
- **`src/lib/supabase.ts`**: If this breaks, the app loses its connection to the database.
- **`src/App.tsx`**: The main entry point. A small mistake here can break every single page.
- **`supabase/migrations/`**: Changing old migrations can corrupt your database structure. Always create **new** migrations instead of editing old ones.

### ✅ Safe to Edit
- **`src/components/`**: Feel free to tweak the look of buttons or cards.
- **`src/pages/`**: Adding new text or images to pages is generally safe.

### Common Mistakes to Avoid
1. **Leaking Keys**: Never put your secret keys directly in the code; always use the `.env` file.
2. **RLS Errors**: If data isn't showing up, 99% of the time it's because an RLS policy is blocking it.

---

## 🎯 Summary
FutoraOne is a high-performance, modern application built with the best tools available today. It’s designed to be fast, secure, and easy to scale. By following this guide, you now have the foundation to navigate the codebase with confidence!
