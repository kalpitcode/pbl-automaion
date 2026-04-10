# PBL Portal — Project Documentation & Diagrams

## 1. Project Overview

**PBL Portal** is a full-stack web application for managing **Project-Based Learning** in an academic institution. It connects **Students** and **Supervisors** through a structured weekly submission and evaluation workflow.

### Key Features
- Role-based authentication (Student / Supervisor)
- Group formation and supervisor assignment
- Weekly project submission with file uploads
- Supervisor review (Approve / Reject with feedback)
- PDF report generation
- Student grading system (CWS / MTE / ETE)
- Grade publishing

---

## 2. System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Frontend (Next.js 16 + React 19)"]
        LP["Login / Signup Pages"]
        SD["Student Dashboard"]
        SVD["Supervisor Dashboard"]
        API_LIB["api.ts (API Client)"]
    end

    subgraph Server["⚙️ Backend (Express.js + Node.js)"]
        MW["Middleware Layer"]
        AUTH_MW["JWT Auth Middleware"]
        ROLE_MW["Role Guard Middleware"]
        
        subgraph Controllers["Controllers"]
            AC["authController"]
            GC["groupController"]
            SC["submissionController"]
            SUP["supervisorController"]
            WC["weekController"]
            GRC["gradingController"]
        end
        
        subgraph Routes["REST API Routes"]
            R1["/api/auth"]
            R2["/api/groups"]
            R3["/api/submissions"]
            R4["/api/supervisor"]
            R5["/api/weeks"]
            R6["/api/grades"]
        end
    end

    subgraph Database["🗄️ Database (SQLite / PostgreSQL)"]
        ORM["Prisma ORM"]
        DB[("Database")]
    end

    LP & SD & SVD --> API_LIB
    API_LIB -->|"HTTP REST + JWT"| MW
    MW --> AUTH_MW --> ROLE_MW
    ROLE_MW --> Routes
    R1 --> AC
    R2 --> GC
    R3 --> SC
    R4 --> SUP
    R5 --> WC
    R6 --> GRC
    Controllers --> ORM --> DB
```

---

## 3. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USERS {
        string id PK
        string name
        string email UK
        string password_hash
        string role "STUDENT | SUPERVISOR"
        datetime created_at
        datetime updated_at
    }

    GROUPS {
        string id PK
        string name UK
        string topic
        string status "PENDING | APPROVED | REJECTED"
        string supervisor_id FK
        datetime created_at
        datetime updated_at
    }

    WEEKS {
        string id PK
        int week_number UK
        string name
        string phase_title
        datetime deadline
    }

    GROUP_MEMBERS {
        string id PK
        string user_id FK,UK
        string group_id FK
        string role "LEADER | MEMBER"
    }

    GROUP_WEEKS {
        string id PK
        string group_id FK
        string week_id FK
        string status "PENDING | DRAFT | SUBMITTED | APPROVED | REJECTED"
        string submission_comments
        string submitted_file_name
        string submitted_file_path
        datetime submitted_at
        string submitted_by_id FK
        string supervisor_feedback
        datetime reviewed_at
    }

    SUPERVISOR_REQUESTS {
        string id PK
        string group_id FK,UK
        string supervisor_id FK
        string status "PENDING | APPROVED | REJECTED"
        datetime created_at
    }

    STUDENT_GRADES {
        string id PK
        string student_id FK
        string supervisor_id FK
        string group_id FK
        int cws "0-30"
        int mte "0-30"
        int ete "0-40"
        int total "0-100"
        boolean is_published
    }

    USERS ||--o| GROUP_MEMBERS : "has membership"
    GROUPS ||--|{ GROUP_MEMBERS : "has members"
    USERS ||--o{ GROUPS : "supervises"
    GROUPS ||--|{ GROUP_WEEKS : "has weekly status"
    WEEKS ||--|{ GROUP_WEEKS : "tracked per group"
    USERS ||--o{ GROUP_WEEKS : "submits"
    GROUPS ||--o| SUPERVISOR_REQUESTS : "requests supervisor"
    USERS ||--o{ SUPERVISOR_REQUESTS : "receives request"
    USERS ||--o{ STUDENT_GRADES : "graded as student"
    USERS ||--o{ STUDENT_GRADES : "grades as supervisor"
    GROUPS ||--o{ STUDENT_GRADES : "grades per group"
```

