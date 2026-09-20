import json
import requests
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        uid = params.get('uid', [None])[0]
        region = params.get('region', ['ind'])[0]

        # Agar UID missing ho
        if not uid:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": False,
                "message": "UID parameter missing hai. Example: ?region=ind&uid=11111111"
            }).encode('utf-8'))
            return

        # Upstream Free Fire Info API URL
        source_url = f"https://crystal-ffinfo.vercel.app/player-info?region={region}&uid={uid}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }

        try:
            req = requests.get(source_url, headers=headers, timeout=10)
            res_data = req.json()
            code = req.status_code
        except Exception as e:
            res_data = {"status": False, "message": f"Server Error: {str(e)}"}
            code = 500

        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(res_data).encode('utf-8'))
        return
      
