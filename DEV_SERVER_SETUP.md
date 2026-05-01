# Development Server Setup Guide

## Memory Issue Solution

The project has grown and requires more memory to run the development server. Here are the solutions:

## ✅ Option 1: Use npm run dev (Recommended)
The `npm run dev` command has been updated to automatically allocate 4GB of memory:

```bash
npm run dev
```

This will start the Vite dev server with increased heap memory.

## ✅ Option 2: Use the Batch File (Windows)
A batch file has been created for easy access:

```bash
dev.bat
```

Simply double-click `dev.bat` to start the dev server with proper memory allocation.

## ✅ Option 3: Manual Command
If you need to run it manually:

```bash
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js
```

## ✅ Option 4: Alternative Memory Sizes
If you have limited memory, try smaller allocations:

```bash
# 2GB memory
node --max-old-space-size=2048 ./node_modules/vite/bin/vite.js

# 3GB memory
node --max-old-space-size=3072 ./node_modules/vite/bin/vite.js

# 8GB memory (if you have plenty)
node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js
```

## 🔧 What Changed

### package.json
Updated the `dev` script to include memory allocation:
```json
"dev": "node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js"
```

### dev.bat (Windows)
Created a batch file for easy execution on Windows systems.

## 📊 Memory Allocation Guide

| Allocation | Use Case |
|-----------|----------|
| 2GB | Minimal, for older machines |
| 3GB | Standard, for most systems |
| 4GB | Recommended, for this project |
| 8GB | High-end, for large projects |

## 🚀 Starting the Dev Server

### Method 1: npm (Easiest)
```bash
npm run dev
```

### Method 2: Batch File (Windows)
```bash
dev.bat
```

### Method 3: PowerShell
```powershell
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js
```

## ✅ Expected Output

When the server starts successfully, you should see:

```
VITE v7.3.2  ready in XXXX ms

➜  Local:   http://localhost:8080/
➜  Network: http://192.168.1.XXX:8080/
➜  press h + enter to show help
```

## ⚠️ Troubleshooting

### Still Getting Memory Error?
1. Increase the memory allocation further (try 6144 or 8192)
2. Close other applications to free up RAM
3. Restart your computer
4. Check available disk space

### Port Already in Use?
If port 8080 is already in use:
```bash
# Kill the process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Dependencies Missing?
If you see "Failed to run dependency scan":
```bash
npm install
npm run dev
```

## 📝 Notes

- The dev server now requires 4GB of RAM minimum
- This is due to the large number of components and features added
- The memory allocation is only for development; production builds are optimized
- You can adjust the memory size based on your system capabilities

## 🎯 Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start dev server with proper memory allocation
npm run dev

# Open browser to http://localhost:8080/
```

The development server should now run without memory issues! 🎉