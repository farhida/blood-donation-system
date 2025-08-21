"""API routing facade

This package provides a single place to declare the API surface that the
frontend depends on. It imports views from the existing `accounts` and
`donors` apps but keeps routing centralized so we can later safely remove
unused endpoints.
"""
