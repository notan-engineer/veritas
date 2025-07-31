# Project: Veritas Scraper Refactor and Automation

This project overhauls the Veritas scraper service to create a reliable, maintainable, and scalable content aggregation subsystem. The project has two primary objectives:

1. **Refactor**: Rearchitect the existing implementation into a modular, source-specific system using Crawlee's Router to improve reliability and maintainability.
2. **Semi-Automate**: Introduce a workflow to streamline the addition of new sources, using a generic fallback, a configuration generation script, and a clear process for creating new, specific handlers with LLM assistance.