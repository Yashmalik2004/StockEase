# Database – StockEase MongoDB Configuration

This directory contains MongoDB-related configuration, schema documentation, and the sample data seed script.

## Technology

- **Database:** MongoDB (NoSQL document store)
- **ODM:** Mongoose 8.x (used in `backend/models/`)
- **Connection:** Configured via `MONGO_URI` environment variable in `backend/.env`

---

## Collections

### `admins`

Stores administrator credentials.

| Field | Type | Required | Unique | Notes |
|-------|------|:--------:|:------:|-------|
| `_id` | ObjectId | auto | ✅ | MongoDB document ID |
| `username` | String | ✅ | ✅ | Trimmed |
| `email` | String | ✅ | ✅ | Lowercase, trimmed |
| `password` | String | ✅ | — | Stored as bcrypt hash (10 rounds) |
| `createdAt` | Date | auto | — | Default: `Date.now` |

> Passwords are **never stored in plain text**. The pre-save hook in `backend/models/Admin.js` hashes passwords automatically with bcryptjs.

---

### `products`

Stores inventory product records.

| Field | Type | Required | Unique | Default | Notes |
|-------|------|:--------:|:------:|---------|-------|
| `_id` | ObjectId | auto | ✅ | — | MongoDB document ID |
| `name` | String | ✅ | — | — | Trimmed |
| `description` | String | — | — | `''` | Trimmed |
| `category` | String | ✅ | — | — | Trimmed |
| `price` | Number | ✅ | — | — | Min: 0 |
| `quantity` | Number | ✅ | — | `0` | Min: 0 |
| `sku` | String | ✅ | ✅ | — | Stored uppercase, trimmed |
| `lowStockThreshold` | Number | — | — | `10` | Used for stock status classification |
| `createdAt` | Date | auto | — | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | — | Mongoose timestamp |

**Virtual field `stockStatus`** (not stored in DB, computed at read time):

| Condition | Value |
|-----------|-------|
| `quantity === 0` | `"Out of Stock"` |
| `quantity <= lowStockThreshold` | `"Low Stock"` |
| Otherwise | `"In Stock"` |

---

## Environment Configuration

The database connection is configured via the backend `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/stockease
```

For **MongoDB Atlas**, replace with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stockease?retryWrites=true&w=majority
```

---

## Seed Script

Populate the database with 10 sample products (mix of categories and stock levels):

```bash
# From the repo root:
node database/seed.js

# Or from the backend directory using the npm script:
cd backend && npm run seed
```

The seed script:
1. Connects to MongoDB using the URI in `backend/.env`
2. Clears all existing products
3. Inserts 10 sample products (Electronics, Clothing, Food, Tools)
4. Logs results and disconnects

> **Warning:** Running the seed script will delete all existing products.
