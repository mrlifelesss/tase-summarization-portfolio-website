# TASE Summaries Portfolio Website

Static React + TypeScript site for browsing exported deterministic TASE summaries.

The app reads from `public/data/`, which should be synced from:

`formulaic_examples/outputs/site_export/`

## Scripts

- `npm run sync-data` copies the latest export into `public/data`
- `npm run dev` starts the local Vite dev server
- `npm run build` builds the static site
- `npm run preview` previews the production build
- `npm run check` runs TypeScript type checking

## Local Workflow

1. Refresh the export dataset from the Python pipeline:

   ```bash
   python3 formulaic_examples/automation/export_site_data.py
   ```

2. Sync the export into the website:

   ```bash
   npm run sync-data
   ```

3. Install dependencies and run the site:

   ```bash
   npm install
   npm run dev
   ```

## Deployment

The app is static-hosting friendly and suitable for AWS Amplify.

Build command:

```bash
npm install
npm run sync-data
npm run build
```

Publish directory:

```bash
dist
```
