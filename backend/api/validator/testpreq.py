from availability_and_prereq_checker import validate_study_plan

# Define a sample plan that triggers both availability and prerequisite errors
sample_plan = [
    ["CITS2002"],       # Not available in 24S1 and missing prereq
    ["CITS1401"],       # Available in 24S2 (ok)
    ["CITS5506"],       # Requires PythonCompletedMITMDS
    ["CITS5508", "CITS4404"]  # Should be fine if prereqs met
]
starting_semester = "24S1"

result = validate_study_plan(sample_plan, starting_semester)

print("=== AVAILABILITY ===")
for entry in result["availability"]:
    print(entry)

print("\n=== PREREQUISITE ERRORS ===")
for unit, msg in result["prerequisite_issues"]:
    print(f"{unit}: {msg}")
