Here’s a clean, well-structured **Markdown (.md) file** version of your content:

````md
# Life OS

**Life OS** is an autonomous, multi-agent productivity command center designed to streamline your daily workflow. It utilizes an advanced AI layer powered by Gemini 2.0 Flash and the Google ADK to orchestrate complex, multi-step tasks across your favorite productivity tools.

---

## 🚀 Features

- **Multi-Agent Orchestration**  
  A central supervisor agent coordinates specialized agents to seamlessly handle different aspects of your productivity.

- **Gmail Integration**  
  Analyzes incoming emails, categorizes them, and intelligently extracts actionable items.

- **Google Calendar Integration**  
  Automatically schedules events, sets deadlines, and manages your availability based on context.

- **Notion Integration**  
  Organizes tasks, projects, and notes in a centralized Notion workspace.

- **Twilio / WhatsApp Integration**  
  Delivers automated, reliable notifications and status updates directly to your phone.

- **Intelligent Context & Memory**  
  Utilizes Redis for fast caching and persistent cross-request context to maintain session state across interactions.

- **Cinematic Frontend Dashboard**  
  Features a modern, visually stunning UI with 3D components and parallax effects for an immersive command center experience.

---

## 📋 Prerequisites

- Python 3.9+ (for the multi-agent backend)
- Node.js 18+ (for the frontend dashboard)
- Redis Server (running locally or accessible remotely)

---

## 🛠️ Setup & Installation

### 1. Backend Setup

Open your terminal and navigate to the project directory:

```bash
cd "Life OS/backend"
````

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

* Rename `.env.example` to `.env`
* Fill in your API credentials for:

  * Google (Gmail / Calendar)
  * Notion
  * Twilio
* Place your `client_secret_*.json` file inside the `backend/` directory

Start the backend orchestrator:

```bash
python life_os_main.py
```

---

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd "Life OS/frontend"
```

Install the required Node.js dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

---

## 🏗️ Architecture

Life OS operates on a **supervisor-worker model**:

* The **Supervisor Agent** interprets high-level goals
* Coordinates with specialized **Worker Agents**:

  * Gmail Agent
  * Calendar Agent
  * Notion Agent
  * Twilio Agent

These agents communicate using:

* **Model Context Protocol (MCP)**
* **Google ADK**

**Redis** is used to maintain conversational state and context across complex, multi-step workflows.

---

## 🔗 Resources

* **Notion Documentation**
  [https://www.notion.so/Life-OS-Multi-Agent-AI-Productivity-System-35496cd1e61481b0adf1e2c9d8209c79](https://www.notion.so/Life-OS-Multi-Agent-AI-Productivity-System-35496cd1e61481b0adf1e2c9d8209c79)

* **Demo Video**
  [https://drive.google.com/file/d/1uGggNuuWE0w34u0MWFBRBXsbkQlNuzgB/view?usp=sharing](https://drive.google.com/file/d/1uGggNuuWE0w34u0MWFBRBXsbkQlNuzgB/view?usp=sharing)

---

## 👥 Team

**Team Name:** Rogue Agents

**Members:**

* Ritik Yadav
* Priyanshu K
* Priyanshi Mishra

---

## 📄 License

This project is licensed under the **MIT License**.

```

If you want, I can also format this as a GitHub-ready README with badges, visuals, or a cleaner developer-focused layout.
```
