---
series_title: "Projects"
post_title: "CeresAstro"
---
{{extend "pages/post"}}

*Statistical signal detection, Chandrayaan-2 data* · Inter-IIT Tech Meet internal selection (a past Inter-IIT problem) · Sep – Oct 2026

## Method

I chose the statistical approach for detecting solar X-ray bursts in **Chandrayaan-2 XSM** light curves, based on published flare studies:

- a **rolling-percentile** baseline
- a robust **MAD** (median absolute deviation) noise scale
- **Gaussian–exponential** pulse fits for burst shapes

## Evaluation

- One-to-one matching of detections to reference events
- **Precision, recall, F1**, and false alarms per observed hour
- A written analysis of the method's limits

## Result

At fixed settings, the tool flags **36 candidate burst windows** across **~100 observed hours**. It runs as a local web app.
