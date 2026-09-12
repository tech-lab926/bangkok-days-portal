# Site Bang - Bangkok Portal for Japanese Residents

A comprehensive portal site for Japanese residents in Bangkok, built with Next.js, featuring lifestyle information, store discovery, and community interaction with a full-featured admin panel.

## 🎯 Project Status

### ✅ Fully Implemented

#### Backend (100%)
- ✅ Complete database schema with 21+ Prisma models
- ✅ RESTful API endpoints (v1) - Public & Admin
- ✅ Authentication & authorization (NextAuth.js)
- ✅ Role-based access control (3 roles)
- ✅ Multilingual support (ja/en/th)
- ✅ Input validation with Zod
- ✅ Comprehensive error handling
- ✅ Type-safe API utilities

#### Admin Panel UI (90%)
- ✅ **Store Management** - Full CRUD with multilingual support
- ✅ **Article Management** - Rich text editor (Tiptap), CRUD operations
- ✅ **Area/Category/Scene Settings** - Drag-and-drop ordering
- ✅ **Owner Management** - Company management system
- ✅ **Revenue Management** - Monthly billing & invoice tracking
- ✅ **Inquiry Management** - Status workflow system
- ✅ **Pricing Plans** - Service tier configuration
- ✅ **Admin User Management** - Role-based access control
- ✅ **Featured/Spotlight** - Ranking & special pages
- ✅ **Google Maps Integration** - Place picker & data extraction
- ✅ **Image Upload System** - Cloudinary integration
- ✅ **Night Store Management** - Special night venue handling
- ✅ **Authentication Flow** - Secure login/logout
- ✅ **Responsive Sidebar** - Modern navigation with role filtering

### ❌ Not Implemented (By Design)
- ❌ Stripe payment integration
- ❌ Public-facing frontend pages
- ❌ Email notifications
- ❌ Meilisearch integration
- ❌ Redis caching
- ❌ Rate limiting
- ❌ Owner portal (separate login for store owners)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (PostgreSQL)
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# - CLOUDINARY_* credentials

# Setup database
npx prisma migrate dev
npx prisma generate

# Create admin user
npx tsx scripts/create-admin.ts

# (Optional) Seed sample data
npx tsx scripts/seed.ts

