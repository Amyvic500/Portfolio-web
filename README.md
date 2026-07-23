# Victoria Amarachi Philip — Portfolio (Full System)

A complete, self-hosted portfolio: dynamic pages backed by a **MySQL database**, a login-protected
admin dashboard, and real email sending/receiving through your contact form.

---

## 1. Full Tech Stack

**Frontend**
- HTML5, CSS3, vanilla JavaScript (no framework — fast, simple to maintain)
- Font Awesome (icons), Google Fonts (Cormorant Garamond, Space Mono, DM Sans)

**Backend**
- Node.js
- Express.js — web server & REST API
- MySQL — database (matches what you already run)
- `mysql2` — MySQL driver (promise-based)
- `multer` — file uploads (certificates, CV)
- `nodemailer` — sends email through Brevo SMTP
- `jsonwebtoken` + `cookie-parser` — admin login sessions
- `dotenv` — environment variable management
- `cors` — cross-origin request handling

**Email**
- Brevo (formerly Sendinblue) SMTP relay — free tier, 300 emails/day

**Hosting (recommended)**
- Render.com — free tier, same platform you use for CareQueue
- Railway — free MySQL database hosting

**Dev tools**
- npm (package management)
- Git/GitHub (version control + deployment source)

---

## 2. Project Structure

```
portfolio-app/
├── public/              ← your website (served as-is)
│   ├── index.html, skills-services.html, projects.html,
│   │   cv-certificates.html, media.html, blog.html, admin.html
│   ├── common.js, index.js, projects.js, cv-certificates.js, admin.js, blog.js
│   └── style.css, admin.css, assets/
├── server/
│   ├── server.js         ← app entry point
│   ├── db.js              ← MySQL connection + schema
│   ├── config.js          ← reads .env
│   ├── mailer.js           ← Brevo SMTP sending
│   ├── seed.js              ← loads your real certs/projects into the DB
│   ├── routes/               ← messages, certificates, projects, testimonials, cv, admin
│   ├── middleware/auth.js     ← admin login guard
│   └── uploads/                ← certificate PDFs, CV files
├── .env.example
├── package.json
└── README.md (this file)
```

---

## 3. Run it locally

### Step 1 — Install MySQL (if not already running)
On Windows with XAMPP (as you already use for itforms), just start **MySQL** from the
XAMPP control panel — you already have this.

### Step 2 — Create the database
Open phpMyAdmin (or the `mysql` command line) and run:
```sql
CREATE DATABASE portfolio_db;
```

### Step 3 — Configure the app
```bash
npm install
cp .env.example .env
```
Edit `.env`:
```
ADMIN_PASSWORD=choose-a-strong-password
JWT_SECRET=any-long-random-string
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=portfolio_db
```

### Step 4 — Load your real data and start
```bash
node server/seed.js
npm start
```
Open **http://localhost:4000** — that's your site.
Open **http://localhost:4000/admin.html** and log in with your `ADMIN_PASSWORD`.

The app creates all its own tables automatically on first run — no manual SQL needed.

---

## 4. Set up real email sending (Brevo — free)

1. Go to **https://app.brevo.com** and create a free account.
2. **Settings → SMTP & API → SMTP tab.**
3. Copy your **SMTP login** (usually your Brevo account email).
4. Click **Generate a new SMTP key** — copy it.
5. In `.env`:
   ```
   SMTP_USER=your-brevo-login@example.com
   SMTP_PASS=the-smtp-key-you-generated
   OWNER_EMAIL=victoriamarachi450@gmail.com
   ```
6. Restart the server and test your own contact form.

Until SMTP is set, messages still save to the database and show in your admin inbox — they just
won't trigger an email notification.

---

## 5. Deploy it live (step by step)

You need two things running in production: the **MySQL database** and the **Node.js app**.

