# Games page Worker backend

A small Cloudflare Worker API for the attached games page. The page keeps its existing game cards, embedded game templates, styling, and local settings. The Worker only provides a health check and validates/builds search URLs for Google, Bing, or DuckDuckGo. It does not fetch arbitrary URLs or proxy third-party game traffic.

## Routes

- GET / or /api/health returns the service status and route list.
- GET /api/search-url?engine=google&q=term returns a JSON object containing a safe search URL. Supported engines are google, bing, and duckduckgo. Queries are limited to 500 characters.
- Other paths return 404. Non-GET methods return 405.

## Run and deploy

1. Install dependencies with npm install.
2. Run locally with npm run start.
3. Sign in with Wrangler using npx wrangler login.
4. Deploy with npm run deploy. The package script runs Wrangler deploy.
5. Copy the deployed Worker URL ending in workers.dev.

## Connect the Apps Script frontend

1. In Apps Script, create an HTML file named Index and paste your current HTML into it unchanged.
2. Copy google-apps-script/Code.gs into the Apps Script project.
3. Replace WORKER_BASE_URL in Code.gs with the deployed Worker URL.
4. Deploy the Apps Script project as a Web app. The existing google.script.run call will reach the Worker from Code.gs.

The Apps Script call is server-to-server, so this integration does not require browser CORS headers. No Worker secret or API key is required for these public, read-only endpoints.
