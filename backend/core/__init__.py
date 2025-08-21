"""Core facade package

This package exposes a consolidated set of view classes that the frontend
depends on. It re-exports implementations from the existing `accounts` and
`donors` apps. The intention is to centralize import targets so we can move
the original app folders to `legacy_*` safely.
"""
