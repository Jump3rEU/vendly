# Review and Trust System Documentation

## Overview
Comprehensive review system with fraud-resistant trust score calculation for buyers and sellers.

## Features

### ✅ Core Features
- ✅ **Bidirectional Reviews**: Both buyers and sellers can review each other after order completion
- ✅ **Trust Score Calculation**: Multi-factor algorithm (0-100 scale) with fraud resistance
- ✅ **Profile Aggregation**: Review stats, rating distribution, and trust metrics on user profiles
- ✅ **Review Reporting**: Users can report inappropriate reviews
- ✅ **Review Submission UI**: Star rating with comment form
- ✅ **Review Display**: List with pagination, sorting, and filtering

### 🛡️ Fraud Protection
- Weighted ratings by recency (newer reviews matter more)
- Verified reviewer bonus (ID/phone verified users have higher weight)
- Duplicate review detection (same reviewer multiple times)
- Velocity checks (flagging > 5 reviews in 24h)
- Consistency scoring (rewards stable high ratings)
- Account age factor (older accounts more trusted)

## Trust Score Algorithm

### Formula
```
trustScore = baseRating(50) + volume(20) + verification(15) + recency(10) + consistency(5) - fraudPenalty
```

### Components

#### 1. Base Rating (0-50 points)
- Weighted average of all reviews
- Newer reviews weighted higher (decay over 1 year)
- Verified reviewers weighted 1.2x
- Formula: `(avgRating / 5) * 50`

#### 2. Volume Bonus (0-20 points)
Progressive scaling based on total transactions:
- 5+ transactions: 3 points
- 10+ transactions: 5 points
- 20+ transactions: 10 points
- 50+ transactions: 15 points
- 100+ transactions: 20 points

#### 3. Verification Bonus (0-15 points)
- ID verified: +10 points
- Phone verified: +5 points

#### 4. Recent Activity (0-10 points)
Based on reviews in last 90 days:
- 5+ reviews: +10 points
- 3+ reviews: +5 points
- 1+ review: +2 points

#### 5. Consistency Score (0-5 points)
Rewards consistent high ratings (4-5 stars):
- ≥90% high ratings (5+ reviews): +5 points
- ≥80% high ratings (3+ reviews): +3 points

#### 6. Account Age Bonus (0-5 points)
- 365+ days: +5 points
- 180+ days: +3 points
- 90+ days: +2 points

#### 7. Fraud Penalties
- >30% duplicate reviews from same users: -10 points
- >5 reviews in 24h: -5 points

### Trust Score Tiers
- **90-100**: Exceptional (Highly Trusted) 🏆
- **80-89**: Excellent (Verified Seller) ✅
- **70-79**: Very Good 👍
- **60-69**: Good ⭐
- **50-59**: Average 😐
- **<50**: Below Average ⚠️

## Database Schema

### Review Model
```prisma
model Review {
  id          String   @id @default(cuid())
  orderId     String   @unique
  reviewerId  String   // User who writes review
  reviewedId  String   // User being reviewed
  rating      Int      // 1-5 stars
  comment     String
  reported    Boolean  @default(false)
  hidden      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  order       Order    @relation(fields: [orderId], references: [id])
  reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewed    User     @relation("ReviewsReceived", fields: [reviewedId], references: [id])
}
```

### User Fields
```prisma
model User {
  trustScore      Float   @default(0)     // 0-100
  totalSales      Int     @default(0)
  totalPurchases  Int     @default(0)
  idVerified      Boolean @default(false)
  phoneVerified   Boolean @default(false)
}
```

## API Endpoints

### 1. Create Review
**POST** `/api/orders/[id]/review`

Creates a review for completed order.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great seller, fast shipping!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rev_123",
    "rating": 5,
    "comment": "Great seller, fast shipping!",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation:**
- Order must be in `COMPLETED` status
- User must be buyer or seller on order
- Cannot review your own orders
- One review per order per user
- Rating must be 1-5
- Comment must be 10-500 characters

**Side Effects:**
- Recalculates trust score for reviewed user
- Updates order relationship

### 2. Check Review Status
**GET** `/api/orders/[id]/review`

Checks if user can review order and if review already exists.

**Response:**
```json
{
  "success": true,
  "data": {
    "canReview": true,
    "hasReview": false,
    "review": null
  }
}
```

### 3. Get User Reviews
**GET** `/api/users/[id]/reviews?page=1&limit=10`

Fetches reviews received by user with pagination.

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2024-01-15T10:30:00Z",
        "reviewer": {
          "id": "user_456",
          "name": "John Doe",
          "avatar": "https://...",
          "trustScore": 85
        },
        "order": {
          "id": "ord_789",
          "listing": {
            "title": "iPhone 13",
            "images": ["https://..."]
          }
        }
      }
    ],
    "stats": {
      "avgRating": 4.8,
      "totalReviews": 47,
      "distribution": {
        "5": 35,
        "4": 10,
        "3": 2,
        "2": 0,
        "1": 0
      }
    },
    "hasMore": true,
    "total": 47
  }
}
```

### 4. Report Review
**POST** `/api/reviews/[id]/report`

Reports abusive or inappropriate review.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Hodnocení bylo nahlášeno"
  }
}
```

**Validation:**
- Cannot report your own reviews
- Can only report if you're the reviewed person
- Creates Report entry in database
- Marks review as reported (hidden from public)

