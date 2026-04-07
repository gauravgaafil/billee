# Deploying Billee on Hostinger Shared Hosting

## Prerequisites
- Hostinger **Business** or **Premium** shared hosting plan (requires Node.js + SSH access)
- A domain pointed to your Hostinger hosting

---

## Step 1: Create MySQL Database

1. Log in to **hPanel** (Hostinger control panel)
2. Go to **Databases** → **MySQL Databases**
3. Create a new database:
   - Database name: `billee`
   - Username: `billee_user`
   - Password: (generate a strong password, save it)
4. Note your database details:
   - Host: `localhost` (or check in hPanel under database details)
   - Port: `3306`

---

## Step 2: Upload Files

### Option A: Via Git (Recommended)

1. Go to **Advanced** → **SSH Access** in hPanel
2. Connect via SSH:
   ```bash
   ssh u123456789@your-server-ip -p 65002
   ```
3. Navigate to your domain folder:
   ```bash
   cd ~/domains/yourdomain.com/public_html
   ```
4. Clone the repo:
   ```bash
   git clone https://github.com/gauravgaafil/billee.git .
   ```

### Option B: Via File Manager

1. Build locally first: `npm run build`
2. Upload all files to `public_html` via Hostinger File Manager

---

## Step 3: Configure Environment

Create the `.env` file in the `server/` folder:

```bash
cd ~/domains/yourdomain.com/public_html/server
nano .env
```

Add:
```env
DATABASE_URL="mysql://billee_user:YOUR_PASSWORD@localhost:3306/u123456789_billee"
JWT_SECRET="GENERATE_A_RANDOM_64_CHAR_STRING_HERE"
PORT=3000
```

> **Important:** Hostinger prefixes database names with your username (e.g., `u123456789_billee`)

---

## Step 4: Set Up Node.js App in hPanel

1. Go to **Website** → **Node.js** in hPanel
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or 20.x
   - **Application root**: `domains/yourdomain.com/public_html`
   - **Application startup file**: `server/dist/index.js`
   - **Port**: Leave as assigned (Hostinger handles port mapping)
4. Click **Create**

---

## Step 5: Install & Build via SSH

```bash
# Connect via SSH
ssh u123456789@your-server-ip -p 65002

# Go to project
cd ~/domains/yourdomain.com/public_html

# Install dependencies
npm run install:all

# Generate Prisma client & push schema to MySQL
npm run db:generate
npm run db:push

# Build frontend + backend
npm run build
```

---

## Step 6: Start/Restart the App

In hPanel → Node.js section:
- Click **Restart** on your application

Or via SSH:
```bash
# The app should auto-start via hPanel Node.js manager
# To check if it's running:
curl http://localhost:3000/api/health
```

---

## Step 7: Verify

Visit `https://yourdomain.com` — you should see the Billee login page!

1. Register a new account
2. Log in
3. Create a client and invoice
4. Verify everything works

---

## Troubleshooting

### App won't start
- Check Node.js version in hPanel (must be 18+)
- Verify `.env` file exists in `server/` with correct DATABASE_URL
- Check logs in hPanel → Node.js → Logs

### Database connection error
- Verify database name includes your Hostinger username prefix
- Check that the database user has full permissions
- Test connection: `mysql -u billee_user -p -h localhost u123456789_billee`

### 502 Bad Gateway
- The Node.js app might not be running — restart it in hPanel
- Check if the port matches what's configured
- Build might have failed — re-run `npm run build`

### Blank page
- Make sure you ran `npm run build` (builds the React frontend)
- Check that `client/dist/index.html` exists

---

## Updating

After making changes:

```bash
cd ~/domains/yourdomain.com/public_html
git pull origin claude/billing-saas-platform-kXsLS
npm run install:all
npm run db:push    # if schema changed
npm run build
```

Then restart the Node.js app in hPanel.
