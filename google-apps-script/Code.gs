const WORKER_BASE_URL = 'https://games-page-api.YOUR-SUBDOMAIN.workers.dev';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Games portal');
}

// The existing HTML calls this with google.script.run.
// Apps Script calls the Worker server-to-server, so browser CORS is not needed.
function getSearchRedirectUrl(query, engine) {
  const q = String(query || '').trim();
  const selectedEngine = String(engine || '').trim().toLowerCase();

  if (!q || q.length > 500) {
    throw new Error('Search query must be between 1 and 500 characters.');
  }

  if (WORKER_BASE_URL.indexOf('YOUR-SUBDOMAIN') !== -1) {
    throw new Error('Replace WORKER_BASE_URL with your deployed Cloudflare Worker URL.');
  }

  const endpoint = WORKER_BASE_URL.replace(/\/+$/, '') +
    '/api/search-url?engine=' + encodeURIComponent(selectedEngine) +
    '&q=' + encodeURIComponent(q);

  const response = UrlFetchApp.fetch(endpoint, {
    method: 'get',
    muteHttpExceptions: true,
    followRedirects: false
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Search service returned HTTP ' + response.getResponseCode() + '.');
  }

  let payload;
  try {
    payload = JSON.parse(response.getContentText());
  } catch (error) {
    throw new Error('Search service returned an invalid response.');
  }

  const destination = String(payload.url || '');
  const match = /^https://([^/?#]+)(?:[/?#]|$)/i.exec(destination);
  const allowedHosts = [
    'google.com', 'www.google.com',
    'bing.com', 'www.bing.com',
    'duckduckgo.com', 'www.duckduckgo.com'
  ];

  if (!match || allowedHosts.indexOf(match[1].toLowerCase()) === -1) {
    throw new Error('Search service returned an unsupported destination.');
  }

  return destination;
}
