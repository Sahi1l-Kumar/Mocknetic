# AI Context — mocknetic

## Project Overview
- Name: mocknetic
- Type: Full-stack web application
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Runtime: Node.js (custom server via server.js)
- Package manager: npm
- Module system: ES Modules ("type": "module")

This is a production-scale App Router project with auth, AI features, real-time features, and a complex backend.

---

## Core Tech Stack

### Frontend
- React 18/19
- Next.js App Router
- Tailwind CSS v4
- shadcn/ui (Radix UI–based components)
- Radix UI primitives
- lucide-react icons
- next-themes
- Monaco Editor (code editor)
- react-hook-form + zod
- sonner (toasts)

⚠️ shadcn/ui components live in `components/ui` and should be treated as **generated primitives** — do not refactor unless explicitly requested.

---

### Backend / Server
- Custom Node server (`server.js`)
- MongoDB with Mongoose
- NextAuth v5 (beta)
- JWT-based auth flows
- Socket.IO for real-time features
- Axios for HTTP calls
- bcryptjs for password hashing
- pdf2json for resume parsing
- Judge0 integration for code execution

---

### AI / LLM
- ai SDK
- @ai-sdk/groq
- AI-driven features are **core product functionality**
- AI is used for:
  - question generation
  - assessments
  - recommendations
  - interview flows

---

## Repository Structure (High-Level)

### App Router (`/app`)
- `(auth)` → sign-in / sign-up routes
- `(root)` → main application pages
- `api/*` → route handlers (REST-style)
- `layout.tsx`, `globals.css`, `middleware.ts`

Key product pages include:
- Dashboard
- Classroom & assessments
- Skill assessments
- Mock interviews
- Code editor
- Resume parser
- User profiles

---

### API Routes (`/app/api`)
Heavy usage of route handlers for:
- Auth (NextAuth + custom flows)
- Classrooms & assessments
- Student submissions
- Skill assessments
- Judge0 execution
- File parsing
- User & profile management

Prefer **existing route patterns** when adding new endpoints.

---

### Database (`/database`)
- Mongoose models
- Modular model structure
- Domains include:
  - User / Profile / Account
  - Classroom & memberships
  - Assessments & submissions
  - Interviews
  - Problems
  - Resumes

All DB access goes through Mongoose models.

---

### Components (`/components`)
- Feature-oriented components (NOT atomic-only)
- Forms live in `components/forms`
- Domain-specific UI (classroom, interview, dashboard, etc.)
- `components/ui` contains shadcn/ui primitives

---

### Shared Logic
- `/lib` → helpers, handlers, validations, auth helpers, socket, API clients
- `/hooks` → custom React hooks (e.g. socket usage)
- `/constants` → routes and static config
- `/types` → global and action TypeScript types

---

## Auth
- NextAuth v5 (beta)
- Credentials + OAuth
- JWT-based sessions
- Custom auth helpers in `/lib`

---

## Styling & UI Rules
- Tailwind CSS is mandatory
- Prefer CVA + tailwind-merge
- Do not inline large class strings without reason
- Prefer existing UI components

---

## Key Architectural Rules
- App Router only (no Pages Router)
- Server Components by default
- Client Components only when required
- Route Handlers preferred over legacy APIs
- Zod for validation
- Respect existing folder & API patterns
- Do not refactor shadcn/ui unless explicitly requested

---

## Common Commands
- `npm run dev` → custom dev server
- `npm run build` → Next.js build
- `npm start` → production server
- `npm run lint` → ESLint

---

## Current Focus / Active Work
(Update this section manually as work changes)

- [ ] 
- [ ] 
- [ ] 

---

## AI Instructions (Important)
- Assume deep knowledge of Next.js, React, TypeScript, MongoDB
- Prefer concrete code over abstract advice
- Match existing patterns before introducing new ones
- Ask clarifying questions only when necessary
- If suggesting changes, explain tradeoffs clearly

---

## Repository Structure (Full)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)


## 📁 Project File Structure (auto-generated)