---

## 4. Authentication Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend (Next.js)
    participant B as Backend (Express)
    participant DB as Database

    U->>F: Enter email & password
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User record
    B->>B: Verify password (bcrypt)
    B->>B: Generate JWT token
    B-->>F: { token, user: { id, role } }
    F->>F: Store token in localStorage

    alt role === STUDENT
        F->>F: Redirect to /dashboard/student
    else role === SUPERVISOR
        F->>F: Redirect to /dashboard/supervisor
    end

    Note over F,B: All subsequent API calls include<br/>Authorization: Bearer {token}

    F->>B: GET /api/auth/me (with token)
    B->>B: Verify JWT + extract userId
    B->>DB: Fetch user data
    DB-->>B: User profile
    B-->>F: { user }
```

---

## 5. Student Complete Workflow

```mermaid
flowchart TD
    A["🔐 Student Login / Signup"] --> B{"Has a Group?"}
    
    B -->|No| C["📋 Onboarding Page"]
    C --> D{"Create or Join?"}
    D -->|Create| E["Create Group (become LEADER)"]
    D -->|Join| F["Join Existing Group"]
    E & F --> G["Select Supervisor from List"]
    G --> H["Send Supervisor Request"]
    H --> I["⏳ Waiting Page"]
    I -->|"Request Approved"| J
    I -->|"Request Rejected"| C

    B -->|Yes, APPROVED| J["🏠 Student Dashboard"]

    J --> K["View Weekly Phases (Week 1-14)"]
    K --> L["Select a Week"]
    L --> M["Write Submission Comments"]
    M --> N{"Attach File?"}
    N -->|Yes| O["Upload PDF/Document"]
    N -->|No| P["Skip File"]
    O & P --> Q{"Save as Draft or Submit?"}
    Q -->|Draft| R["💾 Save Draft (can edit later)"]
    Q -->|Submit| S["📤 Submit for Review"]
    
    S --> T{"Supervisor Decision"}
    T -->|"✅ Approved"| U["Week marked APPROVED"]
    T -->|"❌ Rejected"| V["View Feedback → Resubmit"]
    V --> M

    J --> W["📊 View Published Grades"]
    W --> X["See CWS / MTE / ETE / Total"]

    style A fill:#784E35,color:#fff
    style J fill:#E1F0E6,color:#1E824C
    style W fill:#F4EBE3,color:#784E35
```

---

## 6. Supervisor Complete Workflow

```mermaid
flowchart TD
    A["🔐 Supervisor Login"] --> B["🏠 Supervisor Dashboard"]
    
    B --> C["📬 Approval Queue"]
    C --> D["View Pending Supervisor Requests"]
    D --> E{"Approve or Reject?"}
    E -->|"✅ Approve"| F["Group assigned to Supervisor"]
    E -->|"❌ Reject"| G["Student notified to retry"]

    B --> H["👥 Assigned Groups"]
    H --> I["Select a Group"]
    I --> J["View Group Members & All Weeks"]
    J --> K["Select a Week Submission"]
    K --> L["Review Submission + Download File"]
    L --> M{"Decision"}
    M -->|"✅ Approve"| N["Mark Week as APPROVED"]
    M -->|"❌ Reject"| O["Write Feedback → Send Back"]
    L --> P["📄 Generate PDF Report"]

    B --> Q["🏆 Grade Students"]
    Q --> R["View All Groups with Students"]
    R --> S["Click Edit on a Student"]
    S --> T["Enter CWS (0-30), MTE (0-30), ETE (0-40)"]
    T --> U["Save Marks (auto-calculates Total)"]
    U --> V["Click 'Publish All Marks'"]
    V --> W["✅ Students can now see grades"]

    style A fill:#784E35,color:#fff
    style B fill:#F4EBE3,color:#784E35
    style W fill:#E1F0E6,color:#1E824C
