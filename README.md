# MCIA Unified Operations "Command Link" (Add-On Module)

## 📌 Project Overview
**Target:** Mactan-Cebu International Airport (MCIA) Staff Application  
**Developer Context:** Logic & UI Add-On for existing infrastructure.  
**Operational Scope:** Terminal 1 (Domestic), Terminal 2 (International), and AOCC (Airside).

This project is a **logic and intelligence add-on** designed to bridge the communication gap between MCIA's three major operational silos. It replaces manual "Viber/SMS" coordination with a structured, data-driven system that respects the specific physical layouts (Counters vs. Islands) and protocols (UV, Silent Airport) of the "Best Airport in Asia Pacific."

---

## 🏗 System Architecture: The "3-Zone" Model

The application moves away from a generic "One-Size-Fits-All" view and adopts a **Tri-Departmental Structure**. Data is strictly siloed during normal operations to prevent information overload, but **bridges immediately** during critical threats.

### 1. Zone A: Terminal Operations - Domestic (T1)
*   **User Focus:** Counters 1-29, 5J/DG Flight Operations.
*   **Context:** High frequency, quick turnaround events.
*   **Data View:** Only sees Domestic Flights, T1 Maintenance, and T1 Queues.

### 2. Zone B: Terminal Operations - International (T2)
*   **User Focus:** Islands A-D, Immigration, Customs.
*   **Context:** "Airport Resort" standards, high passenger dwell time.
*   **Data View:** Only sees International Flights, T2 Hazards, and Immigration bottlenecks.

### 3. Zone C: AOCC (Master Control)
*   **User Focus:** Airside, Runway, Emergency Planning.
*   **Context:** The "Nervous System" of the airport.
*   **Data View:** **Omniscient View.** Access to both T1 and T2 feeds, Aircraft movements, and Emergency Broadcast capability.

> **⚠️ The "Critical Bridge" Protocol:**
> *   **Normal Status:** A "Broken Chair in T1" is visible ONLY to Zone A.
> *   **Critical Status:** A "Bomb Threat" or "Runway Closure" bypasses filters and broadcasts to **Zone A, B, and C** simultaneously.

---

## 🚀 Key Features & Modules

### 1. Tactical Flight Status (Manifest View)
*Replaces basic timetables with operational depth.*
*   **Segmented Data:** Incoming, Outgoing, and Cancelled/Delayed tabs.
*   **Deep Details:** Displays Airline Logo, Flight Number, and Route.
*   **Operational Metrics:**
    *   **Pax Load:** Displays "Current Pax / Capacity" (e.g., *145/180*) to predict queue surges.
    *   **SSR Alerts:** Highlighted row for Special Service Requests (e.g., *⚠️ 2 WCHR, 1 MEDA*).
*   **Cancellation Logic:** Includes a "Reason Code" (Weather, Tech Issue) to assist PSAs in answering passenger queries immediately.

### 2. Smart Incident Reporting (The "No-AI" Logic)
*Replaces free-text typing with cascading "Smart Forms" to ensure standardized data.*
*   **Terminal Logic:**
    *   If User = T1, Dropdown shows "Counters 1-29".
    *   If User = T2, Dropdown shows "Islands A-D".
*   **The "UV" (Unattended Baggage) Tool:**
    *   Digitizes the 3-Step Paging Protocol.
    *   Features a built-in **Paging Timer**.
    *   **Rule:** The "Call Security/K9" button remains locked until the user confirms "Page 1," "Page 2," and "Page 3" timestamps.

### 3. Live Dashboard (Unified Feed)
*   **Real-Time Ticker:** Displays AOCC alerts (Gate Changes, Delays) scrolling at the top of the screen.
*   **Silent Airport Adaptation:** Uses **Visual Flash Alerts** (Red/Yellow banners) for urgent notifications instead of sound, preserving the quiet terminal atmosphere.
*   **Zone Status:** A simple "Traffic Light" indicator (Green/Yellow/Red) showing the current health of the user's specific terminal.

### 4. Role-Based Directory
*Solves the "Who do I call?" confusion.*
*   **Function-Based Speed Dial:** Buttons are labeled by need, not name:
    *   **[🚑 Medical Emergency]** → Connects to Airport Medical.
    *   **[👮 Security Threat]** → Connects to PNP/K9.
    *   **[✈️ Ops Control]** → Connects to AOCC.
    *   **[🧹 Sanitation]** → Connects to Janitorial Supervisor.

---

## 🚦 Severity Logic & Protocols

The app automatically categorizes incidents to ensure the right people are notified without relying on AI text analysis.

| Level | Definition | Target Department | Example Scenario |
| :--- | :--- | :--- | :--- |
| **LOW** | Cosmetic / Non-disruptive | Maintenance / Janitorial | Dirty washroom, flickering light, low water pressure. |
| **MEDIUM** | Operational Efficiency Dip | Terminal Ops Supervisor | Check-in queue >15 mins, Conveyor jam, Slow Tax counter. |
| **URGENT** | Passenger Distress / Risk | Ops + Station Manager | Passenger fainting (Medical), Flight disruption (Food required). |
| **CRITICAL** | Threat to Life / Security | **AOCC + SECURITY (ALL ZONES)** | Unattended Bag (Post-paging), Fire, Runway Obstruction. |

---

## 🛠 Tech Constraints & Design Principles

1.  **Low Tech / High Reliability:**
    *   No reliance on expensive Generative AI or LLMs.
    *   Uses hard-coded JSON logic and If/Then conditional statements.
2.  **Low Learning Curve:**
    *   UI mimics familiar social media feeds (Facebook/Viber style).
    *   One-tap actions for common tasks to accommodate staff constantly on their feet.
3.  **Visual Clarity:**
    *   High contrast text and distinct icons for Medical/Wheelchair alerts.
    *   Color-coded rows for flight status (Red = Cancelled, Orange = Delayed).

---

## 👥 Stakeholders & Context

*   **Managed By:** Aboitiz InfraCapital.
*   **Passenger Volume:** ~5 Million/Year.
*   **Key Design:** "Airport Resort" (T2) vs. Functional Efficiency (T1).
*   **Top Complaint to Address:** Flight Disruptions & Communication Gaps.

---

*This README serves as the master documentation for the Solution Architecture phase of the MCIA App Update for the Competition of Ceb-i Hacks.*
