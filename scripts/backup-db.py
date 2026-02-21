#!/usr/bin/env python3
"""
Database backup script for PostgreSQL.

Creates a timestamped backup locally and uploads to S3.
Run from repo root. Use the same COMPOSE_FILE as your running stack.

Environment variables (from .env):
  AWS_STORAGE_BUCKET_NAME  - Required. S3 bucket for backups (e.g. dolce-prod-assets)
  AWS_ACCESS_KEY_ID        - Optional if using IAM role
  AWS_SECRET_ACCESS_KEY    - Optional if using IAM role
  AWS_S3_REGION_NAME       - Optional (default: ap-south-1)
  DB_NAME                  - Optional (default: dolce_db)
  DB_USER                  - Optional (default: dolce_user)
  COMPOSE_FILE             - Optional (default: docker-compose.dev.yml)

Usage:
  COMPOSE_FILE=docker-compose.prod.yml python scripts/backup-db.py
  COMPOSE_FILE=docker-compose.stg.yml python scripts/backup-db.py
"""

import os
import re
import sys
import gzip
import shutil
import subprocess
from pathlib import Path

# Add repo root for dotenv
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

# Load .env from repo root
if load_dotenv:
    load_dotenv(REPO_ROOT / ".env")
else:
    # Fallback: read .env manually
    env_file = REPO_ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def get_env(key: str, default: str | None = None, required: bool = False) -> str:
    val = os.environ.get(key, default or "")
    val = val.strip()
    if required and not val:
        print(f"❌ Error: {key} is required. Set it in .env")
        sys.exit(1)
    return val


def detect_env(compose_file: str) -> str:
    """Infer environment from COMPOSE_FILE name."""
    name = Path(compose_file).stem.lower()
    if "prod" in name:
        return "prod"
    if "stg" in name or "staging" in name:
        return "stg"
    return "dev"


def main() -> int:
    compose_file = get_env("COMPOSE_FILE", "docker-compose.dev.yml")
    bucket = get_env("AWS_STORAGE_BUCKET_NAME", required=True)
    db_name = get_env("DB_NAME", "dolce_db")
    db_user = get_env("DB_USER", "dolce_user")
    region = get_env("AWS_S3_REGION_NAME", "ap-south-1")
    backup_dir = Path(get_env("BACKUP_DIR", "./backups"))

    env_name = detect_env(compose_file)
    timestamp = __import__("datetime").datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backup_{db_name}_{timestamp}.sql.gz"
    backup_path = backup_dir / backup_filename
    backup_dir.mkdir(parents=True, exist_ok=True)

    compose_path = REPO_ROOT / compose_file
    if not compose_path.exists():
        print(f"❌ Error: Compose file not found: {compose_path}")
        sys.exit(1)

    print(f"Creating database backup: {backup_path} (env: {env_name}, compose: {compose_file})")

    # Run pg_dump via docker compose exec
    cmd = [
        "docker",
        "compose",
        "-f",
        str(compose_path),
        "exec",
        "-T",
        "db",
        "pg_dump",
        "-U",
        db_user,
        db_name,
    ]
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(REPO_ROOT),
        )
        with gzip.open(backup_path, "wb") as f:
            shutil.copyfileobj(proc.stdout, f)
        _, stderr = proc.communicate()
        if proc.returncode != 0:
            print(f"❌ pg_dump failed: {stderr.decode()}")
            backup_path.unlink(missing_ok=True)
            sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: docker command not found. Ensure Docker is installed and in PATH.")
        sys.exit(1)

    print(f"✅ Backup created: {backup_path}")

    # Upload to S3
    s3_prefix = f"backups/{env_name}"
    s3_key = f"{s3_prefix}/{backup_filename}"
    try:
        import boto3
        from botocore.exceptions import ClientError

        client = boto3.client("s3", region_name=region)
        client.upload_file(str(backup_path), bucket, s3_key)
        print(f"✅ Uploaded to s3://{bucket}/{s3_key}")
    except ImportError:
        print("❌ Error: boto3 not installed. Run: pip install boto3")
        sys.exit(1)
    except ClientError as e:
        print(f"❌ S3 upload failed: {e}")
        sys.exit(1)

    # Local retention: keep last 7 days
    cutoff = __import__("datetime").datetime.now().timestamp() - (7 * 24 * 3600)
    pattern = re.compile(rf"backup_{re.escape(db_name)}_\d{{8}}_\d{{6}}\.sql\.gz")
    removed = 0
    for f in backup_dir.glob("*.sql.gz"):
        if pattern.match(f.name) and f.stat().st_mtime < cutoff:
            f.unlink()
            removed += 1
    if removed:
        print(f"🧹 Cleaned up {removed} old local backup(s) (kept last 7 days)")

    # S3 retention: keep last 14 backups per env
    try:
        paginator = client.get_paginator("list_objects_v2")
        objects = []
        for page in paginator.paginate(Bucket=bucket, Prefix=s3_prefix):
            for obj in page.get("Contents", []):
                objects.append(obj)
        objects.sort(key=lambda o: o["LastModified"], reverse=True)
        pruned = 0
        for obj in objects[14:]:
            client.delete_object(Bucket=bucket, Key=obj["Key"])
            pruned += 1
        if pruned:
            print(f"🧹 Pruned {pruned} old S3 backup(s) (kept last 14 per env)")
    except Exception:
        pass  # Non-fatal

    print("✅ Backup complete!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
