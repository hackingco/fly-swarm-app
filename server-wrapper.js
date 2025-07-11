// This wrapper ensures that Fly.io secrets are properly loaded
// before starting the Next.js server

console.log('Starting server wrapper...');
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- LANGFUSE_PUBLIC_KEY:', process.env.LANGFUSE_PUBLIC_KEY ? 'Set' : 'Not set');
console.log('- LANGFUSE_SECRET_KEY:', process.env.LANGFUSE_SECRET_KEY ? 'Set' : 'Not set');
console.log('- LANGFUSE_HOST:', process.env.LANGFUSE_HOST || 'Not set');
console.log('- FLY_REGION:', process.env.FLY_REGION || 'Not set');
console.log('- FLY_ALLOC_ID:', process.env.FLY_ALLOC_ID || 'Not set');

// Start the Next.js server
require('./server.js');