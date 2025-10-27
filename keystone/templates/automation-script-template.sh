#!/bin/bash

# ============================================================================
# [SCRIPT NAME] - [Brief Description]
# ============================================================================
#
# Description:
#   [Detailed description of what this script does]
#
# Usage:
#   Interactive Mode:  ./script-name.sh
#   Automated Mode:    ./script-name.sh [OPTIONS]
#
# Options:
#   -h, --help              Show this help message
#   -o, --operation VALUE   Perform specific operation
#   -c, --confirm           Skip confirmation prompts
#
# Examples:
#   ./script-name.sh                    # Interactive menu
#   ./script-name.sh --operation=test   # Automated test
#   ./script-name.sh -c                 # Auto-confirm mode
#
# Prerequisites:
#   - PostgreSQL installed locally
#   - ~/.pgpass configured (see keystone/claude-code-compatibility.md)
#   - utilities/.env file with credentials
#
# ============================================================================

# Color codes for output
readonly COLOR_RESET='\033[0m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_RED='\033[0;31m'
readonly COLOR_CYAN='\033[0;36m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env if exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Configuration defaults
INTERACTIVE_MODE=false
OPERATION=""
CONFIRM=false

# ============================================================================
# Helper Functions
# ============================================================================

log() {
    local message="$1"
    local color="${2:-$COLOR_RESET}"
    echo -e "${color}${message}${COLOR_RESET}"
}

log_success() {
    log "✓ $1" "$COLOR_GREEN"
}

log_error() {
    log "✗ $1" "$COLOR_RED"
}

log_info() {
    log "ℹ $1" "$COLOR_CYAN"
}

log_warning() {
    log "⚠ $1" "$COLOR_YELLOW"
}

# ============================================================================
# Usage and Help
# ============================================================================

show_usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Options:
    -h, --help              Show this help message
    -o, --operation VALUE   Perform specific operation
    -c, --confirm           Skip confirmation prompts

Examples:
    # Interactive mode
    $(basename "$0")

    # Automated mode
    $(basename "$0") --operation=test
    $(basename "$0") --confirm

Prerequisites:
    - PostgreSQL credentials in ~/.pgpass
    - Environment variables in utilities/.env
    - See keystone/claude-code-compatibility.md for setup

EOF
    exit 0
}

# ============================================================================
# Argument Parsing
# ============================================================================

parse_arguments() {
    if [ $# -eq 0 ]; then
        INTERACTIVE_MODE=true
        return
    fi

    INTERACTIVE_MODE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                ;;
            -o|--operation)
                OPERATION="$2"
                shift 2
                ;;
            --operation=*)
                OPERATION="${1#*=}"
                shift
                ;;
            -c|--confirm)
                CONFIRM=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                ;;
        esac
    done
}

# ============================================================================
# Credential and Environment Validation
# ============================================================================

validate_environment() {
    local missing_requirements=false

    # Check for .pgpass file
    if [ ! -f "$HOME/.pgpass" ]; then
        log_warning "~/.pgpass not found"
        log_info "Create with: echo 'localhost:5432:*:postgres:localdbpass' > ~/.pgpass && chmod 600 ~/.pgpass"
        missing_requirements=true
    fi

    # Check for .env file
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        log_warning "utilities/.env not found"
        log_info "Copy template: cp utilities/.env.example utilities/.env"
        missing_requirements=true
    fi

    # Check for required environment variables
    if [ -z "$DATABASE_URL" ]; then
        log_warning "DATABASE_URL not set in environment"
        missing_requirements=true
    fi

    if [ "$missing_requirements" = true ]; then
        log_error "Missing requirements. See keystone/claude-code-compatibility.md"
        return 1
    fi

    return 0
}

# ============================================================================
# Core Functionality
# ============================================================================

perform_operation_one() {
    log_info "Performing operation one..."

    # Example: Database query without password prompt
    # psql -U postgres veritas_local -c "SELECT COUNT(*) FROM table;"

    log_success "Operation one completed"
}

perform_operation_two() {
    log_info "Performing operation two..."

    # Example: Direct Railway connection
    # psql "$RAILWAY_DATABASE_URL" -c "SELECT version();"

    log_success "Operation two completed"
}

# ============================================================================
# Interactive Menu
# ============================================================================

show_menu() {
    echo ""
    log "=== [Script Name] ===" "$COLOR_CYAN"
    echo "1. Operation One"
    echo "2. Operation Two"
    echo "3. Exit"
    echo ""
}

get_menu_choice() {
    local choice
    read -p "Select option (1-3): " choice
    echo "$choice"
}

handle_interactive_menu() {
    while true; do
        show_menu
        choice=$(get_menu_choice)

        case $choice in
            1)
                perform_operation_one
                ;;
            2)
                perform_operation_two
                ;;
            3)
                log_info "Exiting..."
                exit 0
                ;;
            *)
                log_error "Invalid choice. Please select 1-3."
                ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# ============================================================================
# Automated Execution
# ============================================================================

handle_automated_execution() {
    if [ -z "$OPERATION" ]; then
        log_error "No operation specified. Use --operation=VALUE"
        show_usage
    fi

    case $OPERATION in
        one|1)
            perform_operation_one
            ;;
        two|2)
            perform_operation_two
            ;;
        *)
            log_error "Unknown operation: $OPERATION"
            log_info "Valid operations: one, two"
            exit 1
            ;;
    esac

    log_success "Automated execution completed"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    # Parse command-line arguments
    parse_arguments "$@"

    # Validate environment and credentials
    if ! validate_environment; then
        exit 1
    fi

    # Execute based on mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        log_info "Running in interactive mode"
        handle_interactive_menu
    else
        log_info "Running in automated mode"
        handle_automated_execution
    fi
}

# Run main function with all arguments
main "$@"