```

---

## 7. Weekly Submission & Review Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Week Opens

    PENDING --> DRAFT: Student saves draft
    DRAFT --> DRAFT: Student edits draft
    DRAFT --> SUBMITTED: Student submits

    PENDING --> SUBMITTED: Student submits directly

    SUBMITTED --> APPROVED: Supervisor approves
    SUBMITTED --> REJECTED: Supervisor rejects with feedback

    REJECTED --> DRAFT: Student revises
    REJECTED --> SUBMITTED: Student resubmits

    APPROVED --> [*]: Week Complete ✅
```

---

## 8. Grading Flow

```mermaid
sequenceDiagram
    actor S as Supervisor
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database
    actor ST as Student

    S->>FE: Navigate to Grade Students page
    FE->>BE: GET /api/grades
    BE->>DB: Fetch supervisor's groups + members + existing grades
    DB-->>BE: Groups with students
    BE-->>FE: { grades: [{ group, students }] }
    FE->>FE: Render grading table

    S->>FE: Click Edit → Enter CWS=25, MTE=22, ETE=35
    
    alt First time grading (no gradeId)
        FE->>BE: POST /api/grades { studentId, groupId, cws, mte, ete }
        BE->>DB: Create StudentGrades record (total=82)
    else Updating existing grade
        FE->>BE: PUT /api/grades/:gradeId { cws, mte, ete }
        BE->>DB: Update StudentGrades record
    end
    
    DB-->>BE: Updated grade
    BE-->>FE: { grade, message }
    FE->>FE: Show "Marks saved" toast

    S->>FE: Click "Publish All Marks"
    FE->>BE: POST /api/grades/publish
    BE->>DB: SET is_published = true for all supervisor's grades
    BE-->>FE: { message: "Published" }

    Note over ST: Student logs in later
    ST->>FE: View Student Dashboard
    FE->>BE: GET /api/grades/me
    BE->>DB: Find published grades for student
    DB-->>BE: Grade records
    BE-->>FE: { grades: [{ cws, mte, ete, total }] }
    FE->>FE: Display grades bar with scores
```

---

## 9. Tech Stack Summary

```mermaid
graph LR
    subgraph Frontend["Frontend"]
        NJ["Next.js 16"]
        R19["React 19"]
        TW["Tailwind CSS 4"]
        LR["Lucide React Icons"]
    end

    subgraph Backend["Backend"]
        EX["Express.js 5"]
        PR["Prisma ORM"]
        JWT["JWT Auth"]
        BC["bcrypt"]
        PK["PDFKit"]
        ZD["Zod Validation"]
    end

    subgraph Infrastructure["Infrastructure"]
        SL["SQLite (Dev)"]
        PG["PostgreSQL (Prod)"]
        ND["Node.js"]
    end

    Frontend -->|"REST API"| Backend
    Backend -->|"Prisma Client"| Infrastructure
```

---

## 10. API Route Map

