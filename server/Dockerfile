
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY server/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

COPY server/ /app/server/
COPY ml/ /app/ml/

EXPOSE 8000

CMD ["sh", "-c", "uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
