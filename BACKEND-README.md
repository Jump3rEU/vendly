# Vendly Backend - Production API Documentation

## 🏗️ Architecture Overview

Vendly je plně funkční marketplace backend s kompletním escrow systémem, autentizací, platbami a moderací.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **Payments**: Stripe (escrow pattern)
- **Storage**: Cloudinary (images)
- **Validation**: Zod schemas
- **Security**: Rate limiting, RBAC, ownership checks

---

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vendly"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Platform Settings
PLATFORM_FEE_PERCENTAGE=5
AUTO_RELEASE_DAYS=7
MAX_UPLOAD_SIZE_MB=10
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Open Prisma Studio (optional)
npm run prisma:studio
```

### 4. Create Admin User

Run this in Prisma Studio or directly in database:

```sql
INSERT INTO users (id, email, password, name, role, status)
VALUES (
  gen_random_uuid(),
  'admin@vendly.cz',
  -- Use bcrypt hash for password: "admin123"
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewof8VDVj/Nj5ETC',
  'Admin',
  'ADMIN',
  'ACTIVE'
);
```

### 5. Configure Stripe Webhook

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 6. Run Development Server

```bash
npm run dev
```

Server běží na: http://localhost:3000

---

## 🔐 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Jan Novák",
  "phone": "+420123456789"
}
```

#### Login (NextAuth)
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

---

### Listings

#### Create Listing
```http
POST /api/listings
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "title": "iPhone 13 Pro - jako nový",
  "description": "Prodám iPhone 13 Pro...",
  "category": "elektronika",
  "condition": "LIKE_NEW",
  "price": 25000,
  "originalPrice": 35000,
  "images": ["https://..."],
  "location": "Praha"
}
```

#### Search Listings
```http
GET /api/listings?q=iphone&category=elektronika&minPrice=10000&maxPrice=30000&sortBy=newest
```

#### Get Listing Detail
```http
GET /api/listings/[id]
```

#### Update Listing
```http
PATCH /api/listings/[id]
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "price": 23000,
  "status": "ACTIVE"
}
```

#### Like/Unlike Listing
```http
POST /api/listings/[id]/like
Authorization: Bearer <session-token>
```

---

### Orders & Escrow

#### Create Order
```http
POST /api/orders
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "listingId": "listing-id"
}
```

#### Get User Orders
```http
GET /api/orders?type=purchases  # or type=sales
Authorization: Bearer <session-token>
```

#### Get Order Detail
```http
GET /api/orders/[id]
Authorization: Bearer <session-token>
```

#### Update Order Status
```http
PATCH /api/orders/[id]
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "action": "mark_shipped",
  "trackingNumber": "CP123456789CZ"
}

# Available actions:
# - mark_shipped (seller)
# - confirm_delivery (buyer)
# - cancel (buyer/seller)
```

---

### Payments (Stripe)

#### Create Checkout Session
```http
POST /api/checkout/create-session
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "orderId": "order-id"
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

#### Stripe Webhook (Internal)
```http
POST /api/webhooks/stripe
Stripe-Signature: <signature>

Handles events:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded
```

---

### Disputes

#### Open Dispute
```http
POST /api/orders/[id]/dispute
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "reason": "ITEM_NOT_AS_DESCRIBED",
  "description": "Produkt neodpovídá popisu...",
  "evidence": ["https://..."]
}
```

#### Get Dispute Details
```http
GET /api/orders/[id]/dispute
Authorization: Bearer <session-token>
```

---

### Reviews

#### Submit Review
```http
POST /api/orders/[orderId]/review
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Skvělý prodejce, rychlé dodání!"
}
```

---

### User Profiles

#### Get User Profile
```http
GET /api/users/[id]
```

#### Update Own Profile
```http
PATCH /api/users/[id]
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "name": "Nové jméno",
  "phone": "+420987654321",
  "avatar": "https://..."
}
```

---

### Messaging

#### Send Message
```http
POST /api/messages
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "receiverId": "user-id",
  "content": "Dobrý den, mám zájem o váš inzerát...",
  "listingId": "listing-id"  # optional
}
```

#### Get Conversations
```http
GET /api/messages
Authorization: Bearer <session-token>
```

#### Get Conversation with User
```http
GET /api/messages?userId=<user-id>
Authorization: Bearer <session-token>
```

---

### Image Upload

#### Upload Images
```http
POST /api/upload
Authorization: Bearer <session-token>
Content-Type: multipart/form-data

