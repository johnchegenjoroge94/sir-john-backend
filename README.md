# Sir John Phones — Backend API

NestJS + Prisma + PostgreSQL. Matches the endpoints used by `sir-john-frontend`.

## 1. Install PostgreSQL (Linux Mint)

```bash
sudo apt update && sudo apt install -y postgresql
sudo -u postgres psql -c "CREATE USER sirjohn WITH PASSWORD 'choose-a-password';"
sudo -u postgres psql -c "CREATE DATABASE sirjohn OWNER sirjohn;"
```

## 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — use the user/password you chose above.
- `JWT_SECRET` — generate with `openssl rand -base64 48`.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 10 characters) — your admin login.

## 3. Run

```bash
npm install
npx prisma migrate dev --name init   # creates the tables
npm run prisma:seed                  # adds services, categories and your admin user
npm run start:dev
```

- API: http://localhost:4000/api
- Swagger docs: http://localhost:4000/api/docs
- Then start the frontend (`npm run dev`) and sign in at http://localhost:3000/admin/login

## Endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/repair-requests` | Public (5 per minute per IP) |
| GET | `/api/services` | Public |
| GET | `/api/product-categories` | Public |
| GET | `/api/products?search=&category=` | Public |
| POST | `/api/auth/login` | Public (10 per minute per IP) |
| GET | `/api/admin/summary` | Admin/Staff |
| GET | `/api/admin/repair-requests?search=&status=` | Admin/Staff |
| GET | `/api/admin/repair-requests/:id/history` | Admin/Staff |
| PATCH | `/api/admin/repair-requests/:id/status` | Admin/Staff |
| GET/POST | `/api/admin/products` | Admin/Staff |
| PATCH | `/api/admin/products/:id` | Admin/Staff |
| DELETE | `/api/admin/products/:id` | Admin only |
| GET | `/api/admin/services` | Admin/Staff |
| PATCH | `/api/admin/services/:id` | Admin only |

## Notes

- Availability is only returned when you set `inStock` or `quantity` on a product; otherwise it is `null` and the site shows nothing.
- Price `null` shows as "Ask for price".
- Never commit `.env`. Rotate `JWT_SECRET` and the admin password if they are ever exposed.
- Deployment (free tier) and payments are not included yet.
