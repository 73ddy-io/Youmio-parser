# Youmio Characters Scraper

Scrapes character data from https://app.youmio.ai/ using Puppeteer. Collects character names, popularity scores, and direct profile links.

## Features

- Infinite scroll automation
- Extracts only valid characters (`?back-url=home` links)
- Deduplicates by URL
- Saves clean JSON output

## Requirements

```bash
Node.js 18+
npm
```

## Dependencies

```
puppeteer@^24.34.0
fs/promises (Node.js built-in)
```


## Installation

```bash
npm install
```

## Usage

```bash
# Default: 40 characters
npm start

# Custom count
node index.js 100
node index.js 250
```

## Example Output

```
Starting scraper: target 40 characters
Loading page...
Beginning collection...
Valid characters collected: 12/40 | Scrolls: 1
Valid characters collected: 28/40 | Scrolls: 2
Valid characters collected: 41/40 | Scrolls: 3
✅ Target reached!
FINAL RESULT: 40 characters
💾 Saved to result.json
```

## Result Format (`result.json`)

```json
[
  {
    "name": "Limbo",
    "popularity": "3.8K",
    "url": "https://app.youmio.ai/discovery/5W9SWxMqYEOFr2by5xDZfg?back-url=home"
  },
  {
    "name": "Crypto Queen", 
    "popularity": "1.1K",
    "url": "https://app.youmio.ai/discovery/gDO4jpxJI0GNT4s91C9Pw?back-url=home"
  }
]
```

## Browser Behavior

- Opens visible Chrome window (headless: `false`)
- Automatically scrolls to load more characters
- Closes browser when complete

## Troubleshooting

- **No characters found**: Check internet connection and site availability
- **Scroll limit reached**: Increase `maxScrolls` in code (line ~70)
- **Puppeteer errors**: Run `npm install puppeteer@latest`
