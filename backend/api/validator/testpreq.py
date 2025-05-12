from availability_and_prereq_checker import validate_study_plan

# Define a sample plan that triggers both availability and prerequisite errors
plan = [
    ["CITS1003", "CITS1401", "CITS1402", "PHIL4100"],  # 25S2
    ["CITS2005", "CITS5505", "CITS4401", "CITS5508"]   # 26S1  # Should be fine if prereqs met
]
starting_semester = "25S2"
result = validate_study_plan(plan, starting_semester)

# Print results
print("Availability Issues:")
for issue in result["availability"]:
    print(f" - {issue['unit']} not offered in {issue['semester']}")

print("\nPrerequisite Issues:")
for unit, issue in result["prerequisite_issues"]:
    print(f" - {unit}: {issue}")
