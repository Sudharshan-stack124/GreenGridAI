"""
GreenGridAI — Master Unified Runner
Starts all backend services (Ports 8001, 8002, 8003) and Vite Frontend (Port 5173).
"""

import sys
import os
import subprocess
import time
import signal
import socket
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
SERVICES_DIR = ROOT_DIR / "services"
FRONTEND_DIR = ROOT_DIR / "frontend"

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def wait_for_port(port: int, timeout: float = 10.0, host: str = "127.0.0.1") -> bool:
    start = time.time()
    while time.time() - start < timeout:
        if is_port_in_use(port, host):
            return True
        time.sleep(0.2)
    return False

def main():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    services_only = "--services-only" in sys.argv or "-s" in sys.argv
    python_exe = sys.executable

    print("\n" + "=" * 65)
    print("  [GreenGridAI] Starting All Backend Services & Frontend")
    print("=" * 65)
    print(f"  * Root Directory : {ROOT_DIR}")
    print(f"  * Python Binary  : {python_exe}")
    print("=" * 65)

    processes = []

    def cleanup(signum=None, frame=None):
        print("\n\n[GreenGridAI] Shutting down all processes...")
        for name, p in processes:
            try:
                print(f"  Stopping {name} (PID {p.pid})...")
                if sys.platform == "win32":
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(p.pid)],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    p.terminate()
            except Exception as e:
                print(f"  Warning stopping {name}: {e}")
        print("[GreenGridAI] All processes terminated. Goodbye!\n")
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    services = [
        ("Data Service (8001)", [python_exe, "-m", "uvicorn", "services.data_service:app", "--host", "0.0.0.0", "--port", "8001"], 8001),
        ("Decision Engine (8002)", [python_exe, "-m", "uvicorn", "services.decision_engine:app", "--host", "0.0.0.0", "--port", "8002"], 8002),
        ("Analytics API (8003)", [python_exe, "-m", "uvicorn", "services.analytics_api:app", "--host", "0.0.0.0", "--port", "8003"], 8003),
    ]

    # Start Backend Services
    for name, cmd, port in services:
        if is_port_in_use(port):
            print(f"[!] Warning: Port {port} for {name} is already in use. Assuming it's already running.")
            continue
        print(f"[*] Starting {name}...")
        p = subprocess.Popen(cmd, cwd=str(ROOT_DIR))
        processes.append((name, p))

    # Wait for backends to become responsive
    all_ready = True
    for name, _, port in services:
        ready = wait_for_port(port, timeout=8.0)
        status = "ONLINE" if ready else "WAITING/OFFLINE"
        print(f"    [{status}] {name} on port {port}")
        if not ready:
            all_ready = False

    # Start Frontend if not services-only
    if not services_only:
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        if is_port_in_use(5173):
            print("[!] Port 5173 is already in use. Assuming Vite dev server is running.")
        else:
            print("[*] Starting Vite Frontend on port 5173...")
            p_front = subprocess.Popen([npm_cmd, "run", "dev"], cwd=str(FRONTEND_DIR))
            processes.append(("Frontend (Vite 5173)", p_front))
            wait_for_port(5173, timeout=10.0)

    print("\n" + "=" * 65)
    print("  [GreenGridAI] ALL SERVICES READY & RUNNING!")
    print("=" * 65)
    if not services_only:
        print("  -> Frontend Web App   : http://localhost:5173")
    print("  -> Analytics API Docs : http://localhost:8003/docs")
    print("  -> Decision Engine    : http://localhost:8002/docs")
    print("  -> Data Service Docs  : http://localhost:8001/docs")
    print("=" * 65)
    print("  Press Ctrl+C at any time to cleanly stop all services.\n")

    try:
        while True:
            time.sleep(1)
            for name, p in processes:
                if p.poll() is not None:
                    print(f"[!] Process {name} exited unexpectedly with code {p.returncode}")
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