# Start development server
npm run dev
```

Visit:
- Admin Panel: http://localhost:3000/admin
- API Docs: See [guides/API_DOCS.md](./guides/API_DOCS.md)

### Default Admin Credentials
Created via `create-admin.ts` script with your custom credentials.

## 📚 Documentation

All comprehensive guides are in the `/guides` folder:

- **[guides/QUICKSTART.md](./guides/QUICKSTART.md)** - Get started in 5 minutes
- **[guides/BACKEND_SETUP.md](./guides/BACKEND_SETUP.md)** - Detailed backend guide
- **[guides/API_DOCS.md](./guides/API_DOCS.md)** - Complete API reference
- **[guides/SUCCESS.md](./guides/SUCCESS.md)** - Implementation summary
- **[guides/FILE_STRUCTURE.md](./guides/FILE_STRUCTURE.md)** - Project structure
- **[guides/FEATURE_ROADMAP.md](./guides/FEATURE_ROADMAP.md)** - Future enhancements
- **[guides/GOOGLE_MAPS_INTEGRATION.md](./guides/GOOGLE_MAPS_INTEGRATION.md)** - Maps setup guide

## 🏗️ Tech Stack

### Core Framework
- **Next.js 16** (App Router) - React framework
- **React 19** - UI library
- **TypeScript** - Type safety

### Backend & Data
- **PostgreSQL** - Primary database
- **Prisma ORM 7.4** - Database management
- **NextAuth.js 4** - Authentication
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

### Frontend & UI
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Headless UI components
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **TanStack Query** - Data fetching & caching

### Rich Content
- **Tiptap** - Rich text editor (WYSIWYG)
- **Google Maps API** - Location services
- **Cloudinary** - Image upload & optimization

### Utilities
- **Sonner** - Toast notifications
- **class-variance-authority** - Component variants
- **clsx** / **tailwind-merge** - Class name utilities
- **cmdk** - Command palette (search)

## 📁 Project Structure

```
site-bang/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   └── v1/                     # API routes
│   │       ├── admin/              # Protected admin APIs
│   │       │   ├── articles/       # Article management
│   │       │   ├── stores/         # Store management
│   │       │   ├── areas/          # Area settings
│   │       │   ├── categories/     # Category settings
│   │       │   ├── scenes/         # Scene settings
│   │       │   ├── owners/         # Owner management
│   │       │   ├── revenue/        # Billing & revenue
│   │       │   ├── inquiries/      # Inquiry management
│   │       │   ├── users/          # Admin user management
│   │       │   ├── pricing-plans/  # Service plans
│   │       │   ├── featured-pages/ # Rankings/features
│   │       │   ├── dashboard/      # Analytics
│   │       │   ├── settings/       # Global settings
│   │       │   ├── upload/         # Image upload
│   │       │   └── google-maps/    # Maps integration
│   │       ├── places/             # Public place APIs
│   │       ├── articles/           # Public article APIs
│   │       ├── areas/              # Public area list
│   │       ├── categories/         # Public category list
│   │       ├── tags/               # Public tag list
│   │       ├── community/          # Community posts/replies
│   │       └── inquiries/          # Public inquiry submission
│   ├── admin/
│   │   ├── login/                  # Admin login page
│   │   ├── page.tsx                # Admin redirect
│   │   └── (authenticated)/        # Protected admin routes
│   │       ├── layout.tsx          # Sidebar layout
│   │       ├── stores/             # Store management UI
│   │       │   ├── page.tsx        # Store list
│   │       │   ├── new/            # Create store
│   │       │   └── [id]/edit/      # Edit store
│   │       ├── articles/           # Article management UI
│   │       │   ├── page.tsx        # Article list
│   │       │   ├── new/            # Create article
│   │       │   └── [id]/edit/      # Edit article
│   │       ├── areas/              # Area settings UI
│   │       ├── categories/         # Category settings UI
│   │       ├── scenes/             # Scene settings UI
│   │       ├── owners/             # Owner management UI
│   │       ├── revenue/            # Revenue tracking UI
│   │       ├── inquiries/          # Inquiry handling UI
│   │       ├── pricing-plans/      # Plan management UI
│   │       ├── featured/           # Featured content UI
│   │       ├── night-stores/       # Night venue filter
│   │       └── settings/           # Admin settings
│   │           ├── admins/         # Admin user CRUD
│   │           └── users/          # End-user management
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Homepage
│   └── globals.css                 # Global styles
├── components/
│   ├── admin/                      # Admin-specific components
│   │   ├── sidebar.tsx             # Navigation sidebar
│   │   ├── page-header.tsx         # Page title component
│   │   ├── fixed-save-button.tsx   # Floating save button
│   │   ├── google-maps-picker.tsx  # Location picker
│   │   ├── image-uploader.tsx      # Image upload widget
│   │   ├── tiptap-editor.tsx       # Rich text editor
│   │   └── confirm-modal.tsx       # Confirmation dialog
│   ├── providers/
│   │   └── session-provider.tsx    # Auth context provider
│   └── ui/                         # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       └── ... (20+ components)
├── lib/
│   ├── admin-api.ts                # Client-side API utilities
│   ├── api-response.ts             # Standardized responses
│   ├── auth.ts                     # Auth utilities
│   ├── auth-options.ts             # NextAuth config
│   ├── cloudinary.ts               # Image upload config
│   ├── errors.ts                   # Error handling
│   ├── password.ts                 # Password hashing
│   ├── prisma.ts                   # Prisma client
│   ├── utils.ts                    # General utilities
│   └── validations/                # Zod schemas
│       ├── article.ts
│       ├── auth.ts
│       ├── common.ts
│       ├── community.ts
│       ├── inquiry.ts
│       └── place.ts
├── prisma/
│   ├── schema.prisma               # Database schema (21 models)
│   └── migrations/                 # Migration history
├── scripts/
│   ├── create-admin.ts             # Admin user creation
│   └── seed.ts                     # Sample data seeding
├── types/
│   └── next-auth.d.ts              # NextAuth type extensions
├── guides/                         # Documentation
└── public/                         # Static assets
```

## 🗄️ Database Models (21 Tables)

### Core Models
- **AdminUser** - Admin users with role-based access
- **Area** + **AreaTranslation** - Geographic areas (multilingual)
- **Category** + **CategoryTranslation** - Store categories
- **Scene** + **SceneTranslation** - Usage scenarios
- **Tag** + **TagTranslation** - Content tags

### Business Models
- **Owner** - Store owners (companies)
- **PricingPlan** - Service tiers & pricing
- **Place** - Stores/venues (main entity)
- **PlaceTranslation** - Store multilingual content
- **PlaceImage** - Store photos
- **PlaceTag** - Many-to-many: Place ↔ Tag
- **PlaceCategory** - Many-to-many: Place ↔ Category
- **PlaceScene** - Many-to-many: Place ↔ Scene

### Content Models
- **Article** + **ArticleTranslation** - News & guides
- **CommunityPost** + **CommunityReply** - User discussions
- **Inquiry** - Contact form submissions

### Revenue Models
- **MonthlyBilling** - Monthly revenue summaries
- **StoreBilling** - Individual store billing records

### System Models
- **FeaturedPage** - Rankings & spotlight pages
- **GlobalSettings** - System configuration
- **Media** - Uploaded file tracking

## 🔌 API Endpoints

### Public APIs (No Auth Required)
```
GET    /api/v1/places              # List stores (with filters)
GET    /api/v1/places/[slug]       # Store details
GET    /api/v1/articles            # List articles
GET    /api/v1/articles/[slug]     # Article details
GET    /api/v1/areas               # List areas
GET    /api/v1/categories          # List categories
GET    /api/v1/tags                # List tags
GET    /api/v1/community/posts     # List community posts
GET    /api/v1/community/posts/[id] # Post details
POST   /api/v1/community/posts     # Create post
POST   /api/v1/community/posts/[id]/replies # Reply to post
POST   /api/v1/inquiries           # Submit inquiry
```

### Admin APIs (Protected - Auth Required)

#### Dashboard & Analytics
```
GET    /api/v1/admin/dashboard     # Summary statistics
```

#### Store Management
```
GET    /api/v1/admin/stores        # List stores (admin view)
GET    /api/v1/admin/stores/[id]   # Get store details
POST   /api/v1/admin/stores        # Create store
PATCH  /api/v1/admin/stores/[id]   # Update store
DELETE /api/v1/admin/stores        # Delete store
```

#### Article Management
```
GET    /api/v1/admin/articles      # List articles (admin)
POST   /api/v1/admin/articles      # Create article
PATCH  /api/v1/admin/articles/[id] # Update article
DELETE /api/v1/admin/articles      # Delete article
```

#### Settings Management
```
GET    /api/v1/admin/areas         # List areas
POST   /api/v1/admin/areas         # Create area
PUT    /api/v1/admin/areas         # Bulk update (ordering)
DELETE /api/v1/admin/areas         # Delete area

