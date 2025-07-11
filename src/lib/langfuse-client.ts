// Client-safe Langfuse configuration getter
export function getLangfuseConfig() {
  // In production on Fly.io, these should come from secrets
  const config = {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
  }

  // Log configuration status (without exposing secrets)
  if (typeof window === 'undefined') {
    console.log('[Langfuse Config]', {
      hasPublicKey: !!config.publicKey,
      hasSecretKey: !!config.secretKey,
      baseUrl: config.baseUrl,
      nodeEnv: process.env.NODE_ENV,
      flyRegion: process.env.FLY_REGION,
    })
  }

  return config
}