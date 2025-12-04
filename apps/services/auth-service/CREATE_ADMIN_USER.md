# Creating Admin Users

This guide explains different methods to create admin users in the online-shop application.

## User Roles

The system supports three roles:

- **`user`** - Regular customer (default)
- **`vendor`** - Can create and manage products
- **`admin`** - Full administrative access

## Method 1: Using the Create Admin Script (Recommended)

### Quick Start

1. Navigate to the auth-service directory:

   ```bash
   cd apps/services/auth-service
   ```

2. Edit the admin details in `src/scripts/create-admin.ts`:

   ```typescript
   const adminData = {
     email: "admin@example.com", // Change this
     password: "Admin123456", // Change this
     firstName: "Admin", // Change this
     lastName: "User", // Change this
     role: UserRole.ADMIN,
   };
   ```

3. Run the script:
   ```bash
   npm run create-admin
   ```

### Output

```
Creating admin user...
✅ Admin user created successfully!
Email: admin@example.com
Password: Admin123456
Role: admin

User ID: 507f1f77bcf86cd799439011
```

## Method 2: Via API Call

Send a POST request to the registration endpoint with the `role` field:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123456",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

**Response:**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "isActive": true,
    "isEmailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Method 3: Direct MongoDB Update

If you already have a user account and want to upgrade it to admin:

```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017/auth-db?authSource=admin

# Update user role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## Method 4: MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: `mongodb://admin:admin123@localhost:27017/auth-db?authSource=admin`
3. Navigate to `auth-db` > `users` collection
4. Find the user you want to make admin
5. Edit the document and change `role` field to `"admin"`
6. Save changes

## Creating Vendor Users

To create a vendor user (can manage products but not full admin), use any of the above methods but set `role` to `"vendor"`:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "Vendor123456",
    "firstName": "Vendor",
    "lastName": "User",
    "role": "vendor"
  }'
```

## Verification

After creating an admin user, verify it worked:

1. **Check MongoDB:**

   ```bash
   mongosh mongodb://admin:admin123@localhost:27017/auth-db?authSource=admin
   db.users.find({ email: "admin@example.com" })
   ```

2. **Login via API:**

   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "Admin123456"
     }'
   ```

3. **Login via Frontend:**
   - Go to http://localhost:3000/login
   - Enter admin credentials
   - Verify you can access admin features (create products, view all orders, etc.)

## Security Notes

⚠️ **Important:**

- Change default passwords immediately in production
- Use strong passwords (min 8 characters)
- Consider disabling role selection in registration for production
- Store admin credentials securely
- Enable email verification for production environments

## Troubleshooting

### Script fails with "User already exists"

- User with that email is already registered
- Try a different email or update existing user via MongoDB

### Cannot connect to MongoDB

- Ensure MongoDB is running: `docker ps`
- Check connection string in `.env` file
- Verify port 27017 is accessible

### Permission denied

- Ensure you're in the correct directory
- Run: `cd apps/services/auth-service`
- Make sure dependencies are installed: `npm install`