GET    /api/v1/admin/categories    # List categories
POST   /api/v1/admin/categories    # Create category
PUT    /api/v1/admin/categories    # Bulk update
DELETE /api/v1/admin/categories    # Delete category

GET    /api/v1/admin/scenes        # List scenes
POST   /api/v1/admin/scenes        # Create scene
PUT    /api/v1/admin/scenes        # Bulk update
```

#### Business Management
```
GET    /api/v1/admin/owners        # List owners
POST   /api/v1/admin/owners        # Create owner
PUT    /api/v1/admin/owners        # Update owner

GET    /api/v1/admin/revenue       # Get monthly billing
POST   /api/v1/admin/revenue       # Generate billing
PATCH  /api/v1/admin/revenue       # Update billing status

GET    /api/v1/admin/inquiries     # List inquiries
PATCH  /api/v1/admin/inquiries     # Update inquiry status

GET    /api/v1/admin/pricing-plans # List plans
POST   /api/v1/admin/pricing-plans # Create plan
PUT    /api/v1/admin/pricing-plans # Update plan
DELETE /api/v1/admin/pricing-plans # Delete plan
```

#### User & System
```
GET    /api/v1/admin/users         # List admin users
POST   /api/v1/admin/users         # Create admin user
PATCH  /api/v1/admin/users         # Update admin user
DELETE /api/v1/admin/users         # Delete admin user

GET    /api/v1/admin/community     # Moderation view
PATCH  /api/v1/admin/community     # Moderate content
DELETE /api/v1/admin/community     # Delete content

