# Election Transparency Platform - Installation Guide

## Overview
This guide explains how to install, configure, and run the full election transparency platform from scratch. It covers the mobile app, web dashboard, API gateway, AI processor, and database.

---

## 1. Prerequisites

Required software:
- **Node.js 18+**
- **npm 8+**
- **PostgreSQL 13+**
- **Redis** (optional, but required for Redis-based features)
- **Expo CLI** (mobile development)
- **Docker & Docker Compose** (optional)

Recommended tools:
- **Git**
- **Visual Studio Code**
- **nvm** (Node version manager)

---

## 2. Clone the Repository

```bash
cd C:\Users\bened\OneDrive\Desktop
git clone https://github.com/Bened-130/Transparecy-pltform.git
cd Transparecy-pltform
```

---

## 3. Install Dependencies

### 3.1 Root install

```bash
npm install
```

If the root install fails, install each package separately.

### 3.2 Separate package install (recommended when there are dependency conflicts)

```bash
cd packages/shared-types
npm install

cd ../../apps/mobile
npm install --legacy-peer-deps

cd ../webs
npm install

cd ../../services/api-gateway
npm install

cd ../ai-processor
npm install

cd ../../database
npm install
```

### 3.3 If dependency installation still fails

Use legacy peer deps in the package folder that fails:

```bash
npm install --legacy-peer-deps
```

Or force install only when necessary:

```bash
npm install --force
```

---

## 4. Configure Environment Variables

Create the following `.env` files.

### `services/api-gateway/.env`

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/election_transparency
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
```

### `services/ai-processor/.env`

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/election_transparency
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
NODE_ENV=development
```

### `apps/mobile/.env`

```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

---

## 5. Database Setup

### 5.1 Install PostgreSQL

On Windows, you can use Chocolatey:

```bash
choco install postgresql
```

Or download from:

https://www.postgresql.org/download/

### 5.2 Create the database

```bash
createdb election_transparency
```

If `createdb` is not available, use the full connection string with `psql`.

### 5.3 Run migrations

```bash
cd database
npm run migrate
```

---

## 6. Running the Platform

### 6.1 Start services individually

```bash
# API Gateway
cd services/api-gateway
npm run dev

# AI Processor
cd ../ai-processor
npm run dev

# Web dashboard
cd ../../apps/webs
npm run dev

# Mobile app
cd ../mobile
npm start
```

### 6.2 Start all services with Docker Compose (optional)

```bash
docker-compose up -d
```

---

## 7. Testing and Validation

### 7.1 Basic validation scripts

Use these scripts for structure and syntax validation without full test dependencies.

```bash
cd apps/mobile
node test-minimal.js

cd ../webs
node test-minimal.js
```

### 7.2 Full tests

```bash
cd apps/mobile
npm test

cd ../webs
npm test
```

If tests fail because packages are missing, install the app dependencies first.

---

## 8. Troubleshooting

### Problem: `npm install` fails

Try:

```bash
npm install --legacy-peer-deps
```

If a specific package version is missing, locate the package folder and adjust the dependency version or install with `--force`.

### Problem: Expo app does not start

```bash
cd apps/mobile
npm start -- --clear
```

### Problem: Port conflicts

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problem: Database connection fails

```bash
psql $DATABASE_URL -c "SELECT 1;"
```

---

## 9. Recommended Start Order

1. Start the API gateway
2. Start the AI processor
3. Start the web dashboard
4. Start the mobile app

---

## 10. Notes

- `apps/mobile` uses Expo and React Native.
- `apps/webs` uses Next.js.
- `services/api-gateway` handles auth, uploads, and WebSockets.
- `services/ai-processor` handles OCR and vote processing.
- `packages/shared-types` contains shared Zod schemas and TypeScript types.

---

## 11. Summary

### Install from scratch

```bash
cd C:\Users\bened\OneDrive\Desktop\Transparecy-pltform
npm install
```

If that fails:

```bash
cd packages/shared-types && npm install
cd apps/mobile && npm install --legacy-peer-deps
cd apps/webs && npm install
cd services/api-gateway && npm install
cd services/ai-processor && npm install
cd database && npm install
```

### Configure environment

Create `.env` files in `services/api-gateway`, `services/ai-processor`, and `apps/mobile`.

### Run

```bash
cd services/api-gateway && npm run dev
cd services/ai-processor && npm run dev
cd apps/webs && npm run dev
cd apps/mobile && npm start
```

### Validate

```bash
cd apps/mobile && node test-minimal.js
cd apps/webs && node test-minimal.js
```

Happy coding!
 