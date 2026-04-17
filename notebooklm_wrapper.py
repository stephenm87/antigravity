#!/usr/bin/env python3
"""
Wrapper for notebooklm-mcp that filters out the fancy startup banner
from stdout so the MCP JSON-RPC protocol works cleanly.
"""
import subprocess
import sys
import threading
import json

def filter_stdout(proc_stdout):
    """Read from process stdout, filter non-JSON lines, write to our stdout."""
    in_banner = True
    buffer = b""
    
    while True:
        byte = proc_stdout.read(1)
        if not byte:
            break
        
        buffer += byte
        
        if byte == b'\n':
            line = buffer.decode('utf-8', errors='replace')
            buffer = b""
            
            # Skip banner lines (box drawing chars, empty lines at start)
            stripped = line.strip()
            if in_banner:
                if stripped.startswith('{'):
                    in_banner = False
                    sys.stdout.buffer.write(line.encode('utf-8'))
                    sys.stdout.buffer.flush()
                # Skip all non-JSON lines during banner
                continue
            else:
                sys.stdout.buffer.write(line.encode('utf-8'))
                sys.stdout.buffer.flush()

def forward_stdin(proc_stdin):
    """Forward our stdin to the process stdin."""
    try:
        while True:
            data = sys.stdin.buffer.read(1)
            if not data:
                break
            proc_stdin.write(data)
            proc_stdin.flush()
    except (BrokenPipeError, OSError):
        pass

proc = subprocess.Popen(
    [
        "/Users/stephenmartinez/.local/bin/uvx",
        "notebooklm-mcp",
        "-c",
        "/Users/stephenmartinez/.gemini/antigravity/notebooklm_config.json",
        "server",
        "--transport", "stdio"
    ],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=sys.stderr,
)

stdin_thread = threading.Thread(target=forward_stdin, args=(proc.stdin,), daemon=True)
stdin_thread.start()

filter_stdout(proc.stdout)
proc.wait()
sys.exit(proc.returncode)
