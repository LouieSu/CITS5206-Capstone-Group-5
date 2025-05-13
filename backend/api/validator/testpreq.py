from availability_and_prereq_checker import validate_study_plan

plan = [
    ["CITS2005", "CITS5505", "CITS4401", "CITS5508"],   # intended 25S1
    ["CITS1003", "CITS1401", "CITS1402", "PHIL4100"]    # intended 25S2
]
starting_semester = "25S2"


result = validate_study_plan(plan, starting_semester)

print("Availability Issues:")
for issue in result["availability"]:
    print(f" - {issue['unit']} not offered in {issue['semester']}")

print("\nPrerequisite Issues:")
for unit, issue in result["prerequisite_issues"]:
    print(f" - {unit}: {issue}")
