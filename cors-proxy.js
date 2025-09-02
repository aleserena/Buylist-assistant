const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Parse the target URL from the request
    const targetUrl = req.url.substring(1); // Remove leading slash
    
    if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No target URL provided' }));
        return;
    }
    
    // Parse the URL
    const parsedUrl = url.parse(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    // Create request options
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.path,
        method: req.method,
        headers: {
            ...req.headers,
            host: parsedUrl.hostname
        }
    };
    
    // Make the request to the target server
    const proxyReq = client.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
    });
    
    // Pipe the request body
    req.pipe(proxyReq);
});

server.listen(PORT, () => {
    // CORS Proxy server running on http://localhost:${PORT}
    // Usage: http://localhost:${PORT}/https://api2.moxfield.com/v2/decks/all/your-deck-id
});

process.on('SIGINT', () => {
    server.close(() => {
        process.exit(0);
    });
}); 