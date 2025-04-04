import http.server
import socketserver
import json
import os
import urllib.request
from urllib.parse import urlparse, parse_qs

# This is a minimal server script to handle logo API calls and file operations
# that can't be done directly from the browser due to security restrictions

PORT = 8000
PUBLIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests for API endpoints"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        if self.path == '/api/create-folders':
            # Handle folder creation request
            try:
                data = json.loads(post_data)
                folder_path = data.get('path', '')
                
                # Make sure the path is within our public folder
                if not folder_path.startswith('public/'):
                    raise ValueError("Path must be within the public folder")
                
                # Create full path
                full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), folder_path)
                
                # Create folder recursively
                os.makedirs(full_path, exist_ok=True)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        elif self.path == '/api/save-file':
            # Handle file upload/save request
            try:
                # Process multipart form data
                import cgi
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST'}
                )
                
                file_item = form['file']
                file_path = form.getvalue('path')
                
                # Make sure the path is within our public folder
                if not file_path.startswith('public/'):
                    raise ValueError("Path must be within the public folder")
                
                # Create full path
                full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), file_path)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                
                # Save file
                with open(full_path, 'wb') as f:
                    f.write(file_item.file.read())
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode())

    def do_GET(self):
        """Handle GET requests"""
        # Serve files from the public directory
        if self.path.startswith('/public/'):
            file_path = self.path[1:]  # Remove leading slash
            full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), file_path)
            
            # Check if file exists
            if os.path.isfile(full_path):
                self.send_response(200)
                
                # Set content type based on file extension
                if full_path.endswith('.png'):
                    self.send_header('Content-type', 'image/png')
                elif full_path.endswith('.jpg') or full_path.endswith('.jpeg'):
                    self.send_header('Content-type', 'image/jpeg')
                elif full_path.endswith('.svg'):
                    self.send_header('Content-type', 'image/svg+xml')
                else:
                    self.send_header('Content-type', 'application/octet-stream')
                
                self.end_headers()
                
                # Send file content
                with open(full_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
        
        # If not a special path, use default handler
        super().do_GET()

def run_server():
    """Start the HTTP server"""
    # Create public folder if it doesn't exist
    os.makedirs(PUBLIC_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_FOLDER, 'images', 'logos'), exist_ok=True)
    
    # Change to the directory containing the website
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    handler = RequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
