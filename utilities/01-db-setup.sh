#!/bin/bash

# Veritas Database Setup & Import Tool
# Supports both interactive and automated modes

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# PostgreSQL binary paths
PSQL_PATH="/Library/PostgreSQL/18/bin/psql"
CREATEDB_PATH="/Library/PostgreSQL/18/bin/createdb"
PG_DUMP_PATH="/Library/PostgreSQL/18/bin/pg_dump"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables if .env exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Default values
DB_NAME="${LOCAL_DB_NAME:-veritas_local}"
DB_USER="${LOCAL_DB_USER:-postgres}"
DUMP_FILE="veritas_prod_dump.sql"

# Mode flags
INTERACTIVE_MODE=true
MODE=""

# Show usage
show_usage() {
    cat << EOF
${GREEN}Veritas Database Setup & Import Tool${NC}
${GREEN}====================================${NC}

${CYAN}Usage:${NC}
  $0 [OPTIONS]

${CYAN}Options:${NC}
  -f, --full-setup    Full setup: create DB + export Railway + import
  -c, --create-db     Create local database only
  -e, --export        Export Railway data to dump file only
  -i, --import        Import existing dump file to local database
  -h, --help          Show this help message

${CYAN}Examples:${NC}
  # Interactive mode (menu-driven)
  $0

  # Automated mode - full setup
  $0 --full-setup

  # Step-by-step automated
  $0 --create-db
  $0 --export
  $0 --import

${CYAN}Environment:${NC}
  Create utilities/.env file with:
    RAILWAY_DATABASE_URL=postgresql://...

  Or use:
    railway variables --service db --kv | grep DATABASE_URL

${CYAN}Authentication:${NC}
  Uses ~/.pgpass for PostgreSQL authentication
  Format: localhost:5432:*:postgres:password

EOF
    exit 0
}

# Parse command line arguments
parse_arguments() {
    if [ $# -eq 0 ]; then
        INTERACTIVE_MODE=true
        return
    fi

    INTERACTIVE_MODE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--full-setup)
                MODE="full"
                shift
                ;;
            -c|--create-db)
                MODE="create"
                shift
                ;;
            -e|--export)
                MODE="export"
                shift
                ;;
            -i|--import)
                MODE="import"
                shift
                ;;
            -h|--help)
                show_usage
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_usage
                ;;
        esac
    done
}

# Check PostgreSQL installation
check_postgresql() {
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version)
        echo -e "${CYAN}PostgreSQL detected: $PG_VERSION${NC}"
    elif [ -f "$PSQL_PATH" ]; then
        PG_VERSION=$($PSQL_PATH --version)
        echo -e "${CYAN}PostgreSQL detected: $PG_VERSION${NC}"
    else
        echo -e "${RED}PostgreSQL not found. Please install PostgreSQL first.${NC}"
        echo -e "${YELLOW}Download from: https://www.postgresql.org/download/macosx/${NC}"
        echo -e "${YELLOW}Or install via Homebrew: brew install postgresql@18${NC}"
        exit 1
    fi
}

# Function to create local database
create_local_database() {
    echo -e "\n${YELLOW}Creating local database '${DB_NAME}'...${NC}"

    # Try to create database
    if command -v createdb &> /dev/null; then
        CREATE_OUTPUT=$(createdb -U $DB_USER $DB_NAME 2>&1)
        CREATE_EXIT=$?
    elif [ -f "$CREATEDB_PATH" ]; then
        CREATE_OUTPUT=$($CREATEDB_PATH -U $DB_USER $DB_NAME 2>&1)
        CREATE_EXIT=$?
    else
        echo -e "${RED}Error: createdb command not found${NC}"
        return 1
    fi

    if [ $CREATE_EXIT -eq 0 ]; then
        echo -e "${GREEN}Database '$DB_NAME' created successfully!${NC}"
        return 0
    elif echo "$CREATE_OUTPUT" | grep -q "already exists"; then
        echo -e "${YELLOW}Database '$DB_NAME' already exists - continuing...${NC}"
        return 0
    else
        echo -e "${RED}Error creating database: $CREATE_OUTPUT${NC}"
        echo -e "${YELLOW}Note: Ensure ~/.pgpass is configured or PostgreSQL is running${NC}"
        return 1
    fi
}

