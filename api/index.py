import json
import requests
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query params
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        
        uid = params.get('uid', [''])[0].strip()
        region = params.get('region', ['ind'])[0].strip().lower()

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if not uid:
            self.wfile.write(json.dumps({"success": False, "error": "UID is required"}).encode())
            return

        # Upstream multi-proxy fetch
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }

        try:
            target_url = f"https://api.allorigins.win/raw?url=https://ff-api-gamma.vercel.app/api?uid={uid}&region={region}"
            res = requests.get(target_url, headers=headers, timeout=8)
            data = res.json()
            
            acc = data.get("AccountInfo") or data.get("basicInfo") or data
            nickname = acc.get("AccountNickname") or acc.get("nickname")

            if nickname:
                out = {
                    "success": True,
                    "AccountInfo": {
                        "AccountNickname": nickname,
                        "AccountLevel": acc.get("AccountLevel") or acc.get("level", "1"),
                        "AccountLikes": acc.get("AccountLikes") or acc.get("likes", "0"),
                        "AccountAvatarId": acc.get("AccountAvatarId") or acc.get("headPic", "101001")
                    }
                }
            else:
                out = {"success": False, "error": "UID not found"}
        except Exception:
            out = {"success": False, "error": "Upstream server timeout"}

        self.wfile.write(json.dumps(out).encode())
        
