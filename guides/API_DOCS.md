# Backend API Documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sitebang"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Create initial admin user:
```bash
npx tsx scripts/create-admin.ts
```

## API Endpoints

### Public APIs

#### Places
- `GET /api/v1/places` - List places with filters
- `GET /api/v1/places/[slug]` - Get place detail

#### Articles
- `GET /api/v1/articles` - List articles
- `GET /api/v1/articles/[slug]` - Get article detail

#### Community
- `GET /api/v1/community/posts` - List posts
- `GET /api/v1/community/posts/[id]` - Get post with replies
- `POST /api/v1/community/posts` - Create post
- `POST /api/v1/community/posts/[id]/replies` - Create reply

#### Taxonomy
- `GET /api/v1/areas` - List areas
- `GET /api/v1/categories` - List categories
- `GET /api/v1/tags` - List tags

#### Inquiries
- `POST /api/v1/inquiries` - Submit inquiry

### Admin APIs (Requires Authentication)

#### Dashboard
- `GET /api/v1/admin/dashboard` - Get stats

#### Places Management
- `POST /api/v1/admin/places` - Create place
- `PUT /api/v1/admin/places?id={id}` - Update place
- `DELETE /api/v1/admin/places?id={id}` - Delete place

#### Articles Management
- `POST /api/v1/admin/articles` - Create article
- `PUT /api/v1/admin/articles?id={id}` - Update article
- `DELETE /api/v1/admin/articles?id={id}` - Delete article

#### Community Moderation
- `PATCH /api/v1/admin/community?id={id}&type={post|reply}` - Hide/unhide
- `DELETE /api/v1/admin/community?id={id}&type={post|reply}` - Delete

#### Inquiries Management
- `GET /api/v1/admin/inquiries` - List inquiries
- `PATCH /api/v1/admin/inquiries?id={id}` - Update inquiry status/reply

#### User Management (Super Admin only)
- `GET /api/v1/admin/users` - List admin users
- `POST /api/v1/admin/users` - Create admin user
- `PATCH /api/v1/admin/users?id={id}` - Update admin user
- `DELETE /api/v1/admin/users?id={id}` - Delete admin user

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Locale
- `locale` - Language code (ja, en, th)

### Place Filters
- `areaId` - Filter by area UUID
- `categoryId` - Filter by category UUID
- `priceRange` - Filter by price (1-5)
- `featured` - Filter featured places (true/false)

### Article Filters
- `type` - Article type (NEWS, GUIDE)
- `published` - Published status (true/false)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication

Admin APIs require authentication via NextAuth session. Include credentials in login:

```bash
POST /api/auth/signin
{
  "email": "admin@example.com",
  "password": "password"
}
```

## Role-Based Access

- **SUPER_ADMIN**: Full access
- **ADMIN**: Manage content, moderate community
- **EDITOR**: Create/edit content only
