// Custom server to ensure environment variables are available
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Ensure environment variables are available
process.env.LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY || ''
process.env.LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY || ''
process.env.LANGFUSE_HOST = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = process.env.PORT || 3000

console.log('Starting server with environment:')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- LANGFUSE_HOST:', process.env.LANGFUSE_HOST)
console.log('- LANGFUSE_PUBLIC_KEY:', process.env.LANGFUSE_PUBLIC_KEY ? 'Set' : 'Not set')
console.log('- LANGFUSE_SECRET_KEY:', process.env.LANGFUSE_SECRET_KEY ? 'Set' : 'Not set')

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})