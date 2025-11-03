# Outreach Micro-CRM

Монорепозиторий на pnpm для веб-приложения аутрич-CRM. Фронтенд реализован на Next.js 15 (App Router), бекенд — на tRPC/Node с Drizzle ORM и MySQL (PlanetScale).

## Структура репозитория

```
apps/
  web/      – фронтенд (Next.js)
  server/   – tRPC-сервер и интеграции
packages/
  types/    – общие схемы и типы
  ui/       – UI-компоненты
```

## Быстрый старт

1. Скопируйте `.env.example` в `.env` и задайте значения переменных.
2. Установите зависимости: `pnpm install`
3. Выполните миграции: `pnpm migrate`
4. Заполните базу демо-данными: `pnpm seed`
5. Запустите локальную разработку:
   ```bash
   pnpm -C apps/server dev # порт 4000 (опционально для API)
   pnpm -C apps/web dev    # порт 3000 (Next.js UI)
   ```

## Тестирование и качество

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Миграции и данные

- Конфигурация Drizzle находится в `apps/server/src/db`.
- Миграции лежат в `apps/server/src/db/migrations`.
- Сид-скрипт `apps/server/tools/seed.ts` создаёт 3 проекта (DuD, JVO, PC) и 20 компаний.

## Фронтенд (Next.js)

- `/` — страница входа. Авторизация выполняется на клиенте по значениям `NEXT_PUBLIC_ADMIN_EMAIL` и `NEXT_PUBLIC_ADMIN_PASSWORD`.
- `/clients` — список клиентов с поиском, фильтром по статусу и возможностью добавлять новые записи.
- Данные хранятся в локальном состоянии; все уведомления отображаются через `sonner`.

## Интеграции

- **Google Custom Search** – поиск данных о компании.
- **OpenAI** – извлечение фактов, поиск LPR и генерация интро.
- Реализован экспоненциальный backoff и rate-limit на основе `TokenBucket`.

## Аутентификация

Базовая авторизация реализована через значения `ADMIN_EMAIL`/`ADMIN_PASSWORD` (сервер) и дублируется на фронтенде через `NEXT_PUBLIC_ADMIN_EMAIL`/`NEXT_PUBLIC_ADMIN_PASSWORD`. Для демо-режима достаточно указать их в `.env` — интерфейс проверяет креденшелы на клиенте и открывает страницу `/clients` после успешного входа.

## Развёртывание (Vercel + PlanetScale)

1. Создайте базу в PlanetScale и получите строку подключения с включённым SSL.
2. Настройте переменные окружения для обоих приложений (см. `.env.example`).
3. На PlanetScale выполните миграции и сид: `pnpm migrate && pnpm seed` (можно через GitHub Actions / локально).
4. Задеплойте `apps/server` на Render/серверную среду (Node 20, `pnpm build` → `pnpm start`).
5. Задеплойте `apps/web` на Vercel:
   - В `vercel.json` указана директория `apps/web` и команда `pnpm --filter @outreach/web... build`.
   - Передайте `NEXT_PUBLIC_ADMIN_EMAIL` и `NEXT_PUBLIC_ADMIN_PASSWORD` для авторизации в интерфейсе.
6. Проверьте приложение: авторизация на `/`, управление списком на `/clients`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) выполняет lint, typecheck, тесты и сборку.

## Дополнительно

- Очередь задач на сервере построена на базе `p-queue` с интерфейсом `QueueProvider`.
- Фронтенд работает полностью на русском языке и подходит для демонстрации на Vercel.
