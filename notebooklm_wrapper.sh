#!/bin/bash
# Wrapper script that suppresses non-JSON stdout from notebooklm-mcp
# The server prints a fancy startup banner to stdout which breaks MCP protocol
exec /Users/stephenmartinez/.local/bin/uvx notebooklm-mcp \
  -c /Users/stephenmartinez/.gemini/antigravity/notebooklm_config.json \
  server 2>&1 | grep -v '^\(╭\|│\|╰\|─\|🚀\)' | grep -v '^$'
