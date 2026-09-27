# INE Product Price Tracker

## Project Links
- **Live Dashboard (Vercel):** https://ine-tracker-frontend.vercel.app/
- **Backend API (Render):** https://ine-scraper-api.onrender.com/
- **Video Demonstration:** https://drive.google.com/file/d/1MSJU-5F_NLv4fsK9RKyL08g4VmdAp7QH/view?usp=sharing

## Setup Instructions & Environment Variables
To run this project, the following environment variables must be added in the backend Render dashboard and local `.env` file:
- `SUPABASE_URL`: https://edsijxyvapkxshyytssn.supabase.co
- `SUPABASE_KEY`: The anon public key for database access.

## Automated Scraping Schedule
As required, the scraper is fully automated to run completely unattended. I have configured an external cron service (cron-job.org) to hit the `/api/run-scraper` endpoint exactly every 2 hours. This successfully bypasses the Render free-tier sleep state and keeps the historical data populated.

## Design Note & AI Usage
**1. Scraping Reliability Strategy (The Core Challenge):** 
The target mock store is intentionally difficult—it employs dynamic delays, async modal popups, and blocks synthetic React click events. To achieve 100% unattended reliability, I bypassed standard DOM evaluation. Instead, I implemented an active "Radar Loop" to constantly scan for late-loading popups without failing. I also engineered a "Visual Mouse" (using Playwright's native `.mouse.move()` and hardware-level `.click()`) to physically glide over and interact with the hover-locked price buttons, completely mimicking real human behavior.

**2. Trade-offs:** 
I chose a Headless Browser (Playwright) over lightweight HTTP fetching. While heavier on server resources, the target page relies heavily on client-side JavaScript rendering and physical mouse hover events to reveal the real price. Playwright ensures accurate data extraction without false negatives or empty data storage.

**3. AI Tools Usage & Corrections:** 
Per the assignment guidelines, I utilized AI for initial brainstorming and debugging. On the first attempt, the AI confidently suggested using standard `page.evaluate()` and synthetic DOM clicks. I quickly realized this approach was fundamentally flawed because the mock store's React framework actively ignores fake synthetic events. Instead of relying on the AI's standard solution, I engineered a custom approach: I forced the use of native hardware-level clicks and injected a visual red-dot cursor to manually map the exact X/Y coordinates. I then directed the AI to help me refine this specific hardware-level logic, which successfully bypassed the hover-lock security.