# Mocknetic

**AI-powered technical interview preparation platform helping developers practice mock interviews, assess skills, and master coding challenges.**

Mocknetic provides a realistic, personalized, and data-driven approach to technical interview preparation, designed to maximize developer success and mastery of coding challenges.

---

## Features

* **Resume Parsing and Analysis:** Utilizes AI to automatically analyze uploaded resumes, inferring experience and suggesting initial skill levels.
* **Comprehensive Skill Gap Analysis:** Identifies specific knowledge and skill deficits across various technologies and topics.
* **Personalized Learning Paths:** Generates tailored curricula based on user assessments and resume data.
* **Multi-Language Code Editor:** Facilitates practice for coding challenges within the platform, supporting multiple programming languages.
* **AI Mock Interview Service (Voice-Enabled):** Offers dynamic and realistic mock interview simulations with voice interaction.
* **Detailed Performance Analytics:** Provides progress tracking, full interview transcripts, and actionable feedback for continuous improvement.

---

## Technical Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
**Backend:** Next.js API Routes, MongoDB
**Authentication:** NextAuth.js (Google OAuth)
**AI/ML Components:** Python, OpenAI Whisper (Speech-to-Text), GPT-4 (Interview Logic and Feedback Generation)
**Storage:** AWS S3 / Cloudinary

---

## Installation (Local Development)

The following steps outline how to set up the project for local development:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/mocknetic.git](https://github.com/yourusername/mocknetic.git)
    cd mocknetic
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    ```bash
    cp .env.example .env.local
    ```
    Populate the newly created `.env.local` file with the required configuration settings.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

### Environment Variables

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | Connection string for the MongoDB instance. | `mongodb://localhost:27017/mocknetic` |
| `NEXTAUTH_SECRET` | Secret key used by NextAuth for session handling. | `your-secret` |
| `NEXTAUTH_URL` | The base URL for the NextAuth callback. | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for authentication. | `your-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret for authentication. | `your-secret` |
| `PYTHON_API_URL` | Endpoint for the dedicated AI/Python interview service. | `http://localhost:5000` |

---

## Usage Workflow

1.  **User Authentication:** Sign up using Google OAuth.
2.  **Resume Upload:** Submit resume for AI analysis.
3.  **Skill Assessment:** Complete the initial skill evaluation.
4.  **Guided Learning:** Follow the automatically generated personalized learning path.
5.  **Coding Practice:** Engage in coding challenges using the integrated editor.
6.  **Mock Interviews:** Conduct mock interviews with the AI service.
7.  **Review and Iteration:** Analyze performance reports and feedback to guide further practice.

---

## Project Architecture

| Directory | Description |
| :--- | :--- |
| `/app` | Contains Next.js pages, main UI components, and API routes. |
| `/components` | Library of reusable React components. |
| `/database` | Schemas and connection logic for the MongoDB instance. |
| `/python-interview-service` | Separate Python backend service dedicated to AI/ML tasks. |

---

## Team

* **[Your Name]** - Frontend Development Lead
* **[Teammate Name]** - AI/ML Integration Specialist

---

## License

Academic Project - All Rights Reserved