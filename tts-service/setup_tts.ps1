# setup_tts.ps1
# This script sets up the Python environment for Chatterbox TTS

Write-Host "Setting up Chatterbox TTS Environment..." -ForegroundColor Cyan

# 1. Create virtual environment
if (-Not (Test-Path "venv")) {
    Write-Host "[*] Creating virtual environment..."
    py -m venv venv
}

# 2. Install dependencies
Write-Host "[*] Installing baseline packages (setuptools, wheel)..."
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install setuptools wheel

Write-Host "[*] Installing requirements (this may take a few minutes)..."
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# 3. Reminder for voices
Write-Host "`n[!] SETUP COMPLETE" -ForegroundColor Green
Write-Host "Please place your 5-10 second reference audio files in the 'voices/' directory:"
Write-Host "  - narrator.wav"
Write-Host "  - scientist.wav"
Write-Host "  - engineer.wav"
Write-Host "  - historian.wav"
Write-Host "`nTo start the service, run:"
Write-Host "  .\venv\Scripts\python.exe tts_bridge.py" -ForegroundColor Yellow
