# FuelForce / MyFuelForce

Gas station operations app: Angular frontend + FastAPI backend (identity, customers, sales, inventory, manpower).

## Local development

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

App: http://localhost:4200 — API: http://localhost:8000

## Free production deploy (no paid plans)

| Layer | Free service |
|-------|----------------|
| App (UI + API) | [Render](https://render.com) free Web Service |
| Database | [Neon](https://neon.tech) free Postgres |
| Source control | GitHub (this repo) |

One live URL is served from Render (Angular build + FastAPI in one Docker image).

### 1. Neon database
1. Sign up at https://neon.tech (free)
2. Create a project → copy the connection string (`postgresql://...`)

### 2. Render
1. Sign up at https://render.com with GitHub
2. **New → Blueprint** → select this repo (uses `render.yaml`), **or**
   **New → Web Service** → this repo → Docker → root `Dockerfile`
3. Set env var `DATABASE_URL` to the Neon connection string
4. Deploy — URL looks like `https://myfuelforce.onrender.com`

Free Render apps sleep after ~15 minutes idle; first load can take 30–60s.

### Optional: frontend on Vercel
If you prefer a separate UI host: deploy `frontend/` to Vercel and set `environment.prod.ts` `apiUrl` to your Render URL, then set `CORS_ORIGINS` on Render to your Vercel domain.

## Version control workflow
```bash
git checkout -b feature/your-feature
# ... code ...
git add -A && git commit -m "Describe why"
git push -u origin HEAD
# Open a PR on GitHub; merge to main → Render auto-deploys
```
