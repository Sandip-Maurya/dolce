#!/usr/bin/env python3
"""
Database restore script for PostgreSQL.

Downloads a backup from S3 (or uses a local file) and restores to the database.
Run from repo root. Use the same COMPOSE_FILE as your running stack.

Environment variables (from .env):
  AWS_STORAGE_BUCKET_NAME  - Required. S3 bucket for backups
  AWS_ACCESS_KEY_ID        - Optional if using IAM role
  AWS_SECRET_ACCESS_KEY    - Optional if using IAM role
  AWS_S3_REGION_NAME       - Optional (default: ap-south-1)
  DB_NAME                  - Optional (default: dolce_db)
  DB_USER                  - Optional (default: dolce_user)
  COMPOSE_FILE             - Optional (default: docker-compose.dev.yml)

Usage:
  # Restore latest backup for the environment (from COMPOSE_FILE)
  COMPOSE_FILE=docker-compose.prod.yml python scripts/restore-db.py --latest

  # Restore specific S3 key
  COMPOSE_FILE=docker-compose.prod.yml python scripts/restore-db.py --s3-key backups/prod/backup_dolce_db_20250221_020000.sql.gz

  # Restore from local file
  python scripts/restore-db.py --file ./backups/backup_dolce_db_20250221_120000.sql.gz

  # Dry-run: show what would be restored
  python scripts/restore-db.py --latest --dry-run
"""

import argparse
import gzip
import os
import subprocess
import sys
import tempfile
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


def get_latest_s3_key(client, bucket: str, env_name: str) -> str | None:
    """Return the S3 key of the most recent backup for the environment."""
    prefix = f"backups/{env_name}/"
    paginator = client.get_paginator("list_objects_v2")
    objects = []
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            if obj["Key"].endswith(".sql.gz"):
                objects.append(obj)
    if not objects:
        return None
    objects.sort(key=lambda o: o["LastModified"], reverse=True)
    return objects[0]["Key"]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Restore PostgreSQL database from S3 or local backup"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--latest",
        action="store_true",
        help="Restore the most recent backup for the environment (from COMPOSE_FILE)",
    )
    group.add_argument(
        "--s3-key",
        metavar="KEY",
        help="S3 key of the backup (e.g. backups/prod/backup_dolce_db_20250221_020000.sql.gz)",
    )
    group.add_argument(
        "--file",
        metavar="PATH",
        help="Path to local backup file (.sql or .sql.gz)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be restored without actually restoring",
    )
    args = parser.parse_args()

    bucket = get_env("AWS_STORAGE_BUCKET_NAME", required=True)
    compose_file = get_env("COMPOSE_FILE", "docker-compose.dev.yml")
    db_name = get_env("DB_NAME", "dolce_db")
    db_user = get_env("DB_USER", "dolce_user")
    region = get_env("AWS_S3_REGION_NAME", "ap-south-1")

    compose_path = REPO_ROOT / compose_file
    if not compose_path.exists():
        print(f"❌ Error: Compose file not found: {compose_path}")
        sys.exit(1)

    env_name = detect_env(compose_file)
    restore_path: Path | None = None
    s3_key_used: str | None = None

    if args.file:
        restore_path = Path(args.file)
        if not restore_path.is_absolute():
            restore_path = REPO_ROOT / args.file
        if not restore_path.exists():
            print(f"❌ Error: Local file not found: {restore_path}")
            sys.exit(1)
        print(f"Using local file: {restore_path}")
    else:
        # Need S3
        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError:
            print("❌ Error: boto3 not installed. Run: pip install boto3")
            sys.exit(1)

        client = boto3.client("s3", region_name=region)
        if args.latest:
            s3_key_used = get_latest_s3_key(client, bucket, env_name)
            if not s3_key_used:
                print(f"❌ No backups found in s3://{bucket}/backups/{env_name}/")
                sys.exit(1)
            print(f"Latest backup for {env_name}: s3://{bucket}/{s3_key_used}")
        else:
            s3_key_used = args.s3_key

        if args.dry_run:
            print(f"Dry-run: would restore from s3://{bucket}/{s3_key_used}")
            return 0

        # Download to temp file
        backup_dir = REPO_ROOT / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            suffix=".sql.gz", delete=False, dir=backup_dir
        ) as tf:
            try:
                client.download_file(bucket, s3_key_used, tf.name)
            except ClientError as e:
                print(f"❌ S3 download failed: {e}")
                sys.exit(1)
            restore_path = Path(tf.name)

    if args.dry_run and restore_path:
        print(f"Dry-run: would restore from {restore_path}")
        return 0

    # Restore: gunzip if needed, pipe to psql
    print(f"⚠️  WARNING: This will REPLACE all data in database '{db_name}'.")
    print("   Press Ctrl+C within 5 seconds to abort...")
    try:
        import time

        time.sleep(5)
    except KeyboardInterrupt:
        print("\nAborted.")
        if restore_path and s3_key_used:  # temp file from S3 download
            restore_path.unlink(missing_ok=True)
        sys.exit(130)

    print(f"Restoring to {db_name}...")

    try:
        if restore_path.suffix == ".gz":
            with gzip.open(restore_path, "rb") as f_in:
                proc = subprocess.Popen(
                    [
                        "docker",
                        "compose",
                        "-f",
                        str(compose_path),
                        "exec",
                        "-T",
                        "db",
                        "psql",
                        "-U",
                        db_user,
                        db_name,
                    ],
                    stdin=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(REPO_ROOT),
                )
                _, stderr = proc.communicate(input=f_in.read())
        else:
            with open(restore_path, "rb") as f_in:
                proc = subprocess.Popen(
                    [
                        "docker",
                        "compose",
                        "-f",
                        str(compose_path),
                        "exec",
                        "-T",
                        "db",
                        "psql",
                        "-U",
                        db_user,
                        db_name,
                    ],
                    stdin=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(REPO_ROOT),
                )
                _, stderr = proc.communicate(input=f_in.read())

        if proc.returncode != 0:
            print(f"❌ Restore failed: {stderr.decode()}")
            sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: docker command not found. Ensure Docker is installed and in PATH.")
        sys.exit(1)
    finally:
        # Remove temp file if we downloaded from S3
        if restore_path and s3_key_used:
            restore_path.unlink(missing_ok=True)

    print("✅ Restore complete!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
