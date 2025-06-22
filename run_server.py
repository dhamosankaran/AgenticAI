import subprocess
import sys
import signal
import os

def run_servers():
    # Start the backend server
    backend = subprocess.Popen(
        ["python", "-m", "uvicorn", "src.api.main:app"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    
    # Start the frontend server
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    
    def signal_handler(sig, frame):
        print("\nShutting down servers...")
        backend.terminate()
        frontend.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Print output from both servers
        while True:
            backend_out = backend.stdout.readline()
            if backend_out:
                print("Backend:", backend_out.strip())
            
            frontend_out = frontend.stdout.readline()
            if frontend_out:
                print("Frontend:", frontend_out.strip())
            
            # Check if either process has terminated
            if backend.poll() is not None or frontend.poll() is not None:
                raise Exception("One of the servers terminated unexpectedly")
                
    except Exception as e:
        print(f"Error: {e}")
        backend.terminate()
        frontend.terminate()
        sys.exit(1)

if __name__ == "__main__":
    run_servers() 