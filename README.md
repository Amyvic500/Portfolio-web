# Victoria Amarachi Philip — Portfolio (Full System)

A self-hosted portfolio: dynamic pages backed by a MySQL database, a login-protected admin
dashboard, and real email sending/receiving through the contact form.

**Stack:** Node.js, Express, MySQL (`mysql2`), Multer (uploads), Nodemailer + Brevo SMTP (email),
JWT + cookies (admin auth). Frontend is plain HTML/CSS/JS — no framework.

**Structure:**
- `public/` → the website (index, skills-services, projects, cv-certificates, media, blog, admin)
- `server/` → Express API, MySQL connection, routes, file uploads

---

## Run it locally

1. Start MySQL (XAMPP → MySQL), then create the database:
   ```sql
   CREATE DATABASE portfolio_db;
   ```
2. Configure:
   ```bash
   npm install
   cp .env.example .env
   ```
   Edit `.env` — set `ADMIN_PASSWORD`, `JWT_SECRET`, and your MySQL credentials (`DB_HOST`,
   `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
3. Load your data and start:
   ```bash
   node server/seed.js
   npm start
   ```
   Site: `http://localhost:4000` · Admin: `http://localhost:4000/admin.html`

Tables are created automatically on first run — no manual SQL needed beyond step 1.

---

## Email setup (Brevo, free — 300/day)

1. Create a free account at **app.brevo.com**.
2. Settings → SMTP & API → SMTP tab → copy your **SMTP login**, generate an **SMTP key**.
3. Add to `.env`:
   ```
   SMTP_USER=your-brevo-login@example.com
   SMTP_PASS=your-smtp-key
   OWNER_EMAIL=your-email@example.com
   ```

Without this, messages still save and show in the admin inbox — they just won't email you.

---

## Deploy live

1. **MySQL** — Railway.app → New Project → Provision MySQL → copy the host, port, user,
   password and database name from the Variables tab. Use the **public** (TCP proxy) host and
   port, since Render is outside Railway's network.
2. **App** — Render.com → New → Web Service → connect this repo and choose the branch to deploy.
   - Build: `npm install` · Start: `npm start`
   - Add all `.env` variables under Environment, using the Railway MySQL values above.
   - Optional: add a Disk mounted at `/opt/render/project/src/server/uploads` to keep uploaded
     certificates and CV across redeploys. Disks need a paid Render instance — on the free tier,
     files uploaded through the admin page are lost on redeploy.
3. Deploy, then run once from Render's Shell tab: `node server/seed.js`
4. Optional: Render → Settings → Custom Domain, to point your own domain at it.

---

## Admin dashboard (`/admin.html`)

- **Messages** — reply from here; sends a real email to the client.
- **Certificates / Projects / CV** — add or replace any time.
- **Testimonials** — approve before they go public.

---

## Notes

- Change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying publicly.
- Never commit your real `.env` — only `.env.example` is safe to push to GitHub.