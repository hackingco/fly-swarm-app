# Setting up Langfuse for the Swarm App

The Langfuse integration is configured but needs real API keys to work.

## Step 1: Get your Langfuse API Keys

1. Go to https://cloud.langfuse.com (or your self-hosted instance)
2. Sign up or log in to your account
3. Create a new project or select an existing one
4. Go to Settings → API Keys
5. Create a new API key pair or use existing ones

## Step 2: Set the keys in Fly.io

Replace the placeholder values with your actual keys:

```bash
flyctl secrets set \
  LANGFUSE_PUBLIC_KEY="pk-lf-YOUR-ACTUAL-PUBLIC-KEY" \
  LANGFUSE_SECRET_KEY="sk-lf-YOUR-ACTUAL-SECRET-KEY"
```

## Step 3: (Optional) Use a different Langfuse host

If you're using a self-hosted Langfuse instance:

```bash
flyctl secrets set LANGFUSE_HOST="https://your-langfuse-instance.com"
```

## Step 4: Deploy the application

The application will automatically redeploy when secrets are updated. You can also manually deploy:

```bash
flyctl deploy
```

## Step 5: Verify the configuration

After deployment, check that Langfuse is working:

1. Visit https://fly-swarm-app.fly.dev/api/debug to see if keys are detected
2. Visit https://fly-swarm-app.fly.dev/dashboard and click "Activate Swarm"
3. Check your Langfuse dashboard for incoming traces

## Troubleshooting

If traces aren't appearing:

1. Check the debug endpoint: https://fly-swarm-app.fly.dev/api/debug
2. Look at the application logs: `flyctl logs`
3. Ensure your Langfuse project is active and the keys are valid
4. Verify the LANGFUSE_HOST matches your Langfuse instance

## Current Status

The application currently has placeholder keys set:
- LANGFUSE_PUBLIC_KEY: pk-lf-1234567890 (placeholder)
- LANGFUSE_SECRET_KEY: sk-lf-1234567890 (placeholder)

These need to be replaced with your actual Langfuse API keys for tracing to work.