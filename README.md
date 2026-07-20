# PestoAi website

A responsive PestoAi landing site with:

- Three interactive browser demos
- Find-out-more and pricing dialog
- Public-page redesign generator that returns one downloadable `index.html`
- Website / repository review form
- Compact team and Pesto notes at the bottom

## Uploading the site

Upload the **entire contents** of this folder to PHP hosting. The interactive demos work on static hosting, but these two features require PHP:

- `send-review.php` — sends contact requests
- `generate-site.php` — reads a public webpage and calls the OpenAI Responses API

The PHP cURL extension must be enabled for the redesign generator.

## 1. Configure the OpenAI redesign generator

Open:

```text
private/config.php
```

The preferred setup is to define `OPENAI_API_KEY` as a server environment variable. On ordinary shared hosting, the key may instead be pasted into the `api_key` field:

```php
'openai' => [
    'api_key' => 'YOUR_OPENAI_API_KEY',
    'model' => 'gpt-5-mini',
    'max_output_tokens' => 6000,
],
```

Do **not** put the key in `script.js` or `index.html`. The browser sends only the website URL to `generate-site.php`; the PHP file calls OpenAI from the server.

The included limits are:

- 6,000 maximum output tokens per redesign
- Three generations per IP address per hour
- One public HTML page per generation
- Maximum page/source sizes and short network timeouts
- Private, localhost and reserved IP ranges blocked
- Three redirects maximum

Generated pages are previewed inside a sandboxed iframe. The visitor can then view or download the returned `index.html`.

### What the generator cannot read

It will not reliably work with:

- Private repositories or login-only pages
- Sites that block automated requests
- Pages whose useful content exists only after complex JavaScript execution
- Entire multi-page websites in one request

It is intentionally a simple one-page concept generator, not a production website migration system.

## 2. Configure reliable contact email

The contact form always provides a Gmail and copy-message fallback. For automatic delivery, configure SMTP in:

```text
private/config.php
```

Example for a Gmail account using a Google App Password:

```php
'smtp' => [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'encryption' => 'tls',
    'username' => 'youraddress@gmail.com',
    'password' => 'YOUR_16_CHARACTER_APP_PASSWORD',
    'from_email' => 'youraddress@gmail.com',
    'from_name' => 'PestoAi Website',
],
```

The form sends to:

```text
pestoai.net@gmail.com
```

Change `contact_email` in the same config file to use another inbox.

When SMTP is empty, `send-review.php` also attempts the hosting provider's standard PHP `mail()` function. If neither delivery method is available, the page clearly displays **Open in Gmail** and **Copy message details** rather than silently failing.

## Security notes

- Keep `private/config.php` out of source-control repositories after adding secrets.
- The included `private/.htaccess` blocks direct access on Apache hosting.
- On Nginx, separately deny web access to the `/private/` directory.
- Use an OpenAI project key with an appropriate project budget and usage limit.
- Do not remove the URL validation and private-network protections from `generate-site.php`.

## Main files

```text
index.html             Page structure
styles.css             Site styling
script.js              Demos, generator UI and contact fallbacks
generate-site.php      Safe URL fetch + OpenAI Responses API call
send-review.php        SMTP / PHP mail contact handler
private/config.php     Server credentials and limits
assets/pestoai-mark.svg
```
