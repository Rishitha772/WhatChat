# WhatChat – Full-Stack Messaging & Memory Vault Application

WhatChat is a real-time messaging and private personal memory vault application built with a separate **React frontend**, a **Spring Boot REST/WebSocket backend**, and a **Native Android application**.

---

## 📁 Repository Architecture

The project has been cleanly separated into dedicated modules:

```text
WhatChat-main/
├── backend/                       # Spring Boot Backend (Java 17, Spring Security, MongoDB Atlas)
│   ├── src/main/java/             # Controllers, Services, Documents, Repositories, Security
│   ├── src/main/resources/        # application.yml
│   ├── src/test/java/             # Unit and integration test suites
│   ├── .whatchat_data/            # Local persistent fallback data
│   └── pom.xml                    # Maven build configuration
│
├── frontend/                      # React Frontend (React 19, TypeScript, Vite 8, Tailwind CSS)
│   ├── src/
│   │   ├── assets/                # Visual assets and icons
│   │   ├── components/            # AuthPage (purple aesthetic), Chats, Contacts, My Space, Profile
│   │   ├── context/               # WhatChatContext state management
│   │   ├── services/              # api.ts (Dual JWT Bearer + Cookie transport)
│   │   ├── types/                 # TypeScript interfaces and DTOs
│   │   ├── utils/                 # Phone normalization utilities (E.164)
│   │   ├── App.tsx                # Main view router and auth gate
│   │   ├── index.css              # Custom styling, glassmorphism, responsive styles
│   │   └── main.tsx               # React DOM root
│   ├── index.html                 # Single page entry HTML
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tsconfig.json              # TypeScript compilation configuration
│   └── vite.config.ts             # Vite server with /api and /ws reverse proxies
│
├── android/                       # Native Android Application (Java, XML, Android SDK)
│   ├── app/                       # Android application source, manifests, and layouts
│   └── WhatChat-debug.apk         # Compiled debug APK
│
├── .whatchat_data/                # Shared local resilient backup storage
├── .env                           # Central environment variables (MongoDB URI, SMTP credentials)
├── .env.example                   # Environment configuration template
├── package.json                   # Root workspace launcher (delegates npm run dev / build)
├── start-all.bat                  # 1-Click launcher for both Backend and Frontend
├── start-backend.bat / .ps1       # Dedicated launcher for Spring Boot Backend
└── start-dev.bat / .ps1           # Dedicated launcher for React Frontend
```

---

## 🚀 Quick Start (1-Click Run)

### Option 1: Start Both Services Together
Double-click **`start-all.bat`** from the root folder.
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Backend Status:** [http://localhost:8080/api/v1/mongo/status](http://localhost:8080/api/v1/mongo/status)

### Option 2: Run Separately from CLI

#### 1. Start the Backend
```powershell
# From repository root
.\start-backend.ps1

# Or from the backend directory
cd backend
mvn spring-boot:run
```

#### 2. Start the Frontend
```powershell
# From repository root
npm run dev

# Or from the frontend directory
cd frontend
npm run dev
```

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT + HTTP-Only Cookies), Spring Mail
- **Database:** MongoDB Atlas (with local resilient fallback in `.whatchat_data/`)
- **Real-Time:** WebSockets / STOMP (`/ws`)
- **Mobile:** Native Android SDK (Java, XML layouts, Retrofit, Glide)

---

## 🧪 Testing & Building

### Frontend Build
```powershell
npm run build
```

### Backend Unit Tests
```powershell
mvn test -f backend/pom.xml
```
*(All 20 unit tests pass with 0 failures and 0 errors).*
