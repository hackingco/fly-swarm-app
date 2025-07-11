// Runtime configuration helper for server-side environment variables
export function getRuntimeConfig() {
  // This function runs on the server and has access to process.env
  return {
    langfuse: {
      publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
      secretKey: process.env.LANGFUSE_SECRET_KEY || '',
      host: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
    },
    fly: {
      region: process.env.FLY_REGION || 'unknown',
      instance: process.env.FLY_ALLOC_ID || 'local',
    }
  }
}