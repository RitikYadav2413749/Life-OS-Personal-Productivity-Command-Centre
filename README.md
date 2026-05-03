
# Life OS

Life OS is an autonomous, multi-agent productivity command center designed to streamline your daily workflow. It utilizes an advanced AI layer powered by Gemini 2.0 Flash and the Google ADK to orchestrate complex, multi-step tasks across your favorite productivity tools.

## 🚀 Features

- **Multi-Agent Orchestration**: A central supervisor agent coordinates specialized agents to seamlessly handle different aspects of your productivity.
- **Gmail Integration**: Analyzes incoming emails, categorizes them, and intelligently extracts actionable items.
- **Google Calendar Integration**: Automatically schedules events, sets deadlines, and manages your availability based on context.
- **Notion Integration**: Organizes tasks, projects, and notes in a centralized Notion workspace.
- **Twilio/WhatsApp Integration**: Delivers automated, reliable notifications and status updates directly to your phone.
- **Intelligent Context & Memory**: Utilizes Redis for fast caching and persistent cross-request context to maintain session state across interactions.
- **Cinematic Frontend Dashboard**: Features a modern, visually stunning UI with 3D components and parallax effects for an immersive command center experience.

## 📋 Prerequisites

- **Python 3.9+** (for the multi-agent backend)
- **Node.js 18+** (for the frontend dashboard)
- **Redis Server** (running locally or accessible remotely)

## 🛠️ Setup & Installation

### 1. Backend Setup

1. Open your terminal and navigate to the project directory:
   ```bash
   cd "Life OS/backend"
   ```

2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure Environment Variables:
   - Rename `.env.example` to `.env`.
   - Fill in your API credentials for Google (Gmail/Calendar), Notion, and Twilio.
   - Place your Google OAuth `client_secret_*.json` file directly inside the `backend/` directory.

4. Start the backend orchestrator:
   ```bash
   python life_os_main.py
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd "Life OS/frontend"
   ```

2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

Life OS operates on a supervisor-worker model. The **Supervisor Agent** interprets your high-level goals and coordinates with specialized **Worker Agents** (Gmail, Calendar, Notion, Twilio) using the Model Context Protocol (MCP) and Google ADK. Redis is used to maintain conversational state and context across these complex, multi-step execution workflows.

## 📄 License

This project is licensed under the MIT License.
