# 🎓 TestExplorer — Comprehensive CBT & College Predictor EdTech Platform

> **TestExplorer** is a next-generation, multi-tenant Computer-Based Testing (CBT) and College/Rank Prediction ecosystem tailored for major competitive examinations across India, including **JEE Main, JEE Advanced, NEET-UG, CUET-UG, and CLAT-UG**. 
>
> Built for students, educational institutions, partner schools, and coaching academies, TestExplorer integrates authentic exam simulation, multi-counseling AI prediction algorithms, multi-tenant white-label branding, and Gemini AI-powered question digitisation.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [Primary Use Cases & Features](#-primary-use-cases--features)
- [Complete Tech Stack](#-complete-tech-stack)
- [System Architecture & Multi-Tenancy](#-system-architecture--multi-tenancy)
- [Directory Structure](#-directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Environment Configuration](#-environment-configuration)
- [User Roles & Permissions](#-user-roles--permissions)
- [Scripts & Maintenance](#-scripts--maintenance)

---

## 🌟 Executive Overview

TestExplorer solves three major challenges in competitive test prep and school management:
1. **Realistic CBT Exam Practice**: Delivers authentic test-taking environments that emulate actual NTA/national exam interfaces with negative marking, timers, LaTeX math rendering, question palettes, and immediate analytical scorecards.
2. **Data-Driven Rank & College Prediction**: Uses historical counseling datasets (JoSAA, MCC, Central Universities) to accurately map student marks/percentiles to expected ranks and seat allocations across categories, states, and gender quotas.
3. **Institutional White-Labeling**: Allows schools, institutes, and academic partners to deploy their own branded test portal under custom subdomains (`<school>.testexplorer.com`) or slug routes (`testexplorer.com/<school-slug>`) with custom logos, principal messages, announcements, and managed student batches.

---

## 🚀 Primary Use Cases & Features

### 1. 🖥️ Computer-Based Test (CBT) Simulation Engine
- **NTA-Style Interface**: Exact emulation of actual national exam platforms with responsive Question Palette (Answered, Not Answered, Marked for Review, Answered & Marked for Review).
- **Exam Blueprints & Dynamic Mock Tests**: Timed assessments with automated section transitions (Physics, Chemistry, Mathematics, Biology, Legal Studies, General Test, etc.).
- **LaTeX / KaTeX Mathematical Notation**: High-fidelity rendering of complex mathematical, chemical, and physical formulas directly within question stems, options, and explanations.
- **Detailed Instant Analytics**: Instant score calculation, accuracy percentages, time spent per question, topic-level weaknesses, and rank projections.

### 2. 🎯 AI Rank & College Predictor
- **Multi-Exam Coverage**:
  - **JEE Main**: JoSAA counseling, NITs, IIITs, GFTIs.
  - **JEE Advanced**: IIT seat allotment algorithms.
  - **NEET-UG**: Medical (MBBS/BDS) colleges via MCC & State counseling.
  - **CUET-UG**: Delhi University (DU), BHU, JNU, and Central Universities.
  - **CLAT-UG**: National Law Universities (NLUs).
- **Multi-Mode Input**: Accepts **Raw Marks**, **Percentile**, or **Rank**.
- **Quota & Category Precision**: Adjusts recommendations based on Home State vs. Other State quotas, Reservation categories (`OPEN`, `OBC-NCL`, `EWS`, `SC`, `ST`, `PwD`), and Gender pools (Gender-Neutral vs. Female-Only).
- **College Categorization**: Segregates predictions into **Safe**, **Target**, and **Dream** institutions based on historical closing rank thresholds.

### 3. 🏫 White-Label School Multi-Tenancy
- **Dynamic Tenant Detection**: Automated domain/subdomain resolution via Next.js middleware and headers.
- **Custom Institutional Identity**: Dedicated school landing pages featuring school logos, hero imagery, principal welcome letters, announcements, and testimonials.
- **Institutional Management**: School administrators can manage their registered students, assign exclusive test series, track class-level performance, and broadcast notices.

### 4. 🤖 AI-Powered Question Extraction & Bank
- **Gemini OCR Extraction**: Upload test papers in PDF/scan format and leverage Google Gemini Generative AI (`@google/generative-ai`) to extract structured questions, choices, answers, and solution explanations.
- **Bulk Uploads**: Import question banks seamlessly through Excel/CSV (`xlsx`, `csv-parse`) parsing engines.
- **Hierarchical Curriculum Tree**: Structure questions cleanly across **Streams** $\rightarrow$ **Courses** $\rightarrow$ **Subjects** $\rightarrow$ **Chapters** $\rightarrow$ **Topics** $\rightarrow$ **Tags**.

### 5. 📚 Learning Management & Editorial CMS
- **Subject Practice Modules**: Topic-wise practice modes to allow self-paced learning prior to full-length mocks.
- **Integrated Blog CMS**: Full editorial platform supporting rich text (`react-quill-new`), categorization, OpenGraph previews, and automated JSON-LD structured schema for search engine optimization (SEO).
- **Dynamic Leaderboards**: Fosters student engagement through batch, school, and global test rankings.

---

## 🛠️ Complete Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16** (App Router) | Server-side rendering (SSR), Server Actions, static optimization, and API route handlers. |
| **Language** | **TypeScript 5** | Strict type-safety across components, server logic, and database schemas. |
| **Frontend Core** | **React 19** | Modern UI rendering and concurrent features. |
| **Styling & Design** | **Tailwind CSS v4**, Radix UI Primitives, Lucide Icons | Responsive styling, accessible interactive components, and consistent iconography. |
| **Typography & Animation** | `@tailwindcss/typography`, `tw-animate-css` | Rich editorial blog rendering and micro-animations. |
| **Database & ORM** | **MySQL**, **Prisma ORM 5.22** | Relational data persistence, schema migrations, and type-safe query generation. |
| **Authentication** | **NextAuth.js v4**, `bcryptjs` | JWT-based session handling, credentials provider, secure salted password hashing, and role checks. |
| **Math & Formula Rendering** | **KaTeX**, `rehype-katex`, `remark-math` | High-performance client and server rendering of LaTeX equations. |
| **Content & Markdown** | `react-markdown`, `marked`, `react-quill-new` | Markdown processing and rich WYSIWYG editorial authoring. |
| **Data Visualization** | **Chart.js**, `react-chartjs-2` | Interactive student score distribution, accuracy charts, and analytics. |
| **AI & Document Processing** | `@google/generative-ai` (Gemini API), `pdfjs-dist` | Automated PDF question extraction, OCR, and AI content ingestion. |
| **Spreadsheets & Data Ingestion**| `xlsx` (SheetJS), `csv-parse` | Ingestion and export of bulk question banks and counseling cutoff datasets. |
| **Notifications** | **Sonner** | Modern toast notifications and operational feedback. |

---

## 🏛️ System Architecture & Multi-Tenancy

```mermaid
graph TD
    User([End User / Student / School Admin]) --> MW[Next.js Middleware]
    
    subgraph Routing & Tenancy
        MW -->|Subdomain or /slug| TenantCheck{Identify Tenant}
        TenantCheck -->|White-Label Subdomain| SchoolPortal[School Landing Page / Custom Portal]
        TenantCheck -->|Main Domain| MainPortal[TestExplorer Central Platform]
    end

    subgraph Authentication & Access
        SchoolPortal & MainPortal --> Auth[NextAuth.js + JWT]
        Auth --> RBAC{Role Verification}
        RBAC -->|Super Admin| AdminDashboard[/dashboard/admin/*]
        RBAC -->|School Admin| SchoolDashboard[/dashboard/school-settings/*]
        RBAC -->|Student| StudentDashboard[/dashboard/*]
    end

    subgraph Core Engines
        StudentDashboard --> CBT[CBT Mock Test Engine]
        StudentDashboard --> Predictor[AI Rank & College Predictor]
        AdminDashboard --> AIOCR[Gemini AI PDF Question Extraction]
        AdminDashboard --> QBank[Hierarchical Question Bank]
    end

    subgraph Persistence Layer
        CBT & Predictor & AIOCR & QBank --> Prisma[Prisma ORM Client]
        Prisma --> MySQL[(MySQL Database)]
    end
```

---

## 📁 Directory Structure

```text
TestExplorer/
├── app/                                # Next.js 16 App Router
│   ├── [slug]/                         # Dynamic White-Label School Portal route
│   ├── (auth)/                         # Auth pages (login, signup, forgot-password)
│   ├── api/                            # API Route Handlers
│   │   ├── admin/                      # Admin APIs (extract-pdf via Gemini, etc.)
│   │   ├── auth/[...nextauth]/         # NextAuth endpoint
│   │   └── predictor/                  # College prediction & cutoff query endpoints
│   ├── dashboard/                      # Authenticated dashboard suites
│   │   ├── admin/                      # Super-Admin control panels (Schools, Tests, Questions)
│   │   └── school-settings/            # School-Admin branding & batch controls
│   ├── exams/                          # Public exam categories & listings
│   ├── mocktest/                       # Live CBT test-taking environments
│   ├── predictor/                      # College Predictor tools (JEE, NEET, CUET, CLAT)
│   └── blogs/                          # SEO-optimized blog CMS
├── components/                         # Modular React components
│   ├── exam/                           # CBT Test interface (MockTestInterface, palettes)
│   ├── landing/                        # Hero sections, predictor banners, features
│   ├── predictor/                      # Prediction forms, result grids, college cards
│   ├── admin/                          # Question builders, PDF extractors, school editors
│   └── ui/                             # Radix UI and Tailwind design primitives
├── lib/                                # Core libraries and utilities
│   ├── predictor/                      # Prediction logic, cutoffs, datasets, engine.ts
│   ├── auth.ts                         # NextAuth configuration and providers
│   ├── get-branding.ts                 # Dynamic tenant branding resolution
│   └── prisma.ts                       # Singleton Prisma Client instance
├── prisma/                             # Database configuration
│   └── schema.prisma                   # Complete relational data schema
├── scripts/                            # Administrative automation & seeding scripts
├── public/                             # Static assets, logos, and downloads
├── middleware.ts                       # Subdomain routing & route protection middleware
└── package.json                        # Project dependencies and operational scripts
```

---

## ⚙️ Getting Started & Local Development

### Prerequisites
- **Node.js**: Version `20.x` or `22.x`+ installed.
- **MySQL Database**: Local MySQL instance or cloud provider (Hostinger, AWS RDS, PlanetScale, etc.).

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd TestExplorer
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of `TestExplorer/` using `.env.example`:
```bash
cp .env.example .env
```
Ensure your database connection string and NextAuth credentials are configured:
```env
DATABASE_URL="mysql://username:password@localhost:3306/testexplorer"
NEXTAUTH_SECRET="your-secure-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: For AI PDF Question Extraction
GEMINI_API_KEY="your-google-ai-studio-api-key"
```

### 3. Initialize Prisma ORM
Generate the Prisma Client and synchronize with your database:
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 User Roles & Permissions

1. **Super Admin (`role: 'admin'`)**:
   - Create, configure, and delete partner schools (`organizations`).
   - Manage master exam curricula (Streams, Courses, Subjects, Chapters, Topics).
   - Build exam blueprints, publish mock tests, and manage question banks.
   - Run AI-assisted PDF extraction and import cutoff datasets.
2. **School Admin (`role: 'school_admin'`)**:
   - Customize school identity (subdomain, logo, banner, principal welcome message, announcements).
   - Manage enrolled school students and track institutional test results.
3. **Student (`role: 'student'`)**:
   - Attend scheduled mock examinations in simulated CBT format.
   - Access topic-wise practice tests.
   - Run personalized College and Rank Predictions.
   - Review performance history, accuracy metrics, and leaderboards.

---

## 📜 Production Build

To compile and verify the application for production deployment:
```bash
npm run build
npm run start
```

---

## 🛡️ License
Private and Confidential. Proprietary intellectual property of TestExplorer. All rights reserved.

<<<<<<< HEAD
****
=======
>>>>>>> 308e9d6 (feat: add auth check and redirect for college predictor and add project README)