| Module | Method | Endpoint | Role | Description |
|--------|--------|----------|------|-------------|
| **Auth** | POST | `/api/auth/signup/student` | Public | Student registration |
| | POST | `/api/auth/signup/teacher` | Public | Supervisor registration (invite code) |
| | POST | `/api/auth/login` | Public | Login (returns JWT) |
| | GET | `/api/auth/me` | Any | Get current user profile |
| **Groups** | POST | `/api/groups` | Student | Create a new group |
| | POST | `/api/groups/join` | Student | Join existing group |
| | GET | `/api/groups/me` | Student | Get my group info |
| | GET | `/api/groups/supervisors` | Student | List available supervisors |
| | POST | `/api/groups/request-supervisor` | Student | Request supervisor assignment |
| | GET | `/api/groups/my-group/weeks` | Student | Get weekly progress |
| **Submissions** | POST | `/api/submissions/:weekId` | Student | Submit/save draft for a week |
| | GET | `/api/submissions/:weekId/file` | Student | Download own submission file |
| **Supervisor** | GET | `/api/supervisor/groups` | Supervisor | List assigned groups |
| | GET | `/api/supervisor/groups/:id` | Supervisor | Group detail with members |
| | GET | `/api/supervisor/groups/:gid/weeks/:wid` | Supervisor | Week submission detail |
| | PUT | `/api/supervisor/groups/:gid/weeks/:wid/approve` | Supervisor | Approve submission |
| | PUT | `/api/supervisor/groups/:gid/weeks/:wid/reject` | Supervisor | Reject with feedback |
| | GET | `/api/supervisor/groups/:gid/weeks/:wid/file` | Supervisor | Download student's file |
| | POST | `/api/supervisor/groups/:gid/weeks/:wid/report` | Supervisor | Generate PDF report |
| | GET | `/api/supervisor/requests` | Supervisor | View pending requests |
| | PUT | `/api/supervisor/requests/:id/approve` | Supervisor | Approve group request |
| | PUT | `/api/supervisor/requests/:id/reject` | Supervisor | Reject group request |
| **Grades** | GET | `/api/grades` | Supervisor | Get all students' grades |
| | POST | `/api/grades` | Supervisor | Create grade for student |
| | PUT | `/api/grades/:gradeId` | Supervisor | Update marks |
| | POST | `/api/grades/publish` | Supervisor | Publish all marks |
| | GET | `/api/grades/me` | Student | View own published grades |

---

## 11. Project Directory Structure

```
pbl_v1/
├── app/                          # Next.js Frontend (App Router)
│   ├── page.tsx                  # Login page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + design tokens
│   ├── student-signup/           # Student registration
│   ├── supervisor-signup/        # Supervisor registration
│   ├── lib/
│   │   └── api.ts                # All API client functions
│   ├── components/
│   │   ├── ProtectedRoute.tsx    # Auth guard component
│   │   ├── ui/                   # Reusable UI components
│   │   └── dashboard/            # Shared dashboard components
│   └── dashboard/
│       ├── student/
│       │   ├── page.tsx          # Student main dashboard
│       │   ├── onboarding/       # Group creation/joining
│       │   └── waiting/          # Awaiting supervisor approval
│       └── supervisor/
│           ├── page.tsx          # Supervisor main dashboard
│           ├── components/       # Sidebar, Navbar
│           ├── groups/           # View assigned groups
│           ├── requests/         # Approve/reject requests
│           └── grades/           # Grade students
│
├── server/                       # Express.js Backend
│   ├── index.js                  # App entry point
│   ├── prisma.js                 # Prisma client singleton
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verify + role guard
│   ├── controllers/
│   │   ├── authController.js     # Login, signup, getMe
│   │   ├── groupController.js    # Group CRUD + supervisor request
│   │   ├── submissionController.js # File upload + submissions
│   │   ├── supervisorController.js # Review, approve, PDF gen
│   │   ├── weekController.js     # Week status management
│   │   └── gradingController.js  # CWS/MTE/ETE grading
│   ├── routes/                   # Express route definitions
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── scripts/
│   │   └── bootstrap-db.js       # SQLite table creation
│   ├── seed.js                   # Seed academic weeks
│   └── seed_supervisor_mock.js   # Seed demo supervisors
│
├── package.json                  # Frontend dependencies
└── README.md                     # Setup instructions
```

---

## 12. Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with salt rounds |
| **Authentication** | JWT tokens with expiry |
| **Route Protection** | `verifyToken` middleware on all protected routes |
| **Role-Based Access** | `requireRole()` middleware (STUDENT / SUPERVISOR) |
| **Frontend Guards** | `ProtectedRoute` component checks role before rendering |
| **Rate Limiting** | `express-rate-limit` on all endpoints |
| **Security Headers** | `helmet` middleware |
| **CORS** | Configured for cross-origin requests |
| **Input Validation** | Zod schemas + manual validation for marks |
