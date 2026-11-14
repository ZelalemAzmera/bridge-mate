import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN || BOT_TOKEN.includes('sandbox')) {
  console.error('[Telegram Polling] No valid TELEGRAM_BOT_TOKEN found in .env.local');
  process.exit(1);
}

console.log('[Telegram Polling] Starting polling daemon for bot token:', BOT_TOKEN.slice(0, 10) + '...');

let offset = 0;

function fetchUpdates() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const json = JSON.parse(data);
        if (json.ok && Array.isArray(json.result)) {
          for (const update of json.result) {
            offset = update.update_id + 1;
            console.log(`[Telegram Polling] Received update ${update.update_id} from ${update.message?.from?.first_name || 'user'}: "${update.message?.text || ''}"`);
            
            // Forward to local Next.js Webhook
            await forwardToLocalWebhook(update);
          }
        }
      } catch (err) {
        console.error('[Telegram Polling] Parse error:', err.message);
      }
      setTimeout(fetchUpdates, 500);
    });
  }).on('error', (err) => {
    console.error('[Telegram Polling] Network error:', err.message);
    setTimeout(fetchUpdates, 3000);
  });
}

function forwardToLocalWebhook(update) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(update);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/telegram/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[Telegram Polling] Handled by /api/telegram/webhook (Status ${res.statusCode})`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('[Telegram Polling] Failed to forward to local webhook:', err.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

// Start polling
fetchUpdates();
