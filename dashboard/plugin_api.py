"""Read-only OpenAI Codex allowance route for the ChatGPT Usage plugin."""
from __future__ import annotations

from datetime import datetime
import threading
import time
from typing import Any

from fastapi import APIRouter

from agent.account_usage import fetch_account_usage

router = APIRouter()

_CACHE_TTL_SECONDS = 45
_cache_lock = threading.Lock()
_cache_value: dict[str, Any] | None = None
_cache_at = 0.0


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _snapshot_payload() -> dict[str, Any]:
    snapshot = fetch_account_usage("openai-codex")
    if snapshot is None or not snapshot.available:
        return {
            "available": False,
            "provider": "openai-codex",
            "reason": "No se pudo consultar el uso de Codex. Comprueba que Hermes esté conectado con OpenAI Codex.",
            "windows": [],
            "details": [],
            "fetched_at": datetime.now().astimezone().isoformat(),
        }

    windows = []
    for window in snapshot.windows:
        used = window.used_percent
        windows.append(
            {
                "label": window.label,
                "used_percent": used,
                "remaining_percent": max(0, min(100, round(100 - float(used)))) if used is not None else None,
                "reset_at": _iso(window.reset_at),
                "detail": window.detail,
            }
        )
    return {
        "available": True,
        "provider": snapshot.provider,
        "source": snapshot.source,
        "plan": snapshot.plan,
        "windows": windows,
        "details": list(snapshot.details),
        "fetched_at": _iso(snapshot.fetched_at),
    }


@router.get("/usage")
async def usage(refresh: bool = False) -> dict[str, Any]:
    """Return the current Codex allowance without ever returning OAuth data."""
    global _cache_at, _cache_value
    now = time.monotonic()
    with _cache_lock:
        if not refresh and _cache_value is not None and now - _cache_at < _CACHE_TTL_SECONDS:
            return _cache_value

    payload = _snapshot_payload()
    with _cache_lock:
        _cache_value = payload
        _cache_at = now
    return payload