# Function to export Railway data (non-interactive)
export_railway_data_automated() {
    echo -e "\n${YELLOW}Exporting Railway production data...${NC}"

    # Check if Railway database URL is available
    if [ -z "$RAILWAY_DATABASE_URL" ]; then
        echo -e "${RED}Error: RAILWAY_DATABASE_URL not set${NC}"
        echo -e "${YELLOW}Please set it in utilities/.env or export it as environment variable${NC}"
        echo -e "${YELLOW}Get it from: railway variables --service db --kv | grep DATABASE_URL${NC}"
        return 1
    fi

    # Use pg_dump with direct connection
    if command -v pg_dump &> /dev/null; then
        PG_DUMP_CMD="pg_dump"
    elif [ -f "$PG_DUMP_PATH" ]; then
        PG_DUMP_CMD="$PG_DUMP_PATH"
    else
        echo -e "${RED}Error: pg_dump command not found${NC}"
        return 1
    fi

    echo -e "${CYAN}Connecting to Railway database...${NC}"
    $PG_DUMP_CMD "$RAILWAY_DATABASE_URL" > "$DUMP_FILE" 2>&1

    if [ $? -eq 0 ] && [ -f "$DUMP_FILE" ]; then
        FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
        echo -e "${GREEN}Success! Database dump created:${NC}"
        echo -e "${WHITE}  File: $DUMP_FILE${NC}"
        echo -e "${WHITE}  Size: $FILE_SIZE${NC}"
        return 0
    else
        echo -e "${RED}Error: Failed to create dump file${NC}"
        return 1
    fi
}

# Function to export Railway data (interactive)
export_railway_data_interactive() {
    echo -e "\n${YELLOW}Connecting to Railway to export production data...${NC}"
    echo -e "${CYAN}This will open Railway CLI. Please select the 'db' service when prompted.${NC}"
    echo -e "${CYAN}After connecting, run this command:${NC}"
    echo -e "\n${WHITE}  pg_dump railway > $DUMP_FILE${NC}"
    echo -e "\n${CYAN}Then type 'exit' to continue.${NC}"
    echo -e "\n${YELLOW}Press Enter to open Railway CLI...${NC}"
    read -r

    railway connect

    if [ -f "$DUMP_FILE" ]; then
        FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
        echo -e "\n${GREEN}Success! Database dump created:${NC}"
        echo -e "${WHITE}  File: $DUMP_FILE${NC}"
        echo -e "${WHITE}  Size: $FILE_SIZE${NC}"
        return 0
    else
        echo -e "\n${RED}Error: $DUMP_FILE not found!${NC}"
        echo -e "${YELLOW}Did you run the pg_dump command inside Railway?${NC}"
        return 1
    fi
}

# Wrapper function for export
export_railway_data() {
    if [ "$INTERACTIVE_MODE" = true ] || [ -z "$RAILWAY_DATABASE_URL" ]; then
        export_railway_data_interactive
    else
        export_railway_data_automated
    fi
}