### A. Push your code to GitHub
```bash
cd portfolio-app
git init
git add .
git commit -m "Initial commit"
```
Create a new repo on GitHub (e.g. `victoria-portfolio`), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/victoria-portfolio.git
git branch -M main
git push -u origin main
```
`.env` is excluded automatically by `.gitignore` — your passwords never get committed.

### B. Create a free MySQL database on Railway
1. Go to **https://railway.app** → New Project → **Provision MySQL**.
2. Click into it → **Variables** tab → copy `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`,
   `MYSQLPASSWORD`, `MYSQLDATABASE`.

### C. Deploy the app on Render
1. **https://render.com** → New → **Web Service** → connect your GitHub repo.
2. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment** tab — add:
   ```
   ADMIN_PASSWORD=...
   JWT_SECRET=...
   OWNER_EMAIL=victoriamarachi450@gmail.com
   SMTP_USER=...
   SMTP_PASS=...
   SMTP_FROM=Victoria Amarachi Philip <no-reply@yourdomain.com>
   DB_HOST=<MYSQLHOST from Railway>
   DB_PORT=<MYSQLPORT from Railway>
   DB_USER=<MYSQLUSER from Railway>
   DB_PASSWORD=<MYSQLPASSWORD from Railway>
   DB_NAME=<MYSQLDATABASE from Railway>
   ```
4. Add a **Disk** (Render → Disks) mounted at `/opt/render/project/src/server/uploads` — this keeps
   your uploaded certificate PDFs and CV safe across redeploys.
5. Click **Deploy**. Render builds and gives you a URL like `victoria-portfolio.onrender.com`.
6. From Render's **Shell** tab, run once (creates tables + loads your real data):
   ```bash
   node server/seed.js
   ```

### D. Point your own domain (optional)
Render → your service → **Settings → Custom Domain** → add your domain and follow the DNS
instructions (usually a CNAME record at your domain registrar).

---

## 6. Using the admin dashboard day-to-day

Go to `yourdomain.com/admin.html`:
- **Messages** — every enquiry lands here; reply and it emails the client from your address.
- **Certificates** — upload new ones any time (PDF/JPG/PNG).
- **Projects** — add new projects as you complete them.
- **Testimonials** — approve client-submitted reviews before they go public.
- **CV** — replace your CV file any time.

---

## 7. Earning from your portfolio — realistic options

A personal portfolio's value is almost entirely **lead generation**, not ad revenue — traffic is too
low and too niche for ads to pay meaningfully. Here's what actually works, roughly in order of
effort-to-payoff for a site like yours:

1. **Freelance/consulting leads (highest payoff)** — your Services page and contact form exist for
   this. Every message that lands in your admin inbox is a potential paid engagement (IT setup,
   DB admin, DevOps consulting, coaching). This is already built.
2. **Passport/NIN processing & business coaching services** — you already offer these; keep them
   listed clearly with an easy way to book or pay (see #4).
3. **Sell your book directly** — once *Winning in Silence* is done, sell it from your own site
   (Paystack/Flutterwave checkout link, or a Selar/Gumroad page linked from your portfolio) instead
   of only Amazon — you keep more of the revenue and capture buyer emails for future launches.
4. **Take payments directly** — integrate **Paystack** or **Flutterwave** (Nigerian-friendly, both
   have simple JS/Node SDKs) so people can pay for coaching sessions, document processing, or your
   book directly from your site, instead of just messaging you to negotiate.
5. **Affiliate links** — if you recommend tools you actually use (a course platform, hosting,
   productivity tools), some offer referral commissions. Low effort, low but real payoff — only
   worth it for tools you'd recommend anyway.
6. **Sponsored content / brand deals** — realistic later, once your Blog has real traffic and you
   have an audience. Not viable yet with zero published posts.
7. **Display ads (Google AdSense, etc.)** — technically possible but not recommended: portfolio
   traffic volume is too low to earn meaningfully, and ads make a professional portfolio look less
   credible to the recruiters and clients you're actually trying to reach. I'd skip this.

**My honest take:** don't chase ad revenue. Your site's real ROI is turning visitors into freelance
clients and remote job interviews (options 1–2, already built) and, once your book is finished, a
direct sales link (options 3–4). That's a much higher return for far less effort than trying to
monetize traffic itself.

---

## 8. What you asked for, and where it lives

| Request | Where |
|---|---|
| MySQL database (not SQLite) | `server/db.js`, all routes in `server/routes/` |
| Send/receive client emails | Brevo SMTP — outgoing notifications + inbox in admin + real replies |
| Real projects (ITform, etc.) | Seeded in `server/seed.js`, editable from Admin → Projects |
| Book *"Winning in Silence"* + Favinia Nature Farms | About section, homepage |
| Certificate upload, expandable | CV & Certificates page + Admin → Certificates |
| Skills & Services — one page | `skills-services.html` |
| CV & Certificates — one page | `cv-certificates.html` |
| Learning placeholders removed | Real certifications and goals only |
| Blog — you fill it yourself | Empty and ready; "Write New Post" still works |
| Review placeholders removed | Testimonials section starts empty, fills as approved |

---

## Notes
- Change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying publicly.
- Never commit your real `.env` — only `.env.example` is safe to push to GitHub.
