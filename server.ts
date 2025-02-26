// Deno 2 server for serving the EntityDB demo applications
import { serve } from "https://deno.land/std@0.220.1/http/server.ts";

// Define the server root directory for static assets
const SERVER_ROOT = "./public";

// Mime types for different file extensions
const MIME_TYPES: Record<string, string> = {
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
function getMimeType(path: string): string {
  const extension = path.slice(path.lastIndexOf("."));
  return MIME_TYPES[extension] || "application/octet-stream";
}

// Handle requests
async function handler(req: Request): Promise<Response> {
  try {
    // Get the requested path
    const url = new URL(req.url);
    let path = url.pathname;

    // If the path is root, default to index.html
    if (path === "/" || path === "") {
      path = "/index.html";
    }
    
    // Construct the file path based on the server root directory
    const filePath = `${SERVER_ROOT}${path}`;
    
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
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": filePath.includes("dist") ? "max-age=31536000" : "no-cache",
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
console.log(`EntityDB demos server running at http://localhost:${port}`);
console.log(`- Vector Search Demo: http://localhost:${port}/index.html`);
console.log(`- AI Chat with Memory: http://localhost:${port}/chat.html`);
await serve(handler, { port });