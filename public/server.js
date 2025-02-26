// Deno 2 server for serving the EntityDB demo application
import { serve } from "https://deno.land/std@0.220.1/http/server.ts";

// Mime types for different file extensions
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".wasm": "application/wasm",
};

// Function to determine the MIME type based on file extension
function getMimeType(path) {
  const extension = path.slice(path.lastIndexOf("."));
  return MIME_TYPES[extension] || "application/octet-stream";
}

// Handle requests
async function handler(req) {
  try {
    // Get the requested path
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Default to index.html if the path is just "/"
    if (path === "/" || path === "") {
      path = "/index.html";
    }
    
    // Determine the file path to serve
    let filePath;
    
    // For the root path or HTML/JS files in the root, serve from the current directory
    if (path === "/index.html" || path === "/script.js") {
      filePath = `.${path}`;
    } 
    // For any path starting with /entity-db/, serve from the entity-db directory
    else if (path.startsWith("/entity-db/")) {
      filePath = `.${path}`;
    } 
    // For other paths, respond with 404
    else {
      return new Response("Not Found", { status: 404 });
    }
    
    console.log(`Serving: ${filePath}`);
    
    // Try to read the file
    try {
      const file = await Deno.readFile(filePath);
      
      // Determine the MIME type
      const mimeType = getMimeType(filePath);
      
      // Return the file contents with appropriate headers
      return new Response(file, {
        headers: {
          "Content-Type": mimeType,
          // Add CORS headers for development
          "Access-Control-Allow-Origin": "*",
          // Cache control for static assets
          "Cache-Control": path.includes("dist") ? "max-age=31536000" : "no-cache",
        },
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Start the server
const port = 3000;
console.log(`EntityDB demo server running at http://localhost:${port}`);
serve(handler, { port });