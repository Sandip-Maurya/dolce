#!/usr/bin/env python
"""Check if database is ready."""
import os
import sys
import time
import psycopg2
from psycopg2 import OperationalError

def check_db(max_retries=30, retry_delay=1):
    """Check if database connection is available."""
    db_name = os.getenv('DB_NAME', 'dolce_db')
    db_user = os.getenv('DB_USER', 'dolce_user')
    db_password = os.getenv('DB_PASSWORD', 'changeme')
    db_host = os.getenv('DB_HOST', 'db')
    db_port = os.getenv('DB_PORT', '5432')
    
    print(f'Checking database connection: host={db_host}, port={db_port}, dbname={db_name}, user={db_user}')
    
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                dbname=db_name,
                user=db_user,
                password=db_password,
                host=db_host,
                port=db_port,
                connect_timeout=2
            )
            conn.close()
            print('Database is ready!')
            return True
        except OperationalError as e:
            error_msg = str(e)
            if attempt < max_retries - 1:
                # Only show detailed error every 5 attempts to reduce log spam
                if attempt % 5 == 0 or attempt < 3:
                    print(f'Database is unavailable (attempt {attempt + 1}/{max_retries}): {error_msg[:100]}')
                else:
                    print(f'Database is unavailable (attempt {attempt + 1}/{max_retries}) - sleeping...')
                time.sleep(retry_delay)
            else:
                print(f'Database connection failed after {max_retries} attempts: {error_msg}')
                print(f'Connection details: host={db_host}, port={db_port}, dbname={db_name}, user={db_user}')
                return False
        except Exception as e:
            print(f'Unexpected error: {e}')
            return False
    
    return False

if __name__ == '__main__':
    success = check_db()
    sys.exit(0 if success else 1)

