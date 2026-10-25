FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/backend/
COPY dynamic/ /app/dynamic/
COPY models/ /app/models/

EXPOSE 8000

ENV PYTHONPATH="/app" \
    PYTHONUNBUFFERED="1" \
    DOCKER_MODE="true"

CMD sh -c "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
