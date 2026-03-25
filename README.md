# AMC / AIME Practice App

## Setup (one time, ~45 min total)

### Step 1 — Run the scraper

You need Python 3 installed.

```bash
cd scraper
pip install -r requirements.txt
python scrape.py
```

This writes `../data.js` with all problems embedded. Takes ~20-30 min (being polite to AoPS).

### Step 2 — Push to GitHub Pages

1. Create a new GitHub repo (e.g. `amc-practice`)
2. Push the contents of the `amc-app/` folder (not the folder itself) to the repo root
3. Go to repo Settings → Pages → Source: `main` branch, `/ (root)`
4. Your app is live at `https://YOUR_USERNAME.github.io/amc-practice/`

### Step 3 — iPhone

Open the URL in Safari → tap Share → "Add to Home Screen"
Done. It works offline after first load (all data is embedded in data.js).
