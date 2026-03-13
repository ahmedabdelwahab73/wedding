<div align="center">
  <img src="./front/public/logowhite.png" alt="Mimo_photography" width="200"/>

  # 📸 Mimo photography - Professional Photography Platform

  <p>
    <strong>A comprehensive modern platform for booking photography sessions and creating custom image packages.</strong>
  </p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
</div>

<br />

## ✨ Features

*   **🌐 Full Localization:** Seamlessly supports Arabic (RTL) and English (LTR) using `next-intl`.
*   **� Photography Packages:** Browse curated photography sessions and packages.
*   **🎨 Custom Packages (Build Your Own):** Users can customize their own photography packages by selecting specific add-ons and services.
*   **🖼️ Portfolio & Galleries:** Beautiful display of high-quality photographs and previous works.
*   **🛠️ Advanced Admin Dashboard:** A robust backend system to manage packages, images, reviews, users, and bookings efficiently.
*   **📱 Responsive Design:** Fully responsive and stunning UI built with Next.js, SCSS, and Tailwind CSS.
*   **🔒 Secure Authentication:** JWT-based user and admin login.
*   **📅 Booking System:** Easy integration for users to book photography sessions.

## 🛠️ Project Architecture

This project is divided into two main folders:

*   `/front`: The frontend application powered by Next.js 15.
*   `/back`: The backend API built on Node.js and Express.js.

### Frontend Tech Stack (`/front`)
*   **Framework:** Next.js (App Router)
*   **Styling:** SCSS, Tailwind CSS v4, Framer Motion
*   **Localization:** `next-intl`
*   **State Management:** React Hooks
*   **Language:** TypeScript

### Backend Tech Stack (`/back`)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB
*   **Authentication:** JWT

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/ahmedabdelwahab73/mimo.git
cd mimo
```

### 2. Frontend Setup

Open a terminal and navigate to the frontend folder.

```bash
cd front
npm install
# or yarn install / pnpm i

# Run the development server
npm run dev
```

Your frontend will be running at [http://localhost:3000](http://localhost:3000).

### 3. Backend Setup

Open a new terminal window and navigate to the backend folder.

```bash
cd back
npm install
# or yarn install / pnpm i

# Make sure you have your .env file configured with MongoDB URI and JWT secrets before starting.

# Run the backend server
npm run dev
```

Your backend API will typically run on `http://localhost:5000` (depending on your `.env` configuration).

---

## 📂 Folder Structure

```plaintext
mimo/
├── back/               # Backend API Source Code
│   ├── config/         # Database and app config
│   ├── controllers/    # Route controllers
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   └── server.js       # Entry point
│
└── front/              # Frontend Web App Source Code
    ├── messages/       # Translations (en.json, ar.json)
    ├── public/         # Static assets
    ├── src/
    │   ├── app/        # Next.js App Router (contains [locale] routing)
    │   ├── components/ # Reusable React components
    │   └── styles/     # Global and modular SCSS styles
    ├── next.config.ts  # Next.js Configuration
    └── tailwind.css    # Tailwind CSS Configuration
```

## 👨‍💻 Developer Note
This repository contains the complete codebase for the `Mimo Travel` project. When deploying, the frontend can be hosted easily on Vercel or Netlify, while the backend can be hosted on platforms like Render, Heroku, or an AWS EC2 instance.
