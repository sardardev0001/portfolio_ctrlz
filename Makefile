DC = docker compose
setup:
	@test -f .env || (echo "Copy .env.example to .env and set credentials" && exit 1)
	$(DC) build backend frontend minio-init
up:
	$(DC) up -d
down:
	$(DC) down
restart:
	$(DC) restart
build:
	$(DC) build backend frontend minio-init
logs:
	$(DC) logs -f
migrate:
	$(DC) exec backend python manage.py migrate
migrations:
	$(DC) exec backend python manage.py makemigrations
test:
	$(DC) exec backend pytest && $(DC) exec frontend pnpm test
lint:
	$(DC) exec backend ruff check . && $(DC) exec frontend pnpm lint
format:
	$(DC) exec backend ruff format . && $(DC) exec frontend pnpm format
shell:
	$(DC) exec backend python manage.py shell
db-shell:
	$(DC) exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'
seed:
	$(DC) exec backend python manage.py seed
backup:
	$(DC) exec -T postgres sh -c 'pg_dump -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -Fc' > backup.dump
restore:
	@test "$(CONFIRM)" = "restore" || (echo "Use make restore CONFIRM=restore after checking the target database" && exit 1)
	@test -f backup.dump || (echo "backup.dump missing" && exit 1)
	$(DC) exec -T postgres sh -c 'pg_restore -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" --clean --if-exists' < backup.dump

minio-source:
	docker build -f ops/minio.Dockerfile -t ctrlz-minio:source-2025-10-15 .
