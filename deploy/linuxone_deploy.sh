#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy/linuxone_deploy.sh
# GreenGrid Data Service — LinuxONE (s390x) Deployment Script
#
# Usage (run ON the LinuxONE VM):
#   chmod +x linuxone_deploy.sh
#   ./linuxone_deploy.sh
#
# Prerequisites on the remote VM:
#   - Python 3.9+ or Docker installed
#   - Git installed
#   - Port 8001 open in firewall / security group
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="https://github.com/Sudharshan-stack124/GreenGridAI.git"
BRANCH="feature/kruthin_data"
APP_DIR="$HOME/GreenGridAI"
SERVICE_DIR="$APP_DIR/services/data-service"
VENV_DIR="$SERVICE_DIR/venv"
LOG_FILE="$HOME/greengrid-data-service.log"
PID_FILE="$HOME/greengrid-data-service.pid"
PORT=8001

echo "========================================"
echo " GreenGrid Data Service — LinuxONE Deploy"
echo " Branch : $BRANCH"
echo " Port   : $PORT"
echo "========================================"

# ── 1. Clone or update repo ───────────────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
    echo "[1/6] Updating existing repository..."
    cd "$APP_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    echo "[1/6] Cloning repository..."
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ── 2. Python virtual environment ─────────────────────────────────────────
echo "[2/6] Setting up Python virtual environment..."
cd "$SERVICE_DIR"
python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/pip" install --upgrade pip --quiet
"$VENV_DIR/bin/pip" install -r requirements.txt --quiet

# ── 3. Verify dataset integrity before starting ───────────────────────────
echo "[3/6] Verifying dataset integrity..."
"$VENV_DIR/bin/python" - <<'PYEOF'
import sys, os
sys.path.insert(0, os.getcwd())
from loader import DataLoader
dl = DataLoader()
dl.load_all()
ok = dl.verify_integrity()
counts = dl.get_record_counts()
print(f"  Integrity check: {'PASS' if ok else 'FAIL'}")
print(f"  Record counts  : {counts}")
if not ok:
    print("ERROR: Dataset integrity check failed. Aborting deployment.")
    sys.exit(1)
PYEOF

# ── 4. Run tests ──────────────────────────────────────────────────────────
echo "[4/6] Running test suite..."
"$VENV_DIR/bin/pytest" tests/ -q --tb=short
echo "  All tests passed."

# ── 5. Stop existing process if running ───────────────────────────────────
echo "[5/6] Stopping any existing Data Service process..."
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "  Stopping PID $OLD_PID..."
        kill "$OLD_PID"
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

# Also kill any leftover uvicorn on this port
pkill -f "uvicorn main:app" 2>/dev/null || true

# ── 6. Start the service ──────────────────────────────────────────────────
echo "[6/6] Starting GreenGrid Data Service on port $PORT..."
nohup "$VENV_DIR/bin/uvicorn" main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --workers 2 \
    --log-level info \
    > "$LOG_FILE" 2>&1 &

echo $! > "$PID_FILE"
sleep 3

# ── Health check ──────────────────────────────────────────────────────────
echo ""
echo "Performing health check..."
if curl -sf "http://localhost:$PORT/health" > /dev/null; then
    echo "✅ GreenGrid Data Service is RUNNING on http://$(hostname -I | awk '{print $1}'):$PORT"
    echo "   Swagger UI  : http://$(hostname -I | awk '{print $1}'):$PORT/docs"
    echo "   ReDoc       : http://$(hostname -I | awk '{print $1}'):$PORT/redoc"
    echo "   PID         : $(cat $PID_FILE)"
    echo "   Logs        : $LOG_FILE"
else
    echo "❌ Health check FAILED. Check $LOG_FILE for errors."
    tail -20 "$LOG_FILE"
    exit 1
fi
