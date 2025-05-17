# Remove mock function overrides and rely on real imported suggestion functions
from sugestionmit2024 import generate_suggestions_mit2024
from sugestionmit2025 import generate_suggestions_mit2025
from sugestionmds2024 import generate_suggestions_mds2024
from sugestionmds2025 import generate_suggestions_mds2025

# Define test plans
test_plans = {
    "MIT-2024": [
        ["CITS1401", "CITS1003"],
        ["CITS1402", "CITS2005"],
        ["CITS5508"],
        ["CITS5206"]
    ],
    "MIT-2025": [
        ["CITS1401"],
        ["CITS1402", "CITS5508"],
        ["CITS5505"],
        ["PHIL4100"]
    ],
    "MDS-2024": [
        ["DATA5001", "CITS1401"],
        ["CITS5508", "STAT4064"],
        ["CITS5206", "DATA5100"],
        ["PHIL4100"]
    ],
    "MDS-2025": [
        ["DATA5001", "CITS1402"],
        ["STAT4066"],
        ["CITS5508"],
        ["PHIL4100"]
    ]
}

# Store results
test_results = []

# Execute test cases
for label, plan in test_plans.items():
    if label == "MIT-2024":
        result = generate_suggestions_mit2024(plan)
    elif label == "MIT-2025":
        result = generate_suggestions_mit2025(plan)
    elif label == "MDS-2024":
        result = generate_suggestions_mds2024(plan)
    elif label == "MDS-2025":
        result = generate_suggestions_mds2025(plan)
    else:
        result = {"label": label, "suggestions": ["No function defined."]}

    test_results.append({
        "Program": label,
        "Total Suggestions": len(result["suggestions"]),
        "Details": result["suggestions"]
    })

import pandas as pd

df = pd.DataFrame(test_results)
print("\n=== Program Suggestion Test Results ===")
print(df.to_string(index=False))