## Frontend Components

### 1. Review Submission Form
**Path:** `/objednavky/[id]/hodnotit`

**Features:**
- Star rating selector (1-5)
- Comment textarea (10-500 chars)
- Character counter
- Order and reviewed user info display
- Validation and error handling

**Usage:**
```tsx
// Button on order detail page
<Button onClick={() => router.push(`/objednavky/${orderId}/hodnotit`)}>
  <Star className="w-5 h-5" />
  Napsat hodnocení
</Button>
```

### 2. Reviews List Component
**Component:** `<ReviewsList userId={userId} />`

**Features:**
- Average rating display
- Rating distribution chart
- Paginated review list
- Review reporting
- Reviewer trust badges
- Related listing preview

**Usage:**
```tsx
import ReviewsList from '@/components/ReviewsList'

<ReviewsList userId={userId} />
```

### 3. Public Profile Page
**Path:** `/profil/[id]`

**Features:**
- User info and avatar
- Trust score badge
- Transaction statistics
- Reviews section with ReviewsList component

## User Flows

### Buyer Reviews Seller
1. Order completed (`status = COMPLETED`)
2. Buyer visits order detail page
3. Sees "Ohodnoťte transakci" card with review button
4. Clicks "Napsat hodnocení"
5. Redirected to `/objednavky/[id]/hodnotit`
6. Fills star rating (1-5) and comment
7. Submits review
8. Seller's trust score recalculated
9. Review appears on seller's profile

### Seller Reviews Buyer
Same flow as above, but seller reviews buyer.

### View User Reviews
1. Click on user name/avatar anywhere in app
2. Redirected to `/profil/[id]`
3. See trust score, stats, and reviews
4. Scroll through paginated reviews
5. Click "Načíst další" for more reviews

### Report Review
1. View review on profile page
2. Click flag icon
3. Confirm report dialog
4. Review reported and hidden
5. Admin notified (future feature)

## Security & Validation

### Preventing Fraud
1. **One review per order**: Unique constraint on `Review.orderId`
2. **Completed orders only**: Status check before allowing review
3. **No self-reviews**: Prevent reviewing yourself
4. **Weighted ratings**: Recent reviews and verified users weighted higher
5. **Duplicate detection**: Penalty for multiple reviews from same user
6. **Velocity limits**: Flag accounts with >5 reviews in 24h
7. **Account age factor**: Newer accounts have less weight

### Input Validation
- Rating: Integer 1-5
- Comment: String 10-500 characters
- SQL injection: Prisma parameterized queries
- XSS: React automatic escaping

## Trust Score Recalculation

Triggered when:
- New review submitted
- Review reported/hidden
- User verification status changes

Process:
1. Fetch all non-hidden reviews for user
2. Calculate weighted average rating
3. Apply volume, verification, recency bonuses
4. Detect fraud patterns and apply penalties
5. Cap score between 0-100
6. Update `User.trustScore`

## Future Enhancements

### Planned Features
- [ ] Review photos (attach images to reviews)
- [ ] Review editing (limited time window)
- [ ] Review responses (seller can reply)
- [ ] Admin review moderation dashboard
- [ ] Email notifications for new reviews
- [ ] Review reminders after delivery
- [ ] Trust score history graph
- [ ] Review sentiment analysis
- [ ] Anonymous reviews option
- [ ] Review helpful votes
- [ ] Verified purchase badge

### Advanced Fraud Detection
- [ ] IP address tracking
- [ ] Device fingerprinting
- [ ] Review text similarity detection
- [ ] Coordinated review campaign detection
- [ ] Suspicious rating pattern analysis
- [ ] Machine learning fraud prediction

## Testing Checklist

### Manual Testing
- [ ] Create review after order completion
- [ ] Verify trust score updates correctly
- [ ] Cannot create duplicate reviews
- [ ] Cannot review before order completion
- [ ] Cannot review own orders
- [ ] Review appears on profile
- [ ] Report review functionality
- [ ] Pagination works correctly
- [ ] Rating distribution accurate

### Edge Cases
- [ ] User with 0 reviews (default trust score 50)
- [ ] User with all 5-star reviews
- [ ] User with all 1-star reviews
- [ ] Multiple reviews in short time
- [ ] Very old account with few reviews
- [ ] Verified vs unverified reviewer weight
- [ ] Review reported and hidden

## Monitoring & Analytics

### Key Metrics
- Average reviews per user
- Trust score distribution
- Review submission rate
- Reported reviews count
- Average time to review
- Rating distribution trends

### Alerts
- Spike in reported reviews
- Suspicious review patterns
- Trust score anomalies
- Low review submission rate

## Support & Troubleshooting

### Common Issues

**Q: Why isn't my review showing up?**
A: Reviews are only visible if the order is completed and the review hasn't been reported/hidden.

**Q: How is trust score calculated?**
A: See Trust Score Algorithm section above. It's a multi-factor calculation including ratings, volume, verification, recency, and consistency.

**Q: Can I edit my review?**
A: Currently no. This is a planned feature for the future.

**Q: Why can't I review this order?**
A: Reviews can only be submitted for completed orders where you are the buyer or seller.

## Conclusion

The review and trust system provides robust fraud-resistant reputation scoring for marketplace users. The multi-factor trust algorithm ensures fair and accurate representation of user trustworthiness while preventing manipulation.
