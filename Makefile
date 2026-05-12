.PHONY: backend frontend test lint docker-up docker-down

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

test:
	cd backend && pytest -q

lint:
	cd backend && ruff check app tests

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
