const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PROJECT_DIR = path.join(__dirname, 'sbah-app-v2');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  
  // Extract the path from the URL, removing any query parameters
  let pathname = parsedUrl.pathname;
  
  // Normalize path to prevent directory traversal
  let filePath;
  
  // Special handling for root path
  if (pathname === '/' || pathname === '') {
    filePath = path.join(PROJECT_DIR, 'index.html');
  } else {
    // Remove leading slash and join with project directory
    // This helps normalize the path and prevent directory traversal
    filePath = path.join(PROJECT_DIR, pathname);
  }
  
  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Set content type based on file extension
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Check if the file exists and serve it
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Log the error and file path
        console.error(`File not found: ${filePath}`);
        
        // If index.html is not found, this is a critical error
        if (filePath.endsWith('index.html')) {
          console.error('Critical error: index.html not found in:', PROJECT_DIR);
          
          // List directory contents to help debug
          try {
            const dirContents = fs.readdirSync(PROJECT_DIR);
            console.log('Directory contents:', dirContents);
          } catch (e) {
            console.error('Error reading directory:', e);
          }
        }
        
        // Return 404
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 Not Found</h1><p>The file ${pathname} could not be found.</p>`);
      } else {
        // Server error
        console.error(`Server error:`, err);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>500 Server Error</h1><p>${err.code}</p>`);
      }
    } else {
      // Success - file was found
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${PROJECT_DIR}`);
  console.log('Press Ctrl+C to stop the server');
});
