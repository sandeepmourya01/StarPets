# Star Pets, Chandigarh: website and appointment booking

A complete website for a veterinary clinic with online appointment booking.

- **Customers** can book without an account, or sign up to see and cancel their own appointments.
- **Admin (clinic staff)** log in to a dashboard to see every appointment, search and filter, and confirm, complete or cancel them.
- Built with **Next.js** (the website), **Supabase** (database and logins) and deployed on **Vercel** (hosting).

Follow the steps in order. Nothing here needs you to write code. Set aside about 60 to 90 minutes the first time.

---

## What is where

| Page | Address | Who can open it |
|---|---|---|
| Home page with booking form | `/` | Everyone |
| Booking page | `/book` | Everyone |
| Create account / Log in | `/signup`, `/login` | Everyone |
| My appointments | `/account` | Logged-in customers |
| Admin dashboard | `/admin` | Admin accounts only |

The clinic's name, phone, address, hours, services and FAQs all live in **one file**: `src/lib/clinic.ts`.

---

## Step 0. Install the tools (one time)

1. **Node.js** (LTS version): https://nodejs.org. Install with the default options.
2. **Git**: https://git-scm.com/downloads
3. **VS Code** (a free editor to open the project): https://code.visualstudio.com
4. Create free accounts on **GitHub** (https://github.com), **Supabase** (https://supabase.com) and **Vercel** (https://vercel.com). Use "Continue with GitHub" on Supabase and Vercel to save time.

To check the install, open a terminal (Command Prompt on Windows, Terminal on Mac) and run `node -v` and `git --version`. Both should print a version number.

---

## Step 1. Open the project on your computer

1. Unzip the `star-pets` folder somewhere easy, for example your Documents folder.
2. Open the folder in VS Code (File, then Open Folder).
3. Open the terminal inside VS Code (Terminal, then New Terminal) and run:

```bash
npm install
```

This downloads everything the site needs. It takes a minute or two.

---

## Step 2. Set up the database in Supabase

1. Go to https://supabase.com/dashboard and click **New project**.
   - Name: `star-pets`
   - Database password: create a strong one and **save it in a password manager**.
   - Region: **South Asia (Mumbai)**, which is closest to Chandigarh.
2. Wait a couple of minutes while the project is created.
3. In the left menu open **SQL Editor**, then **New query**.
4. Open the file `supabase/schema.sql` from this project, copy **all** of it, paste it into the SQL Editor and click **Run**. You should see "Success. No rows returned".
   - This creates the tables, the security rules and the "no double booking" protection.
5. Get your two connection values:
   - Click **Project Settings** (gear icon), then **API Keys** (on some versions this is just **API**).
   - Copy the **Project URL**. It looks like `https://abcdxyz.supabase.co`.
   - Copy the **Publishable key** (it starts with `sb_publishable_`). If your dashboard only shows an older **anon** key, copy that instead. Both work.
   - These two values are safe to use in the website. Never share or use the **secret** or **service_role** key. This project does not need it.
6. Make sign-up easy while you test:
   - Open **Authentication**, then **Sign In / Providers**, then **Email**.
   - Turn **Confirm email** off for now. You can turn it back on later (see Step 7).

---

## Step 3. Connect the website to the database and test it locally

1. In VS Code, find the file `.env.example`. Make a copy and name the copy `.env.local`.
2. Open `.env.local` and paste in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Start the site:

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser. You should see the Star Pets home page.
5. **Test a customer booking:** fill in the form, pick a date and a time, and press Book appointment. You should see "Booking received".
6. **Create your admin account:**
   - Go to http://localhost:3000/signup and create an account with the email you will use as the clinic admin.
   - Back in Supabase, open **SQL Editor**, **New query**, and run this (with your own email):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

   - Log out and log in again on the website. You will now land on the **Admin dashboard** and see the test booking. Try Confirm.
7. **Test a customer account:** open a private/incognito window, sign up with a different email, book an appointment, and check it shows on **My appointments**.

Stop the local site any time with `Ctrl + C` in the terminal.

---

## Step 4. Put the project on GitHub

Vercel deploys straight from GitHub, so the code needs to live there.

1. On GitHub, click **New repository**. Name it `star-pets`, choose **Private**, and do **not** tick any "add a README" boxes. Click **Create repository**.
2. In the VS Code terminal run these commands one by one (replace `YOUR-USERNAME`):

```bash
git init
git add .
git commit -m "First version of Star Pets website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/star-pets.git
git push -u origin main
```

Your `.env.local` file is deliberately **not** uploaded (it is listed in `.gitignore`). That is correct: secrets stay off GitHub.

---

## Step 5. Deploy on Vercel

1. Go to https://vercel.com/new and choose your `star-pets` repository (**Import**).
2. Leave the framework as **Next.js** and the default build settings.
3. Open **Environment Variables** and add these three (same values as your `.env.local`, but use your live address for the third once you know it; you can fill in a guess now and fix it after):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your Supabase publishable (or anon) key |
| `NEXT_PUBLIC_SITE_URL` | `https://star-pets.vercel.app` (use the address Vercel gives you) |

4. Click **Deploy**. After a minute or two Vercel shows your live address, for example `https://star-pets.vercel.app`.

---

## Step 6. Tell Supabase about your live website

Logins and confirmation emails need to know your real address.

1. In Supabase, open **Authentication**, then **URL Configuration**.
2. **Site URL:** your Vercel address, for example `https://star-pets.vercel.app`.
3. **Redirect URLs:** add both of these:
   - `https://star-pets.vercel.app/**`
   - `http://localhost:3000/**`
4. Save.

Now open your live site and repeat the Step 3 tests (booking, admin login, customer login) on the real address. If you created your admin account while testing locally, it is the same database, so it already works.

---

## Step 7. Before real customers use it

Do these before you announce the site.

1. **Replace every placeholder** in `src/lib/clinic.ts`: address, phone numbers, email, WhatsApp number, head vet's name, map search text, opening hours. Search the file for `TODO`. Then save, commit and push (see "Making changes" below).
2. **Add clinic photos** later by placing images in a `public/` folder and showing them on the page. Ask a developer or ask Claude to help.
3. **Turn email confirmation back on** (recommended): Supabase, Authentication, Sign In / Providers, Email, **Confirm email** on. Sign-ups then need to click the link emailed to them.
   - Supabase's built-in email sender is limited to a few emails per hour. For a real clinic, set up your own email service under Authentication, then SMTP Settings (Resend and Brevo both have free plans).
4. **Choose the right plans.**
   - Supabase free projects can **pause after a week of inactivity**, which would take your booking site offline. A clinic should use a paid Supabase plan so this cannot happen.
   - Vercel's free Hobby plan is meant for personal, non-commercial projects. Check Vercel's current terms; a business website normally goes on a paid plan.
5. **Add a Privacy Policy page.** The site stores customers' names, phone numbers and emails. Have the clinic's advisor write a short privacy policy and link it in the footer.
6. **Make more staff admins** the same way as Step 3: they sign up on the site, then you run the `update ... set role = 'admin'` query with their email.
7. **Custom domain** (for example `starpets.in`): in Vercel, Project, Settings, Domains, then follow the instructions. Afterwards update `NEXT_PUBLIC_SITE_URL` in Vercel and the Site URL and Redirect URLs in Supabase, then redeploy.

---

## Making changes later

Edit the files in VS Code, then run:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel notices the push and republishes the site within about a minute.

To change how many appointments can happen at once in the same time slot (currently 2), change `slotCapacity` in `src/lib/clinic.ts` **and** the number `2` inside `check_slot_capacity()` in Supabase (SQL Editor, run the function again with the new number).

---

## How the pieces fit together

```
Customer's browser
      |
      v
Vercel (Next.js website and server code)  <-->  Supabase (database + logins)
```

- Every person's access is controlled by **Row Level Security** rules inside Supabase (see `supabase/schema.sql`). Guests can only create pending bookings; customers can only see their own; only admins can see everything or change a status.
- `src/app/actions.ts` holds the server code for booking, logging in, cancelling and changing status.
- `src/app/api/slots/route.ts` tells the booking form which time slots are still free, without exposing anyone's details.
- `src/proxy.ts` sends logged-out visitors away from `/admin` and `/account`. The admin page also checks the admin role itself.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Page shows an error mentioning `NEXT_PUBLIC_SUPABASE_URL` | The env values are missing. Check `.env.local` (on your computer) or Environment Variables (on Vercel). After changing them on Vercel, click Redeploy. |
| "We could not load the times" | The database setup was not run, or the keys are wrong. Re-run `schema.sql` on a fresh project, and re-check the URL and key. |
| Admin page says "This page is for the Star Pets team" | Your account is not an admin yet. Run the `update public.profiles ... 'admin'` query, then log out and in. |
| Sign-up says "check your email" but nothing arrives | Confirm email is on and Supabase's built-in email is rate-limited. Turn Confirm email off for testing, or set up SMTP (Step 7). |
| Confirmation link goes to the wrong site | Fix Site URL and Redirect URLs in Supabase (Step 6). |
| `npm run dev` fails | Run `node -v`. It should be 20 or higher. Then delete the `node_modules` folder and run `npm install` again. |

---

## Not included yet (good next steps)

- Automatic email or WhatsApp confirmation and reminders to customers
- Blocking out holidays or a vet's leave days
- Different opening hours per weekday
- Downloading the appointments list as a spreadsheet
- Extra spam protection such as a CAPTCHA (a hidden honeypot field is already in the form)
