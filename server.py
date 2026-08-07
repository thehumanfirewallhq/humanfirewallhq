#!/usr/bin/env python3
"""@HUMANFIREWALLHQ // local static preview server.

The site is intentionally static: there are no accounts, passwords, cookies,
API routes, or server-side user records to maintain.
"""

import argparse
import http.server
import os
import posixpath
import socketserver
import urllib.parse
from http import HTTPStatus

PORT = 8080
WEB_ROOT = os.path.dirname(os.path.abspath(__file__))

# Keep the public surface explicit. This prevents accidental exposure of source,
# local databases, editor metadata, and the Freebuff workspace.
PUBLIC_FILES = {
    "": "index.html",
    "index.html": "index.html",
    "about.html": "about.html",
    "blog.html": "blog.html",
    "article.html": "article.html",
    "checklist.html": "checklist.html",
    "products.html": "products.html",
    "product-detail.html": "product-detail.html",
    "script.js": "script.js",
    "theme-bootstrap.js": "theme-bootstrap.js",
    "masterclass-commerce.css": "masterclass-commerce.css",
    "style.css": "style.css",
    "favicon.svg": "favicon.svg",
    "social-feed.json": "social-feed.json",
    "articles.json": "articles.json",
}
PUBLIC_DIRECTORIES = {"images"}
PUBLIC_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".svg", ".webp"}
PUBLIC_ARTICLE_IMAGES = {
    "01-phantom-squatting.jpg", "02-copilot-word-worm-timeline.png",
    "03-deepseek-telegram-cve-table.png", "04-teams-ransomware-killchain.png",
    "05-us-water-hack-timeline.png", "07-macsync-claude-guide-killchain.png",
    "08-keyv-npm-worm-timeline.png", "08-keyv-npm-worm-hero.png",
    "09-blackhat-ai-agent-collective-hero.png",
    "01-phantom-squatting-cover.jpg", "02-copilot-word-worm-cover.jpg",
    "03-deepseek-telegram-cover.jpg", "04-teams-ransomware-cover.jpg",
    "05-us-water-hack-cover.jpg", "07-macsync-cover.jpg",
}

CSP = (
    "default-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https://pbs.twimg.com; "
    "script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; "
    "form-action 'self' https://humanfirewallhq.substack.com https://ko-fi.com; "
    "frame-ancestors 'none'; frame-src 'none'; worker-src 'none'; "
    "upgrade-insecure-requests"
)


class StaticSiteHandler(http.server.SimpleHTTPRequestHandler):
    """Serve only the site's intentional public assets."""

    # Do not advertise the Python runtime in responses or error pages.
    server_version = "HumanFirewall"
    sys_version = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()")
        super().end_headers()

    def _request_path(self):
        return urllib.parse.urlparse(self.path).path

    def _relative_path(self):
        path = posixpath.normpath(urllib.parse.unquote(self._request_path())).lstrip("/")
        return "" if path == "." else path

    def _is_public(self, relative_path):
        if relative_path in PUBLIC_FILES:
            if not relative_path:
                return True
            expected = os.path.realpath(os.path.join(WEB_ROOT, PUBLIC_FILES[relative_path]))
            requested = os.path.realpath(os.path.join(WEB_ROOT, relative_path))
            return requested == expected and os.path.isfile(requested)

        parts = relative_path.split("/")
        if len(parts) < 2 or parts[0] not in PUBLIC_DIRECTORIES or not all(parts):
            return False

        # Resolve the asset before allowing it. This keeps a symlink inside the
        # public images directory from exposing an arbitrary local file.
        images_root = os.path.realpath(os.path.join(WEB_ROOT, parts[0]))
        requested = os.path.realpath(os.path.join(WEB_ROOT, *parts))
        try:
            inside_images = os.path.commonpath((images_root, requested)) == images_root
        except ValueError:
            inside_images = False
        if not inside_images or not os.path.isfile(requested):
            return False
        extension = os.path.splitext(requested)[1].lower()
        if extension not in PUBLIC_IMAGE_EXTENSIONS:
            return False
        # Only the known site artwork and generated article artwork are public;
        # do not turn future image-directory backups into downloadable assets.
        relative = os.path.relpath(requested, WEB_ROOT).replace(os.sep, "/")
        return (
            relative in {"images/articles/" + name for name in PUBLIC_ARTICLE_IMAGES}
            or relative in {
                "images/blog-macsync.jpg", "images/blog-teams.jpg", "images/blog-water.jpg",
                "images/product-ai-scam.jpg", "images/product-enterprise.jpg", "images/product-family.jpg",
                "images/product-freelancer.jpg", "images/product-lite.jpg",    "images/product-recap.jpg", "images/products/masterclass-layer-1.svg", "images/products/masterclass-layer-2.svg",
                "images/products/masterclass-layer-3.svg", "images/products/masterclass-bundle.svg",
                "images/products/digital-self-defense-layer-1.png", "images/products/digital-self-defense-layer-2.png",
                "images/articles/08-keyv-npm-worm-hero.png",
                "images/products/digital-self-defense-layer-3.png", "images/products/digital-self-defense-bundle.png",
                "images/products/ai-scam-defense.svg",
                "images/products/freelancer-privacy-vault.svg", "images/products/family-digital-armor.svg", "images/products/monthly-recap-intel.svg",
            }
        )

    def _serve_or_404(self):
        relative_path = self._relative_path()
        if not self._is_public(relative_path):
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return False
        return True

    def do_GET(self):
        if self._serve_or_404():
            super().do_GET()

    def do_HEAD(self):
        if self._serve_or_404():
            super().do_HEAD()

    def _method_not_allowed(self):
        self.send_response(HTTPStatus.METHOD_NOT_ALLOWED)
        self.send_header("Allow", "GET, HEAD")
        self.end_headers()

    def do_POST(self):
        self._method_not_allowed()

    def do_PUT(self):
        self._method_not_allowed()

    def do_DELETE(self):
        self._method_not_allowed()

    def do_OPTIONS(self):
        self._method_not_allowed()

    def do_TRACE(self):
        self._method_not_allowed()

    def list_directory(self, path):
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")
        return None


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the HumanFirewall static preview server")
    parser.add_argument("legacy_port", nargs="?", type=int, help=argparse.SUPPRESS)
    parser.add_argument("--port", dest="flag_port", type=int, default=None, help="Local port (default: 8080)")
    args = parser.parse_args()
    requested_port = args.flag_port if args.flag_port is not None else (args.legacy_port or PORT)
    if not 1024 <= requested_port <= 65535:
        parser.error("port must be between 1024 and 65535")
    with ReusableTCPServer(("127.0.0.1", requested_port), StaticSiteHandler) as httpd:
        print(f"[*] @HumanFirewallHQ static preview server listening on 127.0.0.1:{requested_port}")
        httpd.serve_forever()
