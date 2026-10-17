#!/bin/bash
# ==============================================================================
# GreenGridAI — IBM LinuxONE (s390x Ubuntu 24.04) Automated Setup & Deployment
# ==============================================================================
set -e

echo "=== [1/5] Updating system packages on LinuxONE (s390x) ==="
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv git curl ufw

echo "=== [2/5] Setting up GreenGrid repository ==="
APP_DIR="/opt/greengrid"
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    git clone https://github.com/Sudharshan-stack124/GreenGridAI.git "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin
git checkout feature/kruthin_data
git pull origin feature/kruthin_data

echo "=== [3/5] Setting up Data Service virtualenv ==="
cd "$APP_DIR/services/data-service"
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

echo "=== [4/5] Running verification tests on s390x ==="
./venv/bin/pytest tests/ -v

echo "=== [5/5] Configuring systemd service ==="
sudo bash -c "cat << 'SERVICE_EOF' > /etc/systemd/system/greengrid-data.service
[Unit]
Description=GreenGrid Data Service Microservice (s390x)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/services/data-service
ExecStart=$APP_DIR/services/data-service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=5
Environment=PORT=8001
Environment=GREENGRID_DATA_DIR=$APP_DIR/services/data-service/data

[Install]
WantedBy=multi-user.target
SERVICE_EOF"

sudo systemctl daemon-reload
sudo systemctl enable greengrid-data.service
sudo systemctl restart greengrid-data.service

echo "=== Deployment Complete! Testing local health endpoint ==="
sleep 2
curl -s http://127.0.0.1:8001/health | grep '"status":"ok"' && echo -e "\n\n>>> SUCCESS: GreenGrid Data Service is running on LinuxONE port 8001! <<<"
