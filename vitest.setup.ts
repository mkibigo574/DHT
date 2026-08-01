// Route modules read these at import time, so they must be set before any
// test file imports a route. Dummy values only — the Stripe SDK and fetch are
// mocked in the tests, so nothing here ever reaches a real API.
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_dummy'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.test'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon_dummy'
