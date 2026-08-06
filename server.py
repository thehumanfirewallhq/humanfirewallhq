#!/usr/bin/env python3
"""
@HUMANFIREWALLHQ // OPERATOR PLATFORM BACKEND SERVER (PYTHON 3 HTTP + SQLITE)
SECURITY ARCHITECTURE: PBKDF2-HMAC-SHA256 PASSWORD HASHING | ZERO SQL INJECTION | STRICT HEADERS
"""

import http.server
import socketserver
import json
import sqlite3
import hashlib
import os
import secrets
import urllib.parse
from http import HTTPStatus

PORT = 8080
DB_FILE = "users.db"
WEB_ROOT = os.path.dirname(os.path.abspath(__file__))

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            user_type TEXT DEFAULT 'HUMAN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def hash_password(password: str, salt_hex: str = None):
    if salt_hex is None:
        salt = secrets.token_bytes(16)
        salt_hex = salt.hex()
    else:
        salt = bytes.fromhex(salt_hex)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt_hex, key.hex()

def verify_password(password: str, salt_hex: str, stored_hash: str):
    _, computed_hash = hash_password(password, salt_hex)
    return secrets.compare_digest(computed_hash, stored_hash)

class OperatorHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_ROOT, **kwargs)

    def send_security_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_security_headers()
        self.end_headers()

    def send_json_response(self, status_code, data):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_security_headers()
        self.end_headers()
        self.wfile.write(payload)

    def parse_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(raw_body)
        except Exception:
            return {}

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path).path

        if parsed_path == "/api/register":
            body = self.parse_json_body()
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            user_type = body.get("user_type", "HUMAN").upper()

            if not email or "@" not in email or "." not in email:
                return self.send_json_response(400, {"success": False, "error": "Invalid email address format."})
            if len(password) < 8:
                return self.send_json_response(400, {"success": False, "error": "Password must be at least 8 characters long."})

            try:
                salt_hex, pw_hash = hash_password(password)
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (email, salt, password_hash, user_type) VALUES (?, ?, ?, ?)",
                    (email, salt_hex, pw_hash, user_type)
                )
                conn.commit()
                user_id = cursor.lastrowid
                conn.close()

                token = secrets.token_hex(24)
                return self.send_json_response(201, {
                    "success": True,
                    "message": "Operator registration completed securely.",
                    "user": {
                        "id": user_id,
                        "email": email,
                        "user_type": user_type,
                        "token": token
                    }
                })
            except sqlite3.IntegrityError:
                return self.send_json_response(409, {"success": False, "error": "Operator email is already registered."})
            except Exception as e:
                return self.send_json_response(500, {"success": False, "error": "Internal database error."})

        elif parsed_path == "/api/login":
            body = self.parse_json_body()
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")

            if not email or not password:
                return self.send_json_response(400, {"success": False, "error": "Email and password are required."})

            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT id, email, salt, password_hash, user_type FROM users WHERE email = ?", (email,))
                row = cursor.fetchone()
                conn.close()

                if not row or not verify_password(password, row["salt"], row["password_hash"]):
                    return self.send_json_response(401, {"success": False, "error": "Invalid email or password credentials."})

                token = secrets.token_hex(24)
                return self.send_json_response(200, {
                    "success": True,
                    "message": "Operator authentication successful.",
                    "user": {
                        "id": row["id"],
                        "email": row["email"],
                        "user_type": row["user_type"],
                        "token": token
                    }
                })
            except Exception as e:
                return self.send_json_response(500, {"success": False, "error": "Internal authentication error."})

        else:
            return self.send_json_response(404, {"success": False, "error": "API endpoint not found."})

    def end_headers(self):
        self.send_security_headers()
        super().end_headers()

if __name__ == "__main__":
    init_db()
    with socketserver.TCPServer(("0.0.0.0", PORT), OperatorHTTPRequestHandler) as httpd:
        print(f"[*] @HumanFirewallHQ Secure Operator Server listening on 0.0.0.0:{PORT}")
        httpd.serve_forever()
