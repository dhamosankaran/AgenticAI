import json
from typing import Dict, Optional
from datetime import datetime, timedelta
from .exceptions import CacheError

class Cache:
    """Simple in-memory cache with TTL support."""
    
    def __init__(self, ttl_hours: int = 24):
        self._cache: Dict[str, Dict] = {}
        self._ttl = timedelta(hours=ttl_hours)

    def get(self, key: str) -> Optional[Dict]:
        """Get value from cache if not expired."""
        try:
            if key not in self._cache:
                return None
                
            entry = self._cache[key]
            if datetime.now() - entry['timestamp'] > self._ttl:
                del self._cache[key]
                return None
                
            return entry['data']
        except Exception as e:
            raise CacheError(f"Error retrieving from cache: {str(e)}")

    def set(self, key: str, value: Dict) -> None:
        """Set value in cache with current timestamp."""
        try:
            self._cache[key] = {
                'data': value,
                'timestamp': datetime.now()
            }
        except Exception as e:
            raise CacheError(f"Error setting cache: {str(e)}")

    def clear(self) -> None:
        """Clear all cached entries."""
        self._cache.clear()

    def remove(self, key: str) -> None:
        """Remove specific key from cache."""
        try:
            if key in self._cache:
                del self._cache[key]
        except Exception as e:
            raise CacheError(f"Error removing from cache: {str(e)}")

    def cleanup_expired(self) -> None:
        """Remove all expired entries."""
        try:
            now = datetime.now()
            expired_keys = [
                key for key, entry in self._cache.items()
                if now - entry['timestamp'] > self._ttl
            ]
            for key in expired_keys:
                del self._cache[key]
        except Exception as e:
            raise CacheError(f"Error cleaning up cache: {str(e)}")

    def get_stats(self) -> Dict:
        """Get cache statistics."""
        try:
            return {
                'total_entries': len(self._cache),
                'expired_entries': len([
                    1 for entry in self._cache.values()
                    if datetime.now() - entry['timestamp'] > self._ttl
                ]),
                'ttl_hours': self._ttl.total_seconds() / 3600
            }
        except Exception as e:
            raise CacheError(f"Error getting cache stats: {str(e)}") 