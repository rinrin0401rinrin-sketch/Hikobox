#!/bin/zsh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST="127.0.0.1"
PORT="${HIKOBOX_PORT:-8000}"
RUNTIME_DIR="$HOME/Library/Application Support/Hikobox"
LOG_DIR="$HOME/Library/Logs/Hikobox"
PID_FILE="$RUNTIME_DIR/http-server-${PORT}.pid"
LOG_FILE="$LOG_DIR/http-server-${PORT}.log"

mkdir -p "$RUNTIME_DIR" "$LOG_DIR"
cd "$PROJECT_DIR"

is_running_pid() {
  local pid="${1:-}"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

known_pid=""
if [[ -f "$PID_FILE" ]]; then
  known_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
fi

if is_running_pid "$known_pid"; then
  echo "Hikobox server is already running (pid: $known_pid)."
  echo "Open: http://${HOST}:${PORT}/"
  exit 0
fi

if lsof -iTCP:"${PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use."
  echo "Open: http://${HOST}:${PORT}/"
  exit 0
fi

nohup python3 -m http.server "${PORT}" --bind "${HOST}" >>"${LOG_FILE}" 2>&1 &
server_pid=$!
echo "${server_pid}" > "${PID_FILE}"
sleep 1

if is_running_pid "${server_pid}"; then
  echo "Hikobox server started."
  echo "PID: ${server_pid}"
  echo "Log: ${LOG_FILE}"
  echo "Open: http://${HOST}:${PORT}/"
  exit 0
fi

echo "Failed to start Hikobox server. Check: ${LOG_FILE}" >&2
exit 1