GET    /api/v1/admin/featured-pages # Get featured/rankings
PUT    /api/v1/admin/featured-pages # Update featured

GET    /api/v1/admin/settings      # Get global settings
PUT    /api/v1/admin/settings      # Update settings

POST   /api/v1/admin/upload        # Upload image
POST   /api/v1/admin/google-maps/extract # Extract place data
```

## 🎛️ Admin Panel Features

### Store Management
- ✅ Full CRUD operations
- ✅ Multilingual content (ja/en/th)
- ✅ Google Maps location picker
- ✅ Image gallery with drag-and-drop upload
- ✅ Category/Scene/Area assignment
- ✅ Owner assignment
- ✅ Social media links (Instagram, X, Facebook, LINE, TikTok)
- ✅ Visibility toggles (Spotlight, Night Navi)
- ✅ Search & filtering
- ✅ Sort by multiple columns
- ✅ Bulk status changes

### Article Management
- ✅ Rich text editor (Tiptap) with formatting
- ✅ Article types (News/Guide)
- ✅ Multilingual content support
- ✅ Cover image upload
- ✅ Excerpt generation
- ✅ Publish/unpublish toggle
- ✅ Featured article marking
- ✅ Slug-based URLs

### Area/Category/Scene Settings
- ✅ Create, edit, delete
- ✅ Multilingual names
- ✅ Drag-and-drop display ordering
- ✅ Enable/disable toggles
- ✅ Usage count tracking
- ✅ Bulk reordering with save confirmation

### Owner Management
- ✅ Company information management
- ✅ Contact details
- ✅ Multiple stores per owner
- ✅ Billing plan assignment
- ✅ Search functionality

### Revenue Management
- ✅ Monthly billing generation
- ✅ Billing status workflow (Unpaid → Invoiced → Paid)
- ✅ Per-store billing breakdown
- ✅ Revenue totals by month
- ✅ Filtering by year/month

### Inquiry Management
- ✅ View all inquiries
- ✅ Status workflow (Pending → In Progress → Completed)
- ✅ Inquiry type filtering
- ✅ Contact information display
- ✅ Message content view

### Admin User Management (SUPER_ADMIN only)
- ✅ Create admin accounts
- ✅ Role assignment (SUPER_ADMIN/ADMIN/EDITOR)
- ✅ Active/inactive toggle
- ✅ Password management
- ✅ Login ID or email authentication
- ✅ Delete users with confirmation

### UI/UX Features
- ✅ Responsive sidebar navigation
- ✅ Role-based menu filtering
- ✅ Toast notifications (success/error)
- ✅ Loading states & skeleton screens
- ✅ Confirmation dialogs for destructive actions
- ✅ Fixed save buttons on edit pages
- ✅ Language switcher tabs
- ✅ Modern gradient design
- ✅ Search with debouncing
- ✅ Table sorting

## 🔐 Authentication & Authorization

### Roles & Permissions

#### SUPER_ADMIN
- ✅ All features unlocked
- ✅ Admin user management
- ✅ User management
- ✅ System settings
- ✅ All content management
- ✅ Financial data access

#### ADMIN
- ✅ Content management (stores, articles)
- ✅ User management (end-users)
- ✅ Inquiry handling
- ✅ Community moderation
- ✅ Revenue review
- ❌ Cannot manage admin users

#### EDITOR
- ✅ Content creation (stores, articles)
- ✅ Area/Category/Scene editing
- ❌ No user management
- ❌ No financial access
- ❌ No system settings

### Authentication Flow
- Login via email/password or loginId/password
- JWT-based sessions with NextAuth.js
- Session expiry: 30 days (configurable)
- Automatic redirect on unauthorized access
- Secure password hashing with bcrypt

## 🌐 Multilingual Support

All translatable content supports:
- 🇯🇵 Japanese (ja) - Primary language
- 🇬🇧 English (en)
- 🇹🇭 Thai (th)

### Translatable Fields
- Store names, descriptions
- Area/Category/Scene names
- Article titles, content, excerpts
- Tag names

### Database Structure
Uses the translation pattern:
```
Place (base data) → PlaceTranslation (localized content)
Article → ArticleTranslation
Area → AreaTranslation
...etc
```

## 🎨 UI Component Library

Built with **shadcn/ui** (Radix UI primitives):
- Alert Dialog
- Badge
- Button
- Card
- Checkbox
- Command
- Dialog
- Input
- Label
- Popover
- Select
- Separator
- Switch
- Table
- Textarea
- Toast (Sonner)

Custom Admin Components:
- AdminSidebar - Navigation with role filtering
- PageHeader - Consistent page titles
- FixedSaveButton - Floating save button
- GoogleMapsPicker - Location selection
- ImageUploader - Cloudinary integration
- TiptapEditor - Rich text editing
- ConfirmModal - Deletion confirmations

## 🚧 Development Workflow

### Running Locally
```bash
# Start dev server
npm run dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Create & apply migrations
npx prisma migrate dev --name migration_name

