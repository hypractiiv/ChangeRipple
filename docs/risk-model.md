# ChangeRipple Explainable Risk Model

## 1. Risk Formula Specification

ChangeRipple employs a multi-factor explainable heuristic formula calibrated between **0.0 and 100.0**:

$$\text{Score} = \min\left(100.0, \max\left(0.0, \text{round}\left(w_c S_c + w_p S_p + w_b S_b + w_{\text{cat}} S_{\text{cat}} + w_s S_s + B_{\text{req}}, 1\right)\right)\right)$$

### Factor Weights
| Factor | Notation | Weight ($w_i$) | Range |
| :--- | :--- | :--- | :--- |
| Component Criticality | $S_c$ | **0.35** | 10 – 100 |
| Impact Proximity / Depth | $S_p$ | **0.25** | 10 – 100 |
| Blast Radius / Reach | $S_b$ | **0.15** | 0 – 100 |
| Change Category | $S_{\text{cat}}$ | **0.15** | 30 – 100 |
| Change Severity | $S_s$ | **0.10** | 0 – 100 |
| Requirement Bonus | $B_{\text{req}}$ | Fixed Bonus | 0 or 12 pts |

---

## 2. Factor Calibration & Scoring Rules

### 2.1 Criticality Tier ($S_c$)
- `CRITICAL`: 100.0 pts (PCI compliance, payment processing, identity tokens)
- `HIGH`: 65.0 pts (Core business services, order processors)
- `MEDIUM`: 30.0 pts (Inventory lookup, search indexes)
- `LOW`: 10.0 pts (Utility helpers, logging wrappers)

### 2.2 Proximity Score ($S_p$)
Impact decays with graph distance from the root changed component:
- $\text{Depth} = 1$ (Direct): **100.0 pts**
- $\text{Depth} = 2$: **65.0 pts**
- $\text{Depth} = 3$: **40.0 pts**
- $\text{Depth} \ge 4$: $\max(10.0, \frac{100.0}{\text{depth} \times 1.5})$

### 2.3 Blast Radius ($S_b$)
Proportion of project components directly or transitively depending on this component:
$$S_b = \min\left(100.0, \frac{\text{blastCount}}{\max(1, N_{\text{total}})} \times 200.0\right)$$
A reach of 50% or more of project nodes saturates the blast radius contribution to 100.

### 2.4 Change Category Multiplier ($S_{\text{cat}}$)
- `SECURITY_CHANGE`: 100.0% (scaled base 20/20)
- `DATA_MODEL_CHANGE`: 90.0% (scaled base 18/20)
- `INTERFACE_CHANGE`: 70.0% (scaled base 14/20)
- `LOGIC_CHANGE`: 40.0% (scaled base 8/20)
- `CONFIGURATION_CHANGE`: 30.0% (scaled base 6/20)

### 2.5 Change Severity Multiplier ($S_s$)
- `CRITICAL`: 100.0% (scaled base 18/18)
- `HIGH`: 66.7% (scaled base 12/18)
- `MEDIUM`: 33.3% (scaled base 6/18)
- `LOW`: 0.0% (scaled base 0/18)

---

## 3. Risk Bands
- **CRITICAL** ($\ge 80.0$): Immediate architect sign-off, full regression test execution required.
- **HIGH** ($60.0 - 79.9$): Senior code review, mandatory test execution of affected modules.
- **MEDIUM** ($30.0 - 59.9$): Standard peer review, unit and integration test runs.
- **LOW** ($0.0 - 29.9$): Minor isolated logic change, standard CI checks.

---

## 4. Important Methodological Disclaimer
ChangeRipple's heuristic risk score provides **engineering prioritization and triage guidance**. It does not represent a statistically certified probability of real-world system failure.
