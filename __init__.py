"""ChatGPT usage plugin.

The dashboard API module is intentionally the only active surface.  Its route
uses Hermes's existing OpenAI Codex account-usage resolver, so OAuth tokens stay
inside the gateway process and never reach the desktop renderer.
"""


def register(_ctx) -> None:
    """No agent hooks or tools are needed for this read-only desktop feature."""
