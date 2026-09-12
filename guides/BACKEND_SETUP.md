# Site Bang - Backend Setup Guide

## ✅ Completed Backend Implementation

### Database Schema (Prisma)
- ✅ AdminUser (authentication & roles)
- ✅ Place (stores) with translations
- ✅ PlaceImage, PlaceTag
- ✅ Area, Category, Tag with translations
- ✅ Article (news/guides) with translations
- ✅ CommunityPost & CommunityReply
- ✅ Inquiry
- ✅ Media

### Core Infrastructure
- ✅ Error handling utilities
- ✅ API response helpers (success, error, paginated)
- ✅ Validation schemas (Zod)
- ✅ Password hashing (bcrypt)
- ✅ Auth middleware (role-based access)

### API Routes Implemented

#### Public APIs
- ✅ GET /api/v1/places (list with filters)
- ✅ GET /api/v1/places/[slug] (detail)
- ✅ GET /api/v1/articles (list)
- ✅ GET /api/v1/articles/[slug] (detail)
- ✅ GET /api/v1/community/posts (list)
- ✅ GET /api/v1/community/posts/[id] (detail with replies)
- ✅ POST /api/v1/community/posts (create)
- ✅ POST /api/v1/community/posts/[id]/replies (create reply)
- ✅ GET /api/v1/areas
- ✅ GET /api/v1/categories
- ✅ GET /api/v1/tags
- ✅ POST /api/v1/inquiries

#### Admin APIs (Protected)
- ✅ GET /api/v1/admin/dashboard (stats)
- ✅ POST/PUT/DELETE /api/v1/admin/places
- ✅ POST/PUT/DELETE /api/v1/admin/articles
- ✅ PATCH/DELETE /api/v1/admin/community (moderation)
- ✅ GET/PATCH /api/v1/admin/inquiries
- ✅ GET/POST/PATCH/DELETE /api/v1/admin/users (super admin only)

### Authentication
- ✅ NextAuth.js configured
- ✅ Credentials provider with bcrypt
- ✅ Role-based access control
- ✅ JWT sessions

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sitebang"
NEXTAUTH_SECRET="generate-a-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional for initial admin
ADMIN_EMAIL="admin@sitebang.com"
ADMIN_PASSWORD="changeme123"
ADMIN_NAME="Super Admin"
```

### 3. Database Setup
```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Create Initial Admin User
```bash
npx tsx scripts/create-admin.ts
```

### 5. Start Development Server
```bash
npm run dev
```

## 📁 Project Structure

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts    # NextAuth
│   └── v1/
│       ├── places/                     # Public place APIs
│       ├── articles/                   # Public article APIs
│       ├── community/                  # Community APIs
│       ├── inquiries/                  # Inquiry submission
│       ├── areas/                      # Taxonomy
│       ├── categories/                 # Taxonomy
│       ├── tags/                       # Taxonomy
│       └── admin/                      # Protected admin APIs
│           ├── dashboard/
│           ├── places/
│           ├── articles/
│           ├── community/
│           ├── inquiries/
│           └── users/
lib/
├── prisma.ts                          # Prisma client
├── auth.ts                            # Auth helpers
├── password.ts                        # Password hashing
├── errors.ts                          # Error classes
├── api-response.ts                    # Response utilities
└── validations/                       # Zod schemas
    ├── common.ts
    ├── place.ts
    ├── article.ts
    ├── community.ts
    ├── inquiry.ts
    └── auth.ts
prisma/
└── schema.prisma                      # Database schema
scripts/
└── create-admin.ts                    # Admin creation script
```

## 🔐 Authentication Flow

1. Admin logs in via `/api/auth/signin`
2. NextAuth creates JWT session
3. Protected routes check session with `requireAuth()` or `requireRole()`
4. Role-based access:
   - SUPER_ADMIN: Full access
   - ADMIN: Content + moderation
   - EDITOR: Content only

## 📝 Next Steps (Not Implemented)

### Payment System (Stripe)
- Subscription plans
- Payment webhooks
- Billing management

### Additional Features
- Image upload to R2/S3
- Email notifications
- Search (Meilisearch integration)
- CSV import for places
- Google Maps data import
- NG-word filtering
- Rate limiting
- Caching (Redis)

### Frontend
- Admin panel UI
- Public site pages
- Multilingual routing

## 🧪 Testing APIs

### Login
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sitebang.com","password":"changeme123"}'
```

### Get Places
```bash
curl http://localhost:3000/api/v1/places?locale=ja&page=1&limit=20
```

### Create Place (Admin)
```bash
curl -X POST http://localhost:3000/api/v1/admin/places \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "slug": "test-restaurant",
    "translations": [
      {"locale": "ja", "name": "テストレストラン", "description": "説明"}
    ]
  }'
```

## 📚 Documentation

See `API_DOCS.md` for complete API reference.

## ⚠️ Important Notes

1. **Security**: Change NEXTAUTH_SECRET in production
2. **Database**: Run migrations before starting
3. **Admin User**: Create via script before using admin APIs
4. **Validation**: All inputs validated with Zod
5. **Errors**: Consistent error responses across all endpoints
6. **Pagination**: Default 20 items, max 100 per page
7. **Multilingual**: All content supports ja/en/th locales
