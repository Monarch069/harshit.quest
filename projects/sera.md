---
description: "Sera: causal Hold/Long/Short prediction on second-level market data with Kalman, CUSUM and time-encoding features and an XGBoost classifier."
series_title: "Projects"
post_title: "Sera"
---
{{extend "pages/post"}}

*Time-series machine learning for trading* · Inter-IIT Tech Meet internal selection (a past Inter-IIT problem) · Sep – Oct 2026

## Framing

I framed the brief as a **causal three-class prediction problem** (Hold / Long / Short) on second-level data for two anonymized instruments with masked features. Each decision uses only past information.

## Features

I researched and proposed these engineered features:

- a **Kalman-filter** smoothed-price slope
- a **CUSUM-style** regime state
- **sine/cosine encoding** of trading time

## Pipeline

The pipeline trains an **XGBoost** classifier in memory-bounded batches over **~9.3M sequences**. A cost-aware backtester scores the results.
