#!/bin/bash

# Log file path
LOG_FILE="/home/ubuntu/Ticas/app.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Start application with logging
cd /home/ubuntu/Ticas
NODE_ENV=production node --trace-warnings dist/app.js > "$LOG_FILE" 2>&1 &

# Tail the log file
tail -f "$LOG_FILE"
