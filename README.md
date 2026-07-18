# PestoAi website

A responsive, static-first PestoAi landing site with:

- Three working interactive demos
- Find out more and pricing dialog
- Team section with replaceable profile photos
- “Things we like” image cards
- Website / repository review form
- Join-us call to action

## Uploading the site

Upload the entire contents of this folder into the website directory on your hosting account. Keep the folder structure intact.

The contact form uses `send-review.php`, so it works on ordinary PHP hosting such as cPanel. It sends review requests to:

`blaisenewman@gmail.com`

To change the recipient, edit this line near the top of `send-review.php`:

```php
const REVIEW_EMAIL = 'blaisenewman@gmail.com';
```

When the site is hosted somewhere without PHP, such as GitHub Pages, the form automatically opens the visitor’s email application with the details pre-filled instead.

## Adding team photographs

Place the two photos here using these exact filenames:

- `assets/team/blaise.jpg`
- `assets/team/luke.jpg`

Recommended format:

- Portrait orientation
- At least 1200 × 1500 pixels
- JPG format
- Faces centred with a little space around the head

Until those files are added, the site automatically displays the supplied BN and LN placeholders.

## Pricing

Pricing is currently set to:

- First Fix — €950 one-off
- Build & Improve — from €2,500
- Ongoing Partner — from €650/month

Edit the pricing cards near the bottom of `index.html` if these figures change.

## Testing the contact form locally

The page itself can be opened directly. PHP sending needs a PHP server and mail configuration. On local files, the email fallback is used automatically.
