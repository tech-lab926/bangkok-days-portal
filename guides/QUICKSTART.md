# Quick Start Guide

## 1. Initial Setup (5 minutes)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Create admin user
npx tsx scripts/create-admin.ts

# Seed sample data (optional)
npx tsx scripts/seed.ts

# Start server
npm run dev
```

## 2. Test the APIs

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sitebang.com","password":"admin123456"}'
```

### Get Places (Public)
```bash
curl http://localhost:3000/api/v1/places?locale=ja
```

### Get Dashboard Stats (Admin)
```bash
curl http://localhost:3000/api/v1/admin/dashboard \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

## 3. Project Structure

```
✅ Database Schema (Prisma)
✅ API Routes (/api/v1/*)
✅ Authentication (NextAuth)
✅ Validation (Zod)
✅ Error Handling
✅ Role-Based Access Control

❌ Stripe Payment (not implemented)
❌ Image Upload (not implemented)
❌ Email Notifications (not implemented)
❌ Search (Meilisearch not integrated)
❌ Frontend UI (not implemented)
```

## 4. Key Files

- `prisma/schema.prisma` - Database schema
- `app/api/v1/*` - API routes
- `lib/validations/*` - Zod schemas
- `lib/auth.ts` - Auth helpers
- `scripts/create-admin.ts` - Create admin
- `scripts/seed.ts` - Sample data

## 5. Common Commands

```bash
# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create migration
npx prisma generate            # Generate client

# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Scripts
npx tsx scripts/create-admin.ts  # Create admin
npx tsx scripts/seed.ts          # Seed data
```

## 6. API Endpoints Summary

### Public
- Places: `/api/v1/places`, `/api/v1/places/[slug]`
- Articles: `/api/v1/articles`, `/api/v1/articles/[slug]`
- Community: `/api/v1/community/posts`
- Taxonomy: `/api/v1/areas`, `/api/v1/categories`, `/api/v1/tags`
- Inquiries: `/api/v1/inquiries` (POST)

### Admin (Protected)
- Dashboard: `/api/v1/admin/dashboard`
- Places: `/api/v1/admin/places` (POST/PUT/DELETE)
- Articles: `/api/v1/admin/articles` (POST/PUT/DELETE)
- Community: `/api/v1/admin/community` (PATCH/DELETE)
- Inquiries: `/api/v1/admin/inquiries` (GET/PATCH)
- Users: `/api/v1/admin/users` (GET/POST/PATCH/DELETE)

## 7. Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 8. Roles

- **SUPER_ADMIN**: Full access to everything
- **ADMIN**: Manage content + moderate community
- **EDITOR**: Create/edit content only

## 9. Next Steps

1. ✅ Backend is complete (except Stripe)
2. Build admin panel UI
3. Build public site pages
4. Implement image upload
5. Add Stripe integration
6. Setup email notifications
7. Integrate Meilisearch
8. Deploy to production

## 10. Documentation

- `BACKEND_SETUP.md` - Detailed setup guide
- `API_DOCS.md` - Complete API reference
- `README.md` - Project overview
