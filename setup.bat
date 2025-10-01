@echo off
echo 🐅 Setting up Tiger Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo 📝 Creating environment file...
    copy .env.local.example .env.local
    echo ✅ Environment file created. Please edit .env.local with your configuration.
) else (
    echo ✅ Environment file already exists
)

REM Run type checking
echo 🔍 Running type checking...
npm run type-check

if %errorlevel% neq 0 (
    echo ⚠️  Type checking found some issues. Please review and fix them.
) else (
    echo ✅ Type checking passed
)

REM Run linting
echo 🔍 Running linting...
npm run lint

if %errorlevel% neq 0 (
    echo ⚠️  Linting found some issues. You can run 'npm run lint:fix' to fix them automatically.
) else (
    echo ✅ Linting passed
)

REM Run tests
echo 🧪 Running tests...
npm run test

if %errorlevel% neq 0 (
    echo ⚠️  Some tests failed. Please review and fix them.
) else (
    echo ✅ All tests passed
)

REM Build the project
echo 🏗️  Building the project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

echo ✅ Build successful

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env.local with your configuration
echo 2. Start the development server: npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo Available commands:
echo   npm run dev          - Start development server
echo   npm run build        - Build for production
echo   npm run start        - Start production server
echo   npm run test         - Run tests
echo   npm run lint         - Run linting
echo   npm run type-check   - Run type checking
echo.
echo Happy coding! 🚀
pause