# Reset database (DANGER: deletes all data)
npx prisma migrate reset
```

### Code Organization
- **API Routes**: Follow REST conventions (GET/POST/PATCH/DELETE)
- **Validation**: All inputs validated with Zod schemas
- **Error Handling**: Consistent error responses via `lib/api-response.ts`
- **Type Safety**: Full TypeScript coverage
- **Reusability**: Shared utilities in `lib/`

### Adding New Features
1. Update Prisma schema if needed
2. Create/update API routes in `app/api/v1/`
3. Add Zod validation schemas in `lib/validations/`
4. Create admin UI pages in `app/admin/(authenticated)/`
5. Add client API functions in `lib/admin-api.ts`
6. Update documentation

## 🔍 Testing & Debugging

### Useful Tools
```bash
# View database in browser
npx prisma studio

# Check API endpoints
curl http://localhost:3000/api/v1/areas

# View Prisma logs
# Add to .env:
# DATABASE_URL="...?connection_limit=5&pool_timeout=2"
```

### Common Issues
- **Prisma errors**: Run `npx prisma generate`
- **Auth issues**: Check NEXTAUTH_SECRET in .env
- **Database connection**: Verify DATABASE_URL format
- **TypeScript errors**: Restart TS server in VS Code

## 📦 Environment Variables

Required in `.env`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sitebang"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-api-key"

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 🎉 What's Complete

### Backend (100%)
✅ All database models & relationships  
✅ All API endpoints (public + admin)  
✅ Authentication & authorization  
✅ Input validation  
✅ Error handling  
✅ Multilingual database structure  

### Admin Panel (90%)
✅ Store management (full CRUD)  
✅ Article management with rich editor  
✅ Area/Category/Scene settings  
✅ Owner & billing management  
✅ Inquiry handling  
✅ Admin user management  
✅ Featured/ranking pages  
✅ Google Maps integration  
✅ Image upload system  
✅ Responsive navigation  

### Components (100%)
✅ All UI components implemented  
✅ Reusable admin components  
✅ Form validation  
✅ Loading states  
✅ Error handling  
✅ Toast notifications  

## 🔮 Future Enhancements

See [guides/FEATURE_ROADMAP.md](./guides/FEATURE_ROADMAP.md) for detailed roadmap.

### Potential Additions
- 📊 Advanced analytics dashboard
- 🔔 Real-time notifications
- 📧 Email notification system
- 🔍 Meilisearch full-text search
- 💳 Stripe payment integration
- 📱 Owner mobile app
- 🌐 Public-facing website
- 🚀 Performance optimizations (Redis caching)
- 📈 SEO tools & sitemap generation
- 🎨 Theme customization
- 📤 CSV export for all data
- 🔄 Bulk operations
- 📊 Enhanced reporting

## 🛠️ Maintenance

### Regular Tasks
- Monitor database size & performance
- Review error logs
- Backup database regularly
- Update dependencies monthly
- Review security patches

### Performance Tips
- Use database indexes for frequent queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Optimize images with Cloudinary
- Use React Query for client-side caching

## 📞 Support & Documentation

All documentation is self-contained in the `/guides` folder:
- Technical setup guides
- API documentation
- Feature roadmap
- Implementation summaries

For development questions, refer to:
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth.js Docs: https://next-auth.js.org
- Tailwind Docs: https://tailwindcss.com/docs

## 📄 License

Private project for freelance client.

---

**Project Status**: Production-ready admin panel | Public site pending  
**Last Updated**: February 2026  
**Built with**: Next.js 16, Prisma, PostgreSQL, TypeScript
