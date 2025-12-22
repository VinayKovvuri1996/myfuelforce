FROM python:3.9-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the entire backend directory into the container
# We assume the docker build context is the root 'test-ts' folder,
# but usually it's better to copy '.' to '/app' if building from inside backend,
# OR copy 'backend' to '/app/backend' if building from root.
# Standard Render/Docker practice often builds from root.
# Let's assume we copy the 'backend' folder content to /app.
COPY . /app

# Since the app code is inside /app/backend in the project structure,
# checking main.py location.
# If we run from root: uvicorn backend.main:app
# So on the container we should likely have the structure:
# /app/backend/main.py
# If we copy . (from backend dir) to /app, then main.py is at /app/main.py.
# The user's command was `uvicorn backend.main:app`.
# Let's stick to standard python structure.

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
