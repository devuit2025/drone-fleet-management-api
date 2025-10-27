#!/bin/bash

# Drone Fleet Management API - Setup Script
# This script automates the setup of the entire development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_section() {
    echo -e "\n${BLUE}====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}====================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    print_section "🚀 Drone Fleet Management API - Setup"
    
    # Step 1: Check prerequisites
    print_section "Step 1: Checking Prerequisites"
    
    check_node() {
        if command_exists node; then
            NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
            if [ "$NODE_VERSION" -ge 18 ]; then
                print_success "Node.js v$(node --version) is installed"
            else
                print_error "Node.js 18+ is required. Current: $(node --version)"
                exit 1
            fi
        else
            print_error "Node.js is not installed. Please install Node.js 18+ first."
            exit 1
        fi
    }
    
    check_postgres() {
        if command_exists psql; then
            print_success "PostgreSQL is installed: $(psql --version)"
        else
            print_error "PostgreSQL is not installed. Please install PostgreSQL 12+ first."
            exit 1
        fi
    }
    
    check_postgis() {
        if psql -U "$DB_USERNAME" -d postgres -c "SELECT PostGIS_version();" >/dev/null 2>&1; then
            print_success "PostGIS is installed"
        else
            print_warning "PostGIS extension not found. Installing..."
            psql -U "$DB_USERNAME" -d postgres -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null || true
        fi
    }
    
    check_node
    check_postgres
    
    # Step 2: Load environment variables
    print_section "Step 2: Loading Environment Variables"
    
    if [ -f ".env" ]; then
        print_success "Found .env file"
        source .env
    elif [ -f "env.example" ]; then
        print_warning ".env file not found. Creating from env.example..."
        cp env.example .env
        print_success "Created .env file from env.example"
        print_warning "Please edit .env with your database credentials"
        read -p "Press Enter to continue after editing .env..."
    else
        print_error "No .env file or env.example found"
        exit 1
    fi
    
    # Set defaults
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_USERNAME=${DB_USERNAME:-postgres}
    DB_PASSWORD=${DB_PASSWORD:-postgres}
    DB_DATABASE=${DB_DATABASE:-drone_fleet}
    
    # Step 3: Install dependencies
    print_section "Step 3: Installing Dependencies"
    
    if [ -d "node_modules" ]; then
        print_warning "node_modules already exists. Skipping npm install..."
    else
        print_success "Installing npm packages..."
        npm install
        print_success "Dependencies installed"
    fi
    
    # Step 4: Database setup
    print_section "Step 4: Setting up Database"
    
    # Create database if it doesn't exist
    print_success "Checking database: $DB_DATABASE"
    if psql -U "$DB_USERNAME" -lqt | cut -d \| -f 1 | grep -qw "$DB_DATABASE"; then
        print_warning "Database $DB_DATABASE already exists"
        read -p "Drop and recreate database? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            dropdb -U "$DB_USERNAME" "$DB_DATABASE" || true
            print_success "Dropped existing database"
        fi
    fi
    
    if ! psql -U "$DB_USERNAME" -lqt | cut -d \| -f 1 | grep -qw "$DB_DATABASE"; then
        print_success "Creating database: $DB_DATABASE"
        createdb -U "$DB_USERNAME" "$DB_DATABASE"
        print_success "Database created"
    fi
    
    # Enable PostGIS extension
    print_success "Enabling PostGIS extension"
    psql -U "$DB_USERNAME" -d "$DB_DATABASE" -c "CREATE EXTENSION IF NOT EXISTS postgis;" >/dev/null 2>&1
    print_success "PostGIS extension enabled"
    
    # Step 5: Build TypeScript
    print_section "Step 5: Building TypeScript"
    
    print_success "Building project..."
    npm run build
    print_success "Build completed"
    
    # Step 6: Run migrations (if using migrations)
    print_section "Step 6: Database Schema"
    
    read -p "Run migrations or use synchronize? (m/s) [s]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Mm]$ ]]; then
        print_success "Running migrations..."
        npm run migration:run || print_warning "Migrations failed (this is OK if no migrations exist)"
    else
        print_success "Using TypeORM synchronize (schema will be auto-generated on start)"
    fi
    
    # Step 7: Seed database (optional)
    print_section "Step 7: Database Seeding"
    
    read -p "Seed database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_success "Seeding database..."
        npm run seed:run || print_warning "Seeding failed (this is OK)"
    else
        print_success "Skipping database seeding"
    fi
    
    # Step 8: Run tests
    print_section "Step 8: Running Tests"
    
    read -p "Run tests? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_success "Running tests..."
        npm test
        print_success "Tests passed"
    else
        print_success "Skipping tests"
    fi
    
    # Summary
    print_section "✅ Setup Complete!"
    
    echo -e "${GREEN}Your Drone Fleet Management API is ready!${NC}\n"
    echo -e "Next steps:"
    echo -e "  1. Start development server: ${BLUE}npm run start:dev${NC}"
    echo -e "  2. Access API: ${BLUE}http://localhost:3000${NC}"
    echo -e "  3. Access Swagger: ${BLUE}http://localhost:3000/api${NC}"
    echo -e "  4. Run tests: ${BLUE}npm test${NC}"
    echo -e "\n${YELLOW}Database Information:${NC}"
    echo -e "  Host: ${DB_HOST}"
    echo -e "  Port: ${DB_PORT}"
    echo -e "  Database: ${DB_DATABASE}"
    echo -e "  Username: ${DB_USERNAME}"
    echo -e "\n"
}

# Run main function
main "$@"