Form data:
- images: File[] (max 10 files, max 10MB each)

Supported formats: JPEG, PNG, WebP
```

---

### Admin APIs (Requires ADMIN role)

#### Get Platform Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin-session>
```

#### Suspend User
```http
POST /api/admin/users/[id]/suspend
Authorization: Bearer <admin-session>
Content-Type: application/json

{
  "reason": "Porušení pravidel...",
  "duration": "temporary"  # or "permanent"
}
```

#### Resolve Dispute
```http
PATCH /api/admin/disputes/[id]/resolve
Authorization: Bearer <admin-session>
Content-Type: application/json

{
  "resolution": "refund_full",  # or "refund_partial", "no_refund"
  "refundAmount": 10000,  # required for partial refund
  "adminNotes": "Internal notes...",
  "resolutionText": "Text sent to parties..."
}
```

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ NextAuth with secure session management
- ✅ Role-based access control (USER, SELLER, ADMIN)
- ✅ Ownership checks on all sensitive operations
- ✅ Account status validation (ACTIVE, SUSPENDED, BANNED)

### Rate Limiting
- **Auth endpoints**: 5 requests/minute
- **API endpoints**: 60 requests/minute
- **Upload endpoint**: 10 requests/minute

### Data Validation
- ✅ Zod schemas for all inputs
- ✅ File type and size validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (Next.js built-in)

### Payment Security
- ✅ Stripe webhook signature verification
- ✅ Idempotent payment handlers
- ✅ Escrow system (7-day hold)
- ✅ Dispute resolution flow

---

## 💰 Escrow Flow

```
1. Buyer creates order
   └─> Order status: PENDING_PAYMENT
   
2. Buyer pays via Stripe
   └─> Money captured by platform
   └─> Order status: PAYMENT_HELD
   └─> Payment status: HELD
   
3. Seller ships item
   └─> Order status: SHIPPED
   
4. Buyer confirms delivery
   └─> Order status: DELIVERED
   └─> Payment status: RELEASED
   └─> Money transferred to seller
   
5. (Optional) Buyer opens dispute
   └─> Order status: DISPUTED
   └─> Payment frozen until admin resolves
```

**Auto-release**: If buyer doesn't open dispute within 7 days, payment automatically releases to seller.

---

## 🚀 Production Deployment

### Environment Variables
```bash
# Set in production
NODE_ENV=production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://vendly.cz"
REDIS_URL="redis://..."  # For rate limiting
```

### Database Migration
```bash
# Use Prisma Migrate for production
npx prisma migrate deploy
```

### Stripe Production Setup
1. Switch to production Stripe keys
2. Configure webhook endpoint: `https://vendly.cz/api/webhooks/stripe`
3. Test webhook delivery in Stripe dashboard

### Monitoring
- Log all errors to service (Sentry, LogRocket)
- Monitor Stripe webhook delivery
- Track escrow release jobs
- Alert on failed payments

---

## 📊 Database Schema

See `prisma/schema.prisma` for complete schema.

**Key Models**:
- `User` - Users with roles and trust scores
- `Listing` - Product listings with categories
- `Order` - Orders with escrow status
- `Payment` - Stripe payment tracking
- `Dispute` - Dispute resolution system
- `Review` - Seller ratings
- `Message` - Direct messaging
- `Report` - Content moderation
- `AdminAction` - Audit log

---

## 🛠️ Development Tools

```bash
# Prisma Studio (DB GUI)
npm run prisma:studio

# Generate Prisma types
npm run prisma:generate

# View Stripe events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test payments
stripe trigger payment_intent.succeeded
```

---

## 📝 TODO Before Production

- [ ] Set up Redis for rate limiting (currently in-memory)
- [ ] Implement BullMQ for background jobs (email, auto-release)
- [ ] Set up email service (Resend, SendGrid)
- [ ] Add WebSocket server for real-time chat
- [ ] Implement AI content moderation
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure CDN for image delivery
- [ ] Add end-to-end tests
- [ ] Implement backup strategy
- [ ] Set up staging environment

---

## 🤝 Support

Pro otázky kontaktujte: dev@vendly.cz

**Dokumentace vytvořena**: 3. února 2026
