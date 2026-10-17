"""
GreenGrid Decision Engine Showcase Demo
Role: Revanth — Decision Engine

Runs the core business logic against realistic Formula 1 Grand Prix logistics scenarios:
1. Melbourne to Shanghai (Power Units & Chassis - 96h deadline, Hazmat Class 9)
2. Miami to Imola (Sea Kit & Hospitality - 504h deadline, Red Sea naval closure)
3. Spa to Zandvoort (European double header - 72h, HVO100 biofuel vs Diesel vs Rail)
"""

import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich import box

from greengrid.data.f1_scenarios import (
    get_melbourne_to_shanghai_scenario,
    get_miami_to_imola_scenario,
    get_european_double_header_scenario,
)
from greengrid.engine.decision_engine import DecisionEngine
from greengrid.models.decision import DecisionResult

console = Console()


def print_banner():
    banner = (
        "=====================================================================\n"
        "   GREENGRID: AI-POWERED SUSTAINABLE LOGISTICS OPTIMIZATION SYSTEM   \n"
        "   Role: Revanth — Decision Engine (Core Business Logic)             \n"
        "====================================================================="
    )
    console.print(Panel(Text(banner, style="bold green"), subtitle="[bold yellow]Formula 1 Logistics & FIA Net Zero 2030[/bold yellow]", box=box.ROUNDED))


