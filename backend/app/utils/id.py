import hashlib
import time
from urllib.parse import urlparse


def make_repo_id(repo_url: str) -> str:
    stamp = str(int(time.time() * 1000))
    digest = hashlib.sha1(f"{repo_url}:{stamp}".encode("utf-8")).hexdigest()[:12]
    parsed = urlparse(repo_url)
    name = parsed.path.strip("/").replace("/", "-")
    return f"{name}-{digest}"[:64]
