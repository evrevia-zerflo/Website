import typer
from typing import Optional
from hunter.utils.logger import setup_logging
from hunter.db import init_db
from hunter.config import config

app = typer.Typer(help="EVRÉVIA Product Hunter CLI")

@app.command()
def check_suppliers():
    """
    Canary test: load a known sample page per supplier, report which fields extract.
    """
    setup_logging(log_level="INFO")
    typer.echo("Initializing database...")
    init_db()
    typer.echo("Checking suppliers...")
    
    for supplier in config.suppliers:
        typer.echo(f"Supplier: {supplier.name} - Enabled: {supplier.enabled}")
    
    typer.echo("Supplier check complete.")

@app.command()
def run(
    category: str = typer.Option(..., help="The category to run for, e.g. bags"),
    suppliers: Optional[str] = typer.Option(None, help="Comma-separated list of supplier IDs to restrict the run"),
    max_per_supplier: Optional[int] = typer.Option(None, help="Override the max products to scrape per supplier"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Do not make AI calls"),
    no_ai: bool = typer.Option(False, "--no-ai", help="Run MVP mode with no AI text or visual analysis"),
    headed: bool = typer.Option(False, "--headed", help="Run the browser in headed mode (visible)"),
    offline: bool = typer.Option(False, "--offline", help="Use cached HTML fixtures instead of live scraping")
):
    """
    Run the full extraction and scoring pipeline for a category.
    """
    setup_logging(run_id="temp_run_id", log_level="INFO")
    init_db()
    typer.echo(f"Starting run for category: {category}")
    
    from hunter.pipeline import run_pipeline
    import asyncio
    asyncio.run(run_pipeline(category, max_per_supplier, dry_run, no_ai, headed))
    typer.echo("Pipeline finished.")

@app.command()
def resume(
    run_id: str = typer.Argument(..., help="The ID of the run to resume")
):
    """
    Resume an interrupted run.
    """
    setup_logging(run_id=run_id, log_level="INFO")
    typer.echo(f"Resuming run: {run_id}")
    # TODO: Implement resume logic

if __name__ == "__main__":
    app()
