# AlgoSeek: PaaS Production Deployment Guide (Railway / Render + Qdrant Cloud)

This guide walks you through deploying **AlgoSeek** to a modern Managed Platform as a Service (PaaS) such as **Railway** or **Render**, paired with **Qdrant Cloud** (free 1GB cluster).

---

## 🏗️ Architecture Overview

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              Users                                     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     algoseek-web (Node.js 22)                          │
 │  • React 19 Frontend (Vite) + Express + tRPC API Gateway               │
 │  • Uploads Proxy & Guest Preview Engine                                │
 └──────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
     HTTP/REST      │                                 │ Vector Search
    (Private Net)   │                                 │
                    ▼                                 ▼
 ┌───────────────────────────────────┐    ┌───────────────────────────────┐
 │       algoseek-ai (FastAPI)       │    │         Qdrant Cloud          │
 │  • PyTorch + Sentence-Transformers│◄───┤  (Free 1GB Managed Cluster)   │
 │  • Document & PDF Chunker (PyMuPDF│    │  • dsa_lectures_384           │
 │  • LLM RAG Pipeline (Groq/Gemini) │    │  • user_uploads_384           │
 └───────────────────────────────────┘    └───────────────────────────────┘
```

---

## ⚡ Step 1: Create Your Free Qdrant Cloud Cluster (2 minutes)

1. Sign up or log in at **[cloud.qdrant.io](https://cloud.qdrant.io)**.
2. Click **Create Cluster**.
3. Choose the **Free Tier** (1GB RAM, 0.5 vCPU, 4GB disk — free forever).
4. Select a region close to your PaaS deployment (e.g. `us-east-1` or `eu-central-1`).
5. Once created, note your **Cluster URL** (e.g. `https://xxxxxx-xxxx.cloud.qdrant.io:6333`).
6. Click **Data Access Control** / **API Keys** and generate a new **API Key**.

---

## 🚀 Step 2: Seed Qdrant Cloud with Lecture Vectors (One-time)

You can seed all 2,495 pre-processed lecture chunks from your local machine directly into your new Qdrant Cloud cluster in one command:

1. Open your local `.env` file and set your Qdrant Cloud credentials:
   ```env
   QDRANT_URL=https://your-cluster-url.cloud.qdrant.io:6333
   QDRANT_API_KEY=your_qdrant_api_key_here
   ```
2. Run the seeder script:
   ```powershell
   # Windows
   ai-service\.venv\Scripts\python.exe scripts\seed_qdrant_cloud.py

   # macOS / Linux
   ai-service/.venv/bin/python scripts/seed_qdrant_cloud.py
   ```
   *This will create the `dsa_lectures_384` collection in Qdrant Cloud and upload all embedded chunks.*

---

## 🚂 Step 3A: Deploy to Railway (Recommended)

Railway gives you fast builds, private internal networking between services, and zero DevOps.

### 1. Push your code to GitHub
Push your repository to GitHub if you haven't already.

### 2. Create Project in Railway
1. Go to **[railway.app](https://railway.app)** and click **New Project** -> **Deploy from GitHub repo**.
2. Select your repository. Railway will add the first service (`algoseek-web`).

### 3. Configure `algoseek-web` (Web Service)
- **Settings** -> **Build**: Set builder to **Dockerfile** (uses root `Dockerfile`).
- **Variables**:
  ```env
  NODE_ENV=production
  PORT=3000
  LIVE_AI_ENABLED=true
  AI_SERVICE_URL=http://algoseek-ai.railway.internal:8000
  QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
  QDRANT_API_KEY=your_qdrant_api_key
  GROQ_API_KEY=your_groq_api_key
  ```
- **Settings** -> **Networking**: Click **Generate Domain** to get a public URL (e.g., `algoseek-web.up.railway.app`).

### 4. Add `algoseek-ai` (FastAPI Service)
1. In the same Railway project canvas, click **+ Create** -> **Service** -> **GitHub Repo** (select this same repository again).
2. Rename the new service to **`algoseek-ai`**.
3. Go to **Settings**:
   - **Root Directory**: Set to `/ai-service`.
   - **Build**: Ensure it uses the `Dockerfile` inside `ai-service`.
4. Go to **Variables** and add:
   ```env
   PORT=8000
   QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
   QDRANT_API_KEY=your_qdrant_api_key
   YTRAG_COLLECTION=dsa_lectures
   YTRAG_UPLOAD_COLLECTION=user_uploads
   YTRAG_EMBED_MODEL=all-MiniLM-L6-v2
   YTRAG_LLM_BACKEND=groq
   GROQ_API_KEY=your_groq_api_key
   ```
5. Railway automatically provides internal DNS: `http://algoseek-ai.railway.internal:8000`, so the AI service stays private and fast!

---

## 🌐 Step 3B: Deploy to Render (Alternative using `render.yaml`)

We have included a pre-configured `render.yaml` Blueprint.

1. Go to **[render.com](https://render.com)** -> **Blueprints** -> **New Blueprint Instance**.
2. Connect your GitHub repository. Render will automatically detect `render.yaml` and create both services:
   - `algoseek-web` (Starter Web Service)
   - `algoseek-ai` (Standard Web Service with 2GB RAM for PyTorch)
3. Fill in the prompted secrets:
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `GROQ_API_KEY` (or `GEMINI_API_KEY`)
4. Click **Apply**. Render will build and deploy both services automatically!

---

## 🔑 Environment Variables Reference

| Variable | Required In | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Web | `production` |
| `PORT` | Web & AI | Injected automatically by PaaS (defaults to 3000 / 8000) |
| `LIVE_AI_ENABLED` | Web | `true` (enables live FastAPI & Qdrant query path) |
| `AI_SERVICE_URL` | Web | URL to `algoseek-ai` (`http://algoseek-ai.railway.internal:8000` or Render URL) |
| `QDRANT_URL` | Web & AI | URL to Qdrant Cloud cluster |
| `QDRANT_API_KEY` | Web & AI | API key generated in Qdrant Cloud console |
| `YTRAG_COLLECTION` | Web & AI | `dsa_lectures` |
| `YTRAG_UPLOAD_COLLECTION`| Web & AI | `user_uploads` |
| `YTRAG_EMBED_MODEL` | AI | `all-MiniLM-L6-v2` |
| `YTRAG_LLM_BACKEND` | AI | `groq` or `gemini` |
| `GROQ_API_KEY` | Web & AI | Groq API Key (get free at [console.groq.com](https://console.groq.com)) |
| `GEMINI_API_KEY` | Web & AI | Gemini API Key (get free at [aistudio.google.com](https://aistudio.google.com)) |
| `DATABASE_URL` | Web (Optional)| MySQL URL if user accounts and session saving are needed |

---

## 🩺 Verification & Health Checks

Both services feature built-in zero-latency health checks for PaaS monitoring:
- **Web App**: `GET https://your-web-app.railway.app/health` returns `{"status":"ok","service":"algoseek-web"}`.
- **AI Service**: `GET http://<ai-host>/health` returns `{"ok":true,"service":"pratyush-lecture-rag"}`.
- **Qdrant Ready Check**: `GET http://<ai-host>/ready` confirms live connectivity to your Qdrant cluster.
