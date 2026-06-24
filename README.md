# Beginner-Friendly Full-Stack URL Shortener Service (Spring Boot 3 + React Vite)

Welcome to the **URL Shortener Service**, a high-quality, full-stack portfolio project designed specifically for internship submissions and GitHub developer portfolios. This project implements a reliable hash-collision alphanumeric URL shortener using a standard **Spring Boot 3 (Java 17)** backend with a layered architecture, and a modern **React + Vite** frontend.

---

## 🎨 Core Features
- **URL Shortening**: Optimizes long, complex URLs into randomized 6-character Base62 keys.
- **Link Resolution & Native Redirects**: Redirects shortened links with immediate HTTP 302 responses.
- **Active Mappings Database**: Keeps a scrollable dashboard listing all historically generated mappings.
- **Micro-Copy Clipboard Handler**: Single-tap clipboard copy featuring responsive status checkmarks and state transitions.
- **Dual API Sandbox Switch**: Easily toggle between local in-memory preview models and custom-configured deployed instances inside the user interface.

---

## 🏗️ Clean Layered Architecture
This project follows professional engineering patterns, enforcing separation of concerns between backend layers:

```
backend/
├── src/main/java/com/portfolio/urlshortener/
│   ├── controller/      # REST API Endpoints (receives mappings, does validation, manages CORS)
│   ├── service/         # Core Business Logic (Base62 hashing algorithm, URL sanitization, database collision handling)
│   ├── repository/      # JPA database connectors (interacts with H2 / PostgreSQL)
│   ├── entity/          # Hibernate Domain Schema mapping definition
│   └── dto/             # Data Transfer Objects strictly separating DB schemas from HTTP request payloads
```

### Layer Details:
1. **Controller Layer (`UrlController.java`)**:
   - Exposes `POST /api/urls` (shortens a link).
   - Exposes `GET /api/urls` (lists all active mappings in descending creation order).
   - Exposes `GET /r/{shortKey}` (performs immediate 302 Found browser redirects to target URLs).
2. **Service Layer (`UrlShortenerService.java`)**:
   - Sanitizes raw user inputs (validates HTTP/HTTPS protocols and formats).
   - Runs a randomized, cryptographic-secure Base62 generator.
   - Enforces DB collision avoidance (queries the repository in blocks of up to 10 attempts to guarantee unique keys).
3. **Repository Layer (`UrlRepository.java`)**:
   - Inherits `JpaRepository` to perform transaction locks, checks, and queries.
4. **Entity Layer (`UrlMapping.java`)**:
   - Defines table structures with specific indexes (`idx_short_key`) and length capabilities matching max browser parameters (2083 characters).

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Java Development Kit (JDK) 17**
- **Apache Maven** (or Maven wrapper inside Spring Starter tools)
- **Node.js** (v18 or above) & **npm**

---

### Step 1: Run the Backend (Spring Boot 3)
1. Open a terminal and navigate to the backend subdirectory:
   ```bash
   cd backend
   ```
2. Build the executable jar and run the application utilizing Maven:
   ```bash
   mvn clean spring-boot:run
   ```
3. The server will boot on **Port 8080** (`http://localhost:8080`).
4. **Local Database (H2)**: On local boots, the app starts a lightweight in-memory SQL database automatically. You can inspect tables directly by navigating to:
   - URL: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:urlshortenerdb`
   - Username: `sa`
   - Password: `password`

---

### Step 2: Run the Frontend (React + Vite)
1. Open a new terminal in the project root directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite local development pipeline:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:3000` to interact with the responsive dashboard.

---

## ☁️ Deployment Instructions

### 1. Deploy Backend (Render)
Render is perfect for hosting your Spring Boot portfolio.

1. Connect your Github Repository to **Render** and create a **Web Service**.
2. **Root Directory**: Set this to `backend` (or leave it blank if pushing just the backend repository).
3. **Runtime**: Select **Docker** or **Java (Maven/Gradle)**.
4. **Build Command**: `mvn clean package -DskipTests`
5. **Start Command**: `java -jar target/urlshortener-0.0.1-SNAPSHOT.jar`
6. Under **Environment Variables**, configure the following:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<neon-or-render-db-host>/urlshortener`
   - `SPRING_DATASOURCE_USERNAME` = `your_db_username`
   - `SPRING_DATASOURCE_PASSWORD` = `your_db_password`
   - `APP_URL` = `https://your-service-name.onrender.com` *(This domain is used in formatting the short link returned to clients)*

---

### 2. Deploy Frontend (Vercel or Netlify)
Vercel offers optimized CDN acceleration for your React clients.

1. Create a new site pointing to your frontend repository.
2. Ensure **Framework Preset** is configured for **Vite**.
3. Set your production environment variables:
   - `VITE_API_URL` = `https://your-service-name.onrender.com` *(Tells the React client where your live Spring Boot API is hosted)*
4. Run the build. Your client is now live!

---

## 📄 Repository License
This project is licensed under the Apache 2.0 License. It is open source, clean-coded, and ready to be loaded as a showcase piece on your GitHub accounts or submitted as part of your technical assessment internships.
