<?php
/**
 * PestoAi server configuration.
 *
 * The site works without secrets, but automatic email delivery and the AI
 * redesign generator require the credentials below. Keep this file private.
 */
return [
    'contact_email' => 'blaisenewman@gmail.com',

    // Recommended for reliable contact-form delivery. For Gmail, create an
    // App Password and use smtp.gmail.com, port 587, encryption tls.
    'smtp' => [
        'host' => '',
        'port' => 587,
        'encryption' => 'tls', // tls, ssl or none
        'username' => '',
        'password' => '',
        'from_email' => '',
        'from_name' => 'PestoAi Website',
    ],

    // Prefer the OPENAI_API_KEY environment variable in production. Pasting a
    // key here also works on ordinary PHP hosting. Never put it in script.js.
    'openai' => [
        'api_key' => getenv('OPENAI_API_KEY') ?: '',
        'model' => getenv('OPENAI_MODEL') ?: 'gpt-5-mini',
        'max_output_tokens' => 6000,
    ],
];