# Function to import to local database
import_to_local_database() {
    if [ ! -f "$DUMP_FILE" ]; then
        echo -e "${RED}Error: $DUMP_FILE not found!${NC}"
        echo -e "${YELLOW}Please run export first (--export or option 4)${NC}"
        return 1
    fi

    echo -e "\n${YELLOW}Importing production data to local database '$DB_NAME'...${NC}"

    # Use psql with direct connection
    if command -v psql &> /dev/null; then
        psql -U $DB_USER $DB_NAME -f "$DUMP_FILE" > /dev/null 2>&1
    elif [ -f "$PSQL_PATH" ]; then
        $PSQL_PATH -U $DB_USER $DB_NAME -f "$DUMP_FILE" > /dev/null 2>&1
    else
        echo -e "${RED}Error: psql command not found${NC}"
        return 1
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Data imported successfully!${NC}"

        # Verify data
        echo -e "\n${YELLOW}Verifying imported data...${NC}"
        echo -e "${CYAN}Database statistics:${NC}"

        PSQL_CMD="psql"
        if ! command -v psql &> /dev/null && [ -f "$PSQL_PATH" ]; then
            PSQL_CMD="$PSQL_PATH"
        fi

        $PSQL_CMD -U $DB_USER $DB_NAME -t -c "SELECT COUNT(*) as count FROM sources;"
        $PSQL_CMD -U $DB_USER $DB_NAME -t -c "SELECT COUNT(*) as count FROM scraping_jobs;"
        $PSQL_CMD -U $DB_USER $DB_NAME -t -c "SELECT COUNT(*) as count FROM scraped_content;"

        # Check BBC News
        echo -e "\n${CYAN}BBC News sources:${NC}"
        $PSQL_CMD -U $DB_USER $DB_NAME -c "SELECT id, name, rss_url FROM sources WHERE LOWER(name) LIKE '%bbc%' LIMIT 5;"

        return 0
    else
        echo -e "${RED}Error importing data. Check the output above.${NC}"
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Setup complete! Next steps:${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n${YELLOW}1. Update services/scraper/.env with:${NC}"
    echo -e "${WHITE}   DATABASE_URL=postgresql://$DB_USER:yourpassword@localhost:5432/$DB_NAME${NC}"
    echo -e "\n${YELLOW}2. Start the scraper service:${NC}"
    echo -e "${CYAN}   cd services/scraper && npm run dev${NC}"
    echo -e "\n${YELLOW}3. Test scraping:${NC}"
    echo -e "${CYAN}   cd utilities && node 03-test-scraper.js${NC}"
}

# Interactive menu
show_interactive_menu() {
    echo -e "\n${YELLOW}What would you like to do?${NC}"
    echo -e "${WHITE}1. Full setup (create DB + import Railway data)${NC}"
    echo -e "${WHITE}2. Create local database only${NC}"
    echo -e "${WHITE}3. Import Railway data to existing database${NC}"
    echo -e "${WHITE}4. Export Railway data only (create dump file)${NC}"

    echo -e -n "\n${YELLOW}Enter choice (1-4): ${NC}"
    read -r choice

    case $choice in
        1)
            if create_local_database; then
                if export_railway_data; then
                    if import_to_local_database; then
                        show_next_steps
                    fi
                fi
            fi
            ;;
        2)
            if create_local_database; then
                echo -e "\n${GREEN}Database created. You can now import data using option 3.${NC}"
            fi
            ;;
        3)
            if import_to_local_database; then
                show_next_steps
            fi
            ;;
        4)
            if export_railway_data; then
                echo -e "\n${GREEN}Export complete. You can now import using option 3.${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Invalid choice. Please run the script again.${NC}"
            exit 1
            ;;
    esac
}

# Automated mode execution
execute_automated_mode() {
    case $MODE in
        full)
            echo -e "${CYAN}Running full automated setup...${NC}"
            if create_local_database; then
                if export_railway_data; then
                    if import_to_local_database; then
                        show_next_steps
                    fi
                fi
            fi
            ;;
        create)
            create_local_database
            ;;
        export)
            export_railway_data
            ;;
        import)
            if import_to_local_database; then
                show_next_steps
            fi
            ;;
        *)
            echo -e "${RED}Error: Invalid mode${NC}"
            show_usage
            ;;
    esac
}

# Main execution
main() {
    echo -e "${GREEN}Veritas Database Setup & Import Tool${NC}"
    echo -e "${GREEN}====================================${NC}"
    echo -e "${CYAN}Supports both interactive and automated modes${NC}"

    # Parse arguments
    parse_arguments "$@"

    # Check PostgreSQL
    check_postgresql

    # Execute based on mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        show_interactive_menu
    else
        execute_automated_mode
    fi
}

# Run main function
main "$@"