<!-- AI:STRUCTURE:START -->
```
├── .env.local
├── .gitignore
├── AI_CONTEXT.md
├── README.md
├── app
│   ├── (auth)
│   │   ├── sign-in
│   │   │   ├── page.tsx
│   │   ├── sign-up
│   │   │   ├── page.tsx
│   ├── (root)
│   │   ├── classroom
│   │   │   ├── [id]
│   │   │   │   ├── page.tsx
│   │   │   ├── assessment
│   │   │   │   ├── [id]
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── result
│   │   │   │   │   │   ├── page.tsx
│   │   │   ├── page.tsx
│   │   ├── code-editor
│   │   │   ├── page.tsx
│   │   ├── dashboard
│   │   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── mock-interview
│   │   │   ├── feedback
│   │   │   │   ├── page.tsx
│   │   │   ├── page.tsx
│   │   ├── page.tsx
│   │   ├── problem
│   │   │   ├── [id]
│   │   │   │   ├── page.tsx
│   │   ├── profile
│   │   │   ├── [id]
│   │   │   │   ├── page.tsx
│   │   │   ├── edit
│   │   │   │   ├── page.tsx
│   │   ├── resume-parser
│   │   │   ├── page.tsx
│   │   ├── skill-assessment
│   │   │   ├── page.tsx
│   │   │   ├── result
│   │   │   │   ├── page.tsx
│   ├── api
│   │   ├── accounts
│   │   │   ├── [id]
│   │   │   │   ├── route.ts
│   │   │   ├── provider
│   │   │   │   ├── route.ts
│   │   │   ├── route.ts
│   │   ├── auth
│   │   │   ├── [...nextauth]
│   │   │   │   ├── route.ts
│   │   │   ├── signin
│   │   │   ├── signin-with-oauth
│   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   │   ├── signup
│   │   │   │   ├── route.ts
│   │   │   ├── teacher
│   │   │   │   ├── session
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── signin
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── signout
│   │   │   │   │   ├── route.ts
│   │   ├── classroom
│   │   ├── classroom-assessment
│   │   │   ├── [id]
│   │   │   │   ├── publish
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── results
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   ├── classroom-submission
│   │   │   ├── [id]
│   │   │   │   ├── grade
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   │   ├── [id]
│   │   │   │   ├── assessment
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── student
│   │   │   │   │   ├── [studentId]
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   ├── route.ts
│   │   ├── fileparser
│   │   │   ├── route.ts
│   │   ├── interview
│   │   │   ├── [id]
│   │   │   │   ├── route.ts
│   │   │   ├── route.ts
│   │   │   ├── save
│   │   │   │   ├── route.ts
│   │   │   ├── stats
│   │   │   │   ├── route.ts
│   │   ├── judge0
│   │   │   ├── execute
│   │   │   │   ├── route.ts
│   │   │   ├── result
│   │   │   │   ├── [token]
│   │   │   │   │   ├── route.ts
│   │   │   ├── status
│   │   │   │   ├── route.ts
│   │   │   ├── submissions
│   │   │   │   ├── [id]
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   │   ├── submit
│   │   │   │   ├── route.ts
│   │   ├── profile
│   │   │   ├── update
│   │   │   │   ├── route.ts
│   │   ├── skill-assessment
│   │   │   ├── generate-questions
│   │   │   │   ├── route.ts
│   │   │   ├── generate-recommendations
│   │   │   │   ├── route.ts
│   │   │   ├── result
│   │   │   │   ├── [id]
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   │   ├── stats
│   │   │   │   ├── route.ts
│   │   │   ├── submit
│   │   │   │   ├── route.ts
│   │   ├── student
│   │   │   ├── assessment
│   │   │   │   ├── [id]
│   │   │   │   │   ├── generate
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── questions
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── result
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── submit
│   │   │   │   │   │   ├── route.ts
│   │   │   ├── assessments
│   │   │   │   ├── route.ts
│   │   │   ├── classrooms
│   │   │   │   ├── [id]
│   │   │   │   │   ├── leave
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── join
│   │   │   │   │   ├── route.ts
│   │   │   │   ├── route.ts
│   │   │   ├── submissions
│   │   │   │   ├── route.ts
│   │   ├── users
│   │   │   ├── [id]
│   │   │   │   ├── route.ts
│   │   │   ├── email
│   │   │   │   ├── route.ts
│   │   │   ├── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
├── auth.ts
├── components
├── components.json
│   ├── CodeEditor.tsx
│   ├── Dashboard.tsx
│   ├── Loader.tsx
│   ├── LogoutButton.tsx
│   ├── Navbar.tsx
│   ├── UserAvatar.tsx
│   ├── classroom
│   │   ├── AssessmentResult.tsx
│   │   ├── ClassroomDetail.tsx
│   │   ├── JoinClassroomModal.tsx
│   │   ├── StudentClassroomsHub.tsx
│   │   ├── TakeAssessment.tsx
│   ├── forms
│   │   ├── AuthForm.tsx
│   │   ├── ProfileEditForm.tsx
│   ├── interview
│   │   ├── InterviewForm.tsx
│   │   ├── InterviewPage.tsx
│   │   ├── InterviewSetup.tsx
├── constants
│   ├── index.ts
│   ├── routes.ts
├── database
│   ├── account.model.ts
│   ├── classroom
│   │   ├── classroom-assignment.model.ts
│   │   ├── classroom-membership.model.ts
│   │   ├── classroom-submission.model.ts
│   │   ├── classroom.model.ts
│   │   ├── index.ts
│   ├── coding
│   │   ├── coding-problem.model.ts
│   │   ├── coding-submission.model.ts
│   │   ├── index.ts
│   ├── index.ts
│   ├── interview.model.ts
│   ├── profile.model.ts
│   ├── skill-evaluation
│   │   ├── index.ts
│   │   ├── skill-evaluation.model.ts
│   │   ├── skill-result.model.ts
│   ├── user.model.ts
├── eslint.config.mjs
├── hooks
│   ├── useSocket.ts
├── lib
│   ├── actions
│   │   ├── auth.action.ts
│   ├── api.ts
│   ├── auth-helpers.ts
│   ├── handlers
│   │   ├── action.ts
│   │   ├── error.ts
│   │   ├── fetch.ts
│   ├── http-errors.ts
│   ├── judge0.ts
│   ├── logger.ts
│   ├── mongoose.ts
│   ├── socket.ts
│   ├── url.ts
│   ├── utils.ts
│   ├── validations.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── mocknetic.svg
├── scripts
│   ├── update-ai-context.mjs
├── tailwind.config.ts
├── tsconfig.json
├── types
│   ├── action.d.ts
│   ├── global.d.ts
```
<!-- AI:STRUCTURE:END -->








