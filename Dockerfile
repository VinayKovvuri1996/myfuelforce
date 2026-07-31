# Multi-stage: build Angular UI, then run FastAPI serving UI + API on one free Render URL
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Same-origin API when UI is served by the backend
RUN sed -i "s|apiUrl: 'https://api.myfuelforce.online'|apiUrl: ''|" src/environments/environment.prod.ts \
  || true
RUN npm run build -- --configuration=production

FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/backend/requirements.txt

COPY backend /app/backend

# Angular 17+ outputs to dist/frontend/browser
COPY --from=frontend-build /frontend/dist/frontend/browser /app/backend/static

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
