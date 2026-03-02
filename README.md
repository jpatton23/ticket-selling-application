# Sheffield University Ticket Marketplace

A peer-to-peer ticket marketplace for Sheffield University and Sheffield Hallam University students. Buy and sell tickets for club nights, sports events, horse racing, and more through a real-time chat-based system.

## Features

- 🎓 **University-only access** — restricted to @sheffield.ac.uk and @shu.ac.uk emails
- 🎫 **Event marketplace** — browse upcoming events and find sellers
- 💬 **Real-time chat** — negotiate with sellers via Supabase Realtime
- 💳 **Stripe payments** — secure checkout integrated into chat
- 🔄 **Weekly auto-reset** — recurring events refresh every week automatically
- ⭐ **User ratings** — rate buyers and sellers after transactions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Payments | Stripe Checkout |
| Hosting | Vercel (free tier) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)
- A [Stripe](https://stripe.com) account (free tier)

### 1. Clone & Install

```bash
git clone <repo-url>
cd ticket-selling-application
npm install
```

### 2. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to **Settings → API** and copy your Project URL and anon key
3. Go to **SQL Editor** and run the migration file:
   - Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it
4. (Optional) Seed sample events:
   - Copy the contents of `supabase/seed.sql` and run it in the SQL Editor

### 3. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your **test** API keys from the Stripe dashboard
3. For webhooks (local development), install the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret it outputs.

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=any_random_secret_string
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

The database consists of these tables:

- **profiles** — User profiles (extends Supabase auth.users)
- **events** — Admin-curated events (weekly recurring & one-off)
- **event_occurrences** — Individual instances of events
- **ticket_listings** — Tickets for sale
- **conversations** — Chat threads between buyer & seller
- **messages** — Individual chat messages
- **transactions** — Payment records
- **ratings** — Post-transaction ratings

See `supabase/migrations/001_initial_schema.sql` for the full schema.

## Sample Events

The seed file (`supabase/seed.sql`) includes:

| Event | Type | Venue |
|-------|------|-------|
| Code Fridays @ Foundry | Weekly (Friday) | The Foundry |
| Pop Tarts @ Leadmill | Weekly (Saturday) | The Leadmill |
| Tuesday Club @ Corp | Weekly (Tuesday) | Corporation |
| Sheffield United vs Leeds United | One-off | Bramall Lane |
| Doncaster Races | One-off | Doncaster Racecourse |
| Engineering Society Ball | One-off | Cutlers' Hall |

## Weekly Auto-Reset

Recurring events automatically reset each week:

1. A cron job calls `POST /api/cron/reset-events` daily at 6 AM
2. Any occurrence whose date has passed is marked as "ended"
3. Available listings for that occurrence are marked as "expired"
4. A new occurrence is created for next week

**Vercel Cron** (configured in `vercel.json`) runs this automatically on Vercel.

For external cron services (e.g., [cron-job.org](https://cron-job.org)):
- URL: `https://your-app.vercel.app/api/cron/reset-events`
- Method: `POST`
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

## Deployment to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy!

The Vercel Cron job is pre-configured in `vercel.json` to run daily.

For Stripe webhooks in production:
1. Go to **Stripe Dashboard → Webhooks → Add endpoint**
2. URL: `https://your-app.vercel.app/api/stripe/webhook`
3. Events to listen for: `checkout.session.completed`
4. Copy the signing secret to your `STRIPE_WEBHOOK_SECRET` env var

## Project Structure

```
app/
├── layout.tsx                    # Root layout with navigation
├── page.tsx                      # Landing page
├── auth/
│   ├── login/page.tsx            # Login form
│   ├── signup/page.tsx           # Signup with university email validation
│   └── callback/route.ts        # Supabase auth callback
├── events/
│   ├── page.tsx                  # Events feed with filters
│   └── [occurrenceId]/
│       ├── page.tsx              # Marketplace (sellers list)
│       └── sell/page.tsx         # Create/edit listing
├── messages/
│   ├── page.tsx                  # Conversations list
│   └── [conversationId]/
│       └── page.tsx              # Real-time chat
├── profile/
│   └── page.tsx                  # User profile & history
└── api/
    ├── stripe/
    │   ├── create-checkout/route.ts
    │   └── webhook/route.ts
    └── cron/
        └── reset-events/route.ts
```

## License

MIT