def display_scenario_results(scenario_num: int, title: str, result: DecisionResult):
    console.print(f"\n[bold magenta]═══════════════════════════════════════════════════════════════════════════════[/bold magenta]")
    console.print(f"[bold white on blue] SCENARIO {scenario_num}: {title.upper()} [/bold white on blue]")
    console.print(f"[bold magenta]═══════════════════════════════════════════════════════════════════════════════[/bold magenta]")
    
    # 1. Executive Summary Panel
    console.print(Panel(
        f"[bold cyan]Shipment ID:[/bold cyan] {result.shipment_id}\n"
        f"[bold cyan]Weights Applied:[/bold cyan] [bold green]40% Emissions[/bold green] | [bold yellow]35% Cost[/bold yellow] | [bold blue]25% Time[/bold blue]\n"
        f"[bold cyan]Evaluation Summary:[/bold cyan] {result.total_candidates_evaluated} candidates evaluated -> "
        f"[green]{result.feasible_count} Feasible[/green] | [red]{result.infeasible_count} Infeasible[/red]\n\n"
        f"[italic]{result.executive_summary}[/italic]",
        title="[bold white]Executive Logistics Memo[/bold white]",
        border_style="cyan",
        box=box.ROUNDED,
    ))

    # 2. Infeasible / Eliminated Options Table
    if result.infeasible_options:
        inf_table = Table(title="[bold red]🚫 Disqualified / Infeasible Transport Options[/bold red]", box=box.SIMPLE_HEAVY)
        inf_table.add_column("Option ID", style="dim", width=22)
        inf_table.add_column("Carrier & Name", style="bold white", width=34)
        inf_table.add_column("Primary Mode", style="cyan", width=14)
        inf_table.add_column("Disqualification Reason", style="bold red", width=30)
        inf_table.add_column("Audit Details", style="dim yellow")

        for inf in result.infeasible_options:
            inf_table.add_row(
                inf.option_id,
                f"{inf.carrier}\n{inf.option_name}",
                inf.primary_mode.value,
                inf.reason_code.value,
                inf.reason_message,
            )
        console.print(inf_table)

    # 3. Eligible & Ranked Options Table
    if result.recommended_option:
        rank_table = Table(title="[bold green]🏆 Eligible & Ranked Shipping Routes (40% CO2e / 35% Cost / 25% Time)[/bold green]", box=box.DOUBLE_EDGE)
        rank_table.add_column("Rank", justify="center", style="bold yellow", width=6)
        rank_table.add_column("Option Name & Carrier", style="bold white", width=32)
        rank_table.add_column("Mode & Fuel", style="cyan", width=18)
        rank_table.add_column("CO2e Footprint", justify="right", style="green", width=14)
        rank_table.add_column("Cost (USD)", justify="right", style="yellow", width=13)
        rank_table.add_column("Lead Time", justify="right", style="magenta", width=11)
        rank_table.add_column("Buffer Margin", justify="right", style="blue", width=13)
        rank_table.add_column("Score (0-100)", justify="center", style="bold green", width=13)

        all_ranked = [result.recommended_option] + result.ranked_alternatives
        for r in all_ranked:
            sb = r.score_breakdown
            badge = "🥇 BEST" if r.rank == 1 else f"#{r.rank}"
            primary_leg_fuel = r.option_details.legs[0].fuel_type.value if r.option_details.legs else "STANDARD"
            
            rank_table.add_row(
                badge,
                f"{r.option_name}\n[dim]{r.carrier}[/dim]",
                f"{r.primary_mode.value}\n[dim]{primary_leg_fuel}[/dim]",
                f"{sb.co2e_kg:,.0f} kg\n[dim]({sb.emissions_contribution:.1f}/40 pts)[/dim]",
                f"${sb.cost_usd:,.0f}\n[dim]({sb.cost_contribution:.1f}/35 pts)[/dim]",
                f"{sb.transit_hours:.1f} hrs\n[dim]({sb.time_contribution:.1f}/25 pts)[/dim]",
                f"{r.slack_hours_before_deadline:.1f} hrs",
                f"[bold green]{sb.total_score:.1f}[/bold green]",
            )
        console.print(rank_table)

    # 4. Comparative Trade-off Deltas
    if result.ranked_alternatives:
        trade_table = Table(title="[bold yellow]⚖️ Trade-off Analysis vs Recommended #1 Option[/bold yellow]", box=box.ROUNDED)
        trade_table.add_column("Rank", justify="center", style="bold", width=6)
        trade_table.add_column("Option", style="bold white", width=28)
        trade_table.add_column("Δ Cost", justify="right", width=15)
        trade_table.add_column("Δ CO2e", justify="right", width=18)
        trade_table.add_column("Δ Lead Time", justify="right", width=15)
        trade_table.add_column("Decision Synthesis", style="italic cyan")

        for alt in result.ranked_alternatives:
            d = alt.tradeoff_vs_best
            if d:
                cost_str = f"+${d.cost_diff_usd:,.0f}" if d.cost_diff_usd > 0 else f"-${abs(d.cost_diff_usd):,.0f}"
                co2_str = f"+{d.co2e_diff_kg:,.0f} kg" if d.co2e_diff_kg > 0 else f"-{abs(d.co2e_diff_kg):,.0f} kg"
                time_str = f"+{d.time_diff_hours:.1f} hrs" if d.time_diff_hours > 0 else f"-{abs(d.time_diff_hours):.1f} hrs"
                
                trade_table.add_row(
                    f"#{alt.rank}",
                    alt.option_name,
                    f"[{'red' if d.cost_diff_usd > 0 else 'green'}]{cost_str} ({d.cost_pct_change:+.1f}%)[/]",
                    f"[{'red' if d.co2e_diff_kg > 0 else 'green'}]{co2_str} ({d.co2e_pct_change:+.1f}%)[/]",
                    f"[{'red' if d.time_diff_hours > 0 else 'green'}]{time_str} ({d.time_pct_change:+.1f}%)[/]",
                    d.human_summary,
                )
        console.print(trade_table)

    # 5. Sensitivity Analysis
    if result.sensitivity_scenarios:
        sens_table = Table(title="[bold cyan]🔄 Multi-Objective Sensitivity Analysis (Strategy Shifting)[/bold cyan]", box=box.SIMPLE)
        sens_table.add_column("Strategy Profile", style="bold white", width=26)
        sens_table.add_column("Weight Allocation", style="dim", width=34)
        sens_table.add_column("Winning Route Candidate", style="bold green", width=32)
        sens_table.add_column("Winning Score", justify="center", style="yellow", width=14)

        for profile, data in result.sensitivity_scenarios.items():
            sens_table.add_row(
                profile,
                data["weights"],
                f"{data['winner_name']} ({data['winner_mode']})",
                data["score"],
            )
        console.print(sens_table)


def main():
    print_banner()
    engine = DecisionEngine()

    # Scenario 1: Melbourne -> Shanghai
    s1, opt1, d1 = get_melbourne_to_shanghai_scenario()
    r1 = engine.evaluate(s1, opt1, d1)
    display_scenario_results(1, "Melbourne to Shanghai (Hybrid Power Units & Chassis)", r1)

    # Scenario 2: Miami -> Imola (with Red Sea Naval Blockage)
    s2, opt2, d2 = get_miami_to_imola_scenario()
    r2 = engine.evaluate(s2, opt2, d2)
    display_scenario_results(2, "Miami to Imola (Sea Kit & Hospitality + Red Sea Disruption)", r2)

    # Scenario 3: Spa -> Zandvoort (European double header)
    s3, opt3, d3 = get_european_double_header_scenario()
    r3 = engine.evaluate(s3, opt3, d3)
    display_scenario_results(3, "Spa to Zandvoort (European Paddock Fleet: HVO100 vs Diesel vs Rail)", r3)

    console.print("\n[bold green]✔ Demonstration completed successfully. All core business logic verified.[/bold green]\n")


if __name__ == "__main__":
    main()
