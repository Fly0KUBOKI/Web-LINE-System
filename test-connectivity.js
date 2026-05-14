const http = require('http')

const testUrl = process.env.WEBHOOK_URL || 'http://line-webhook-server:3000/webhook'
console.log('Testing connectivity to:', testUrl)

// Extract host and path from URL
const url = new URL(testUrl)
const options = {
  hostname: url.hostname,
  port: url.port || 80,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Line-Signature': 'test',
  },
}

console.log('Options:', options)

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  res.on('data', (d) => {
    process.stdout.write(d)
  })
  res.on('end', () => {
    console.log('\nConnectivity test completed')
    process.exit(res.statusCode === 401 ? 0 : 1)
  })
})

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`)
  process.exit(1)
})

req.write(JSON.stringify({ events: [] }))
req.end()
