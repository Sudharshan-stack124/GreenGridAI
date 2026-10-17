"""
GreenGrid - Streamlit Visual Decision Cockpit
Role: Revanth — Decision Engine
Demonstration Use Case: Formula 1 Logistics & FIA Net Zero 2030
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

from greengrid.data.f1_scenarios import (
    get_melbourne_to_shanghai_scenario,
    get_miami_to_imola_scenario,
    get_european_double_header_scenario,
)
from greengrid.engine.decision_engine import DecisionEngine
from greengrid.engine.scorer import DEFAULT_WEIGHTS

# Page configuration
st.set_page_config(
    page_title="GreenGrid | F1 Logistics Decision Engine",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.3rem;
        font-weight: 800;
        color: #00D2BE; /* Mercedes/F1 Petronas Teal */
        margin-bottom: 0px;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #8E8EA0;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #1E222D;
        border-radius: 10px;
        padding: 18px;
        border-left: 5px solid #00D2BE;
        margin-bottom: 10px;
    }
    .badge-infeasible {
        background-color: #721c24;
        color: #f8d7da;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-title">⚡ GREENGRID DECISION ENGINE</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Role: <b>Revanth — Decision Engine</b> | Demonstration Use Case: <b>Formula 1 Global Logistics</b></div>', unsafe_allow_html=True)

# Sidebar: Controls
st.sidebar.header("🏁 Race Scenario Selection")
scenario_choice = st.sidebar.selectbox(
    "Choose Grand Prix Logistics Corridor:",
    [
        "Scenario 1: Melbourne -> Shanghai (Power Units & Chassis - 96h Window)",
        "Scenario 2: Miami -> Imola (Sea Kit & Hospitality + Red Sea Disruption)",
        "Scenario 3: Spa -> Zandvoort (European Double-Header Convoy)",
    ]
)

st.sidebar.markdown("---")
st.sidebar.header("⚖️ Multi-Objective Scoring Weights")
st.sidebar.caption("Mandated formula: 40% Emissions, 35% Cost, 25% Time")

w_emissions = st.sidebar.slider("🌿 CO₂e Emissions Weight (%)", 0, 100, int(DEFAULT_WEIGHTS["emissions"] * 100))
w_cost = st.sidebar.slider("💰 Freight Cost Weight (%)", 0, 100, int(DEFAULT_WEIGHTS["cost"] * 100))
w_time = st.sidebar.slider("⏱️ Lead Time Weight (%)", 0, 100, int(DEFAULT_WEIGHTS["time"] * 100))

total_slider_w = w_emissions + w_cost + w_time
if total_slider_w == 0:
    total_slider_w = 1

normalized_weights = {
    "emissions": w_emissions / total_slider_w,
    "cost": w_cost / total_slider_w,
    "time": w_time / total_slider_w,
}

st.sidebar.info(
    f"Normalized Active Weights:\n\n"
    f"- **Emissions:** {normalized_weights['emissions']*100:.1f}%\n"
    f"- **Cost:** {normalized_weights['cost']*100:.1f}%\n"
    f"- **Time:** {normalized_weights['time']*100:.1f}%"
)

# Load selected scenario
if "Scenario 1" in scenario_choice:
    shipment, options, disruptions = get_melbourne_to_shanghai_scenario()
elif "Scenario 2" in scenario_choice:
    shipment, options, disruptions = get_miami_to_imola_scenario()
else:
    shipment, options, disruptions = get_european_double_header_scenario()

# Disruption toggle
st.sidebar.markdown("---")
st.sidebar.header("🚨 Geopolitical & Climate Disruptions")
apply_disruptions = st.sidebar.checkbox("Simulate Active Corridor Disruptions", value=True)
active_disruptions = disruptions if apply_disruptions else []

if active_disruptions:
    for d in active_disruptions:
        st.sidebar.warning(f"⚠️ **{d.title}** ({d.severity.value}) - Affected: {', '.join(d.affected_corridors)}")
else:
    st.sidebar.success("No active disruptions simulated.")

# Run Decision Engine
engine = DecisionEngine(default_weights=normalized_weights)
result = engine.evaluate(
    shipment=shipment,
    options=options,
    disruptions=active_disruptions,
    weights=normalized_weights,
)

# Top KPI Summary Cards
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("📦 Consignment Mass", f"{shipment.total_weight_kg:,.0f} kg", f"{len(shipment.items)} Line Items")
with col2:
    st.metric("⏳ Available Window", f"{shipment.available_hours:.1f} hrs", f"Deadline: {shipment.destination_code}")
with col3:
    st.metric("🔍 Evaluated Candidates", f"{result.total_candidates_evaluated}", f"{result.feasible_count} Feasible | {result.infeasible_count} Filtered")
with col4:
    top_score = result.recommended_option.score_breakdown.total_score if result.recommended_option else 0.0
    st.metric("🏆 Top Score", f"{top_score:.1f}/100", f"Rank #1 Route")

st.markdown("---")

# Executive Memo
st.subheader("📋 Executive Decision Synthesis")
st.info(result.executive_summary)

# Recommended Option Showcase
if result.recommended_option:
    best = result.recommended_option
    sb = best.score_breakdown

    st.markdown("### 🥇 Recommended Optimal Route")
    rec_col1, rec_col2, rec_col3, rec_col4 = st.columns(4)
    with rec_col1:
        st.markdown(f"**Route Name:**\n\n`{best.option_name}`")
        st.markdown(f"**Carrier:** {best.carrier}")
        st.markdown(f"**Primary Mode:** `{best.primary_mode.value}`")
    with rec_col2:
        st.markdown(f"**CO₂e Footprint:**\n\n### 🌿 {sb.co2e_kg:,.0f} kg")
        st.caption(f"Emissions Points: {sb.emissions_contribution:.1f} / {normalized_weights['emissions']*100:.0f} pts")
    with rec_col3:
        st.markdown(f"**End-to-End Cost:**\n\n### 💰 ${sb.cost_usd:,.0f}")
        st.caption(f"Cost Points: {sb.cost_contribution:.1f} / {normalized_weights['cost']*100:.0f} pts")
    with rec_col4:
        st.markdown(f"**Lead Time & Margin:**\n\n### ⏱️ {sb.transit_hours:.1f} hrs")
        st.caption(f"Buffer Margin: +{best.slack_hours_before_deadline:.1f} hrs ahead of deadline")

    st.markdown(f"> **Rationale:** {best.rationale}")

st.markdown("---")

# Ranked Alternatives & Comparison Table
tab1, tab2, tab3, tab4 = st.tabs(["📊 Full Route Rankings", "📈 3D/2D Pareto Frontier", "⚖️ Trade-off Delta Analysis", "🚫 Filtered Infeasible Audit"])

with tab1:
    st.markdown("#### Candidate Route Scoring Leaderboard")
    if result.recommended_option:
        all_eligible = [result.recommended_option] + result.ranked_alternatives
        rows = []
        for r in all_eligible:
            rows.append({
                "Rank": f"#{r.rank}" if r.rank > 1 else "🥇 #1",
                "Option Name": r.option_name,
                "Carrier": r.carrier,
                "Mode": r.primary_mode.value,
                "Total Score": r.score_breakdown.total_score,
                "CO₂e (kg)": r.score_breakdown.co2e_kg,
                "Cost ($USD)": r.score_breakdown.cost_usd,
                "Lead Time (hrs)": r.score_breakdown.transit_hours,
                "Buffer (hrs)": r.slack_hours_before_deadline,
            })
        df_ranked = pd.DataFrame(rows)
        st.dataframe(df_ranked, width="stretch")

        # Stacked Score Contribution Bar Chart
        score_rows = []
        for r in all_eligible:
            score_rows.append({"Option": r.option_name, "Component": f"Emissions ({normalized_weights['emissions']*100:.0f}%)", "Points": r.score_breakdown.emissions_contribution})
            score_rows.append({"Option": r.option_name, "Component": f"Cost ({normalized_weights['cost']*100:.0f}%)", "Points": r.score_breakdown.cost_contribution})
            score_rows.append({"Option": r.option_name, "Component": f"Time ({normalized_weights['time']*100:.0f}%)", "Points": r.score_breakdown.time_contribution})
        df_score_stack = pd.DataFrame(score_rows)

        fig_stack = px.bar(
            df_score_stack,
            x="Option",
            y="Points",
            color="Component",
            title="Composite Score Breakdown by Objective Component",
            barmode="stack",
            color_discrete_map={
                f"Emissions ({normalized_weights['emissions']*100:.0f}%)": "#00D2BE",
                f"Cost ({normalized_weights['cost']*100:.0f}%)": "#FFB800",
                f"Time ({normalized_weights['time']*100:.0f}%)": "#FF5733",
            }
        )
        st.plotly_chart(fig_stack, width="stretch")

with tab2:
    st.markdown("#### Multi-Objective Trade-off Space (Cost vs Lead Time vs CO₂e)")
    if result.recommended_option:
        plot_rows = []
        for r in [result.recommended_option] + result.ranked_alternatives:
            plot_rows.append({
                "Option": r.option_name,
                "Cost ($)": r.score_breakdown.cost_usd,
                "Lead Time (hrs)": r.score_breakdown.transit_hours,
                "CO2e (kg)": r.score_breakdown.co2e_kg,
                "Score": r.score_breakdown.total_score,
                "Rank": f"Rank {r.rank}",
            })
        df_plot = pd.DataFrame(plot_rows)

        # 2D Scatter with Bubble size = CO2e
        fig_scatter = px.scatter(
            df_plot,
            x="Lead Time (hrs)",
            y="Cost ($)",
            size="CO2e (kg)",
            color="Score",
            hover_name="Option",
            text="Rank",
            color_continuous_scale="Viridis",
            title="Trade-off Frontier: Cost ($) vs Lead Time (hrs) [Bubble Size = CO₂e Footprint]",
        )
        fig_scatter.update_traces(textposition="top right")
        st.plotly_chart(fig_scatter, width="stretch")

with tab3:
    st.markdown("#### Comparative Trade-off Deltas Relative to #1 Recommendation")
    if result.ranked_alternatives:
        delta_rows = []
        for alt in result.ranked_alternatives:
            d = alt.tradeoff_vs_best
            if d:
                delta_rows.append({
                    "Rank": f"#{alt.rank}",
                    "Option Name": alt.option_name,
                    "Δ Cost ($)": f"{d.cost_diff_usd:+,.0f} ({d.cost_pct_change:+.1f}%)",
                    "Δ CO₂e (kg)": f"{d.co2e_diff_kg:+,.0f} ({d.co2e_pct_change:+.1f}%)",
                    "Δ Lead Time (hrs)": f"{d.time_diff_hours:+.1f} ({d.time_pct_change:+.1f}%)",
                    "Synthesis": d.human_summary,
                })
        st.dataframe(pd.DataFrame(delta_rows), width="stretch")
    else:
        st.info("No alternatives survived the feasibility and deadline filters.")

    # Sensitivity Scenarios Table
    if result.sensitivity_scenarios:
        st.markdown("#### Sensitivity Analysis Across Corporate Profiles")
        sens_rows = []
        for profile, data in result.sensitivity_scenarios.items():
            sens_rows.append({
                "Strategy Profile": profile,
                "Weights Allocation": data["weights"],
                "Winning Option": f"{data['winner_name']} ({data['winner_mode']})",
                "Winning Score": data["score"],
            })
        st.dataframe(pd.DataFrame(sens_rows), width="stretch")

with tab4:
    st.markdown("#### 🚫 Disqualified Route Candidates & Infeasibility Audit Trail")
    if result.infeasible_options:
        inf_rows = []
        for inf in result.infeasible_options:
            inf_rows.append({
                "Option ID": inf.option_id,
                "Option Name": inf.option_name,
                "Carrier": inf.carrier,
                "Mode": inf.primary_mode.value,
                "Rejection Code": inf.reason_code.value,
                "Audit Reason": inf.reason_message,
            })
        st.dataframe(pd.DataFrame(inf_rows), width="stretch")
    else:
        st.success("All candidate options satisfied operational constraints and deadlines.")
