# Lil Chud

An AI chatbot that's always rude and always wrong. It's a parody, and every answer is intentionally incorrect.

- **Website:** plain HTML/CSS/JS in `docs/`, hosted free on GitHub Pages
- **AI:** a free Cloudflare Worker in `worker/` that calls Google Gemini's free tier, so your API key never reaches the browser

Until the worker is hooked up, the site runs in **demo mode** with canned replies.

## Setup (one time, all free)

### 1. Get a Gemini API key
Go to https://aistudio.google.com/apikey, sign in with Google, and click **Create API key**. No credit card is needed.

### 2. Deploy the worker
You need [Node.js](https://nodejs.org) installed.

```bash
cd worker
npm install
npx wrangler login              # opens a browser; makes a free Cloudflare account
npx wrangler secret put GEMINI_API_KEY   # paste your key when asked
npx wrangler deploy
```

The deploy prints a URL like `https://lil-chud.yourname.workers.dev`. Paste it into `docs/config.js`:

```js
const WORKER_URL = "https://lil-chud.yourname.workers.dev";
```

### 3. Put the site on GitHub Pages
1. Commit and push to GitHub.
2. On GitHub, open the repo's **Settings → Pages**. Set **Source** to *Deploy from a branch*, **Branch** to `main`, and the folder to `/docs`, then save.
3. After a minute the site is live at `https://<your-github-username>.github.io/Chud-AI/`. Share that link.

### 4. Lock the worker to your site (recommended)
In `worker/wrangler.toml`, set `ALLOWED_ORIGIN = "https://<your-github-username>.github.io"`, then run `npx wrangler deploy` again. This stops other websites from using your free quota.

## Testing locally
1. Create `worker/.dev.vars` containing `GEMINI_API_KEY=your-key`. This file is gitignored.
2. Run `cd worker && npx wrangler dev`. The worker runs at `http://localhost:8787`.
3. Temporarily set `WORKER_URL = "http://localhost:8787"` in `docs/config.js`, then open `docs/index.html` in a browser.

## Tweaking Lil Chud
- His personality is the `SYSTEM_PROMPT` in `worker/src/index.js`. Redeploy after editing.
- To change the model, edit `GEMINI_MODEL` in `worker/wrangler.toml`.
- To change the rate limit (default 15 messages per minute per person), edit `RATE_LIMIT` in `worker/src/index.js`.
