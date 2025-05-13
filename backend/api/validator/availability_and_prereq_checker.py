import xml.etree.ElementTree as ET
import os

# Load XML
base_dir = os.path.dirname(os.path.abspath(__file__))
units_tree = ET.parse(os.path.join(base_dir, '../../config/units.xml'))
units_root = units_tree.getroot()

unit_availability = {}
unit_prereqs = {}

def resolve_condition_group(root, group_code, seen=None):
    if seen is None:
        seen = set()
    if group_code in seen:
        return set()
    seen.add(group_code)

    group = next((g for g in root.findall(".//conditionGroup") if g.findtext("code") == group_code), None)
    if group is None:
        return set()

    resolved = set()
    for condition in group.findall(".//condition"):
        if condition.attrib.get("ref"):
            resolved.update(resolve_condition_group(root, condition.attrib["ref"], seen))
        elif condition.findtext("type") == "Unit":
            resolved.add(condition.findtext("unit").strip())

    for nested_group in group.findall(".//conditionGroup"):
        ref = nested_group.attrib.get("ref")
        if ref:
            resolved.update(resolve_condition_group(root, ref, seen))
    return resolved

# Load unit metadata
for unit in units_root.findall(".//unit"):
    code = unit.findtext("code")
    availability = unit.findtext("availability", default="")
    unit_availability[code] = availability

    prereqs = set()
    for prereq_group in unit.findall(".//prerequisites"):
        for cond_group in prereq_group.findall("conditionGroup"):
            ref = cond_group.attrib.get("ref")
            if ref:
                prereqs.update(resolve_condition_group(units_root, ref))
        for condition in prereq_group.findall("condition"):
            if condition.findtext("type") == "Unit":
                prereqs.add(condition.findtext("unit"))
    unit_prereqs[code] = list(prereqs)

# Helper functions
def generate_semester_labels_fixed_year(starting_semester, num_semesters):
    year = starting_semester[:2]  # e.g., "24"
    start_sem = starting_semester[-2:].upper()  # "S1" or "S2"
    sem_cycle = ["S1", "S2"]
    start_index = sem_cycle.index(start_sem)

    labels = []
    for i in range(num_semesters):
        current_index = (start_index + i) % 2
        label = f"{year}{sem_cycle[current_index]}"
        labels.append(label)
    return labels


def check_unit_availability(unit_code, semester_label):
    offered = unit_availability.get(unit_code, "")
    return semester_label in [s.strip() for s in offered.split(",")]

def check_prerequisites(unit_plan):
    errors = []
    unit_to_sem = {}
    for sem_index, sem_units in enumerate(unit_plan):
        for unit in sem_units:
            unit_to_sem[unit] = sem_index

    for unit, current_sem in unit_to_sem.items():
        for prereq in unit_prereqs.get(unit, []):
            prereq_sem = unit_to_sem.get(prereq)
            if prereq_sem is None:
                errors.append((unit, f"Missing prerequisite: {prereq}"))
            elif prereq_sem >= current_sem:
                errors.append((unit, f"Prerequisite {prereq} is scheduled in same/later semester"))
    return errors

# ✅ Function you can use like an API
def validate_study_plan(plan, starting_semester):
    semester_labels = generate_semester_labels_fixed_year(starting_semester, len(plan))
    availability_results = []
    for i, sem_units in enumerate(plan):
        for unit in sem_units:
            label = semester_labels[i]
            available = check_unit_availability(unit, label)
            if not available:  # Only include if not available
                availability_results.append({
                    "unit": unit,
                    "semester": label,
                    "available": False
                })
    prereq_issues = check_prerequisites(plan)
    return {
        "availability": availability_results,
        "prerequisite_issues": prereq_issues
    }

