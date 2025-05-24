#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    if port_in_use "$1"; then
        echo -e "${BLUE}Killing process on port $1...${NC}"
        lsof -ti ":$1" | xargs kill -9
    fi
}

# Function to rotate logs
rotate_logs() {
    local log_file=$1
    local max_size=$((10 * 1024 * 1024))  # 10MB
    
    if [ -f "$log_file" ]; then
        local size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file")
        if [ "$size" -gt "$max_size" ]; then
            mv "$log_file" "${log_file}.$(date +%Y%m%d_%H%M%S)"
            touch "$log_file"
        fi
    fi
}

# Check if Python is installed
if ! command_exists python3; then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Kill any existing processes on ports 8000 and 5173
kill_port 8000
kill_port 5173

# Activate virtual environment if it exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
pip install -r requirements.txt

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Create log files
BACKEND_LOG="logs/backend_$(date +%Y%m%d_%H%M%S).log"
FRONTEND_LOG="logs/frontend_$(date +%Y%m%d_%H%M%S).log"

# Start backend server in the background with logging
echo -e "${GREEN}Starting backend server...${NC}"
echo "=== Backend Server Started at $(date) ===" > "$BACKEND_LOG"
PYTHONPATH=$PYTHONPATH:$(pwd) uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000 >> "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Start frontend server in the background with logging
echo -e "${GREEN}Starting frontend server...${NC}"
echo "=== Frontend Server Started at $(date) ===" > "$FRONTEND_LOG"
cd frontend
npm run dev >> "../$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd ..

# Function to handle script termination
cleanup() {
    echo -e "\n${BLUE}Shutting down servers...${NC}"
    echo "=== Backend Server Stopped at $(date) ===" >> "$BACKEND_LOG"
    echo "=== Frontend Server Stopped at $(date) ===" >> "$FRONTEND_LOG"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    
    # Rotate logs before exiting
    rotate_logs "$BACKEND_LOG"
    rotate_logs "$FRONTEND_LOG"
    
    exit 0
}

# Set up trap for cleanup on script termination
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}Servers are running!${NC}"
echo -e "${GREEN}Backend: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the servers${NC}"
echo -e "${BLUE}Logs are being written to:${NC}"
echo -e "${BLUE}Backend: $BACKEND_LOG${NC}"
echo -e "${BLUE}Frontend: $FRONTEND_LOG${NC}"

# Function to monitor and rotate logs periodically
monitor_logs() {
    while true; do
        rotate_logs "$BACKEND_LOG"
        rotate_logs "$FRONTEND_LOG"
        sleep 300  # Check every 5 minutes
    done
}

# Start log monitoring in the background
monitor_logs &
MONITOR_PID=$!

# Wait for both processes
wait

# Clean up monitor process if script exits
kill $MONITOR_PID 2>/dev/null 