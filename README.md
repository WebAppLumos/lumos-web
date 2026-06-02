# Lumos Web - Scholarship Curation Service

Lumos Web is a personalized scholarship curation service designed to help university students find and manage scholarship opportunities tailored to their profiles.

## 🚀 Overview

Lumos Web simplifies the scholarship search process by automatically checking eligibility based on a student's academic performance, financial status, and personal achievements.

## ✨ Key Features

- **Personalized Profile Management**: Users can manage their academic data, including:
  - Major and Grade
  - GPA and Earned Credits
  - Income Bracket (소득구간)
  - Language Proficiency (e.g., TOEIC scores)
  - Certificates and Awards
- **Automatic Eligibility Check**: Instantly verifies if a user qualifies for various scholarships:
  - **National Scholarships**: Type I (Income-linked)
  - **University Scholarships**: Merit-based, TOEIC improvement, and Certification-based.
- **Certificate Integration**: Uses a comprehensive database of certifications to match eligibility for specific awards.
- **User Authentication**: Integrated with Firebase for secure access (In development).

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/)
- **Styling**: Vanilla CSS

## 📁 Project Structure

```text
lumos-web/
├── public/              # Static assets (icons, logos)
├── src/
│   ├── assets/          # Project images and icons
│   ├── certifications.json # Certificate database
│   ├── firebase.js      # Firebase configuration and initialization
│   ├── Scholarship.jsx  # Main application logic and UI components
│   ├── Scholarship.css  # Styles for the scholarship curation page
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lumos-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📝 License

This project is private and intended for internal use.
