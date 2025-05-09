import xml.etree.ElementTree as ET
import pandas as pd
import os

# Load XML files
base_dir = os.path.dirname(os.path.abspath(__file__))
ruleset_tree = ET.parse(os.path.join(base_dir, '../../config/ruleset.xml'))
units_tree = ET.parse(os.path.join(base_dir, '../../config/units.xml'))

ruleset_root = ruleset_tree.getroot()
units_root = units_tree.getroot()

# Build maps from units.xml
unit_prereqs = {}
unit_offered = {}
unit_levels = {}
unit_points = {}
# Map conditionGroup codes to their conditions
condition_group_map = {}

for group in units_root.findall(".//conditionGroup"):
    group_code = group.findtext("code")
    if group_code:
        # Extract all <unit> codes from nested conditions
        units = set()
        for unit_elem in group.findall(".//unit"):
            units.add(unit_elem.text.strip())
        condition_group_map[group_code] = units


for unit in units_root.findall(".//Unit"):
    code = unit.attrib.get("code")
    prereqs = set()
    for prereq_group in unit.findall(".//prerequisites"):
        for cond_group in prereq_group.findall("conditionGroup"):
            ref = cond_group.attrib.get("ref")
            if ref and ref in condition_group_map:
                prereqs.update(condition_group_map[ref])
    unit_prereqs[code] = list(prereqs)

    availability = unit.attrib.get("availability", "")
    level = unit.attrib.get("level", "")
    points = int(unit.attrib.get("points", "6"))
    unit_offered[code] = availability
    unit_levels[code] = level
    unit_points[code] = points

# Extract MIT-2024 ruleset
target_ruleset = None
for rs in ruleset_root.findall(".//ruleset"):
    if rs.findtext("code") == "MIT-2024":
        target_ruleset = rs
        break

if target_ruleset is None:
    raise ValueError("MIT-2024 ruleset not found.")

def extract_required_units(section_code):
    return {
        code.strip()
        for section in target_ruleset.findall(".//section")
        if section.findtext("code") == section_code
        for code in section.findtext("units", "").split(",")
    }

conversion_units = extract_required_units("conversion")
core_units = extract_required_units("core")
option_a_units = extract_required_units("optionA")

def get_unit_level(unit_code):
    digits = ''.join(filter(str.isdigit, unit_code))
    return int(digits[0]) if digits else None

# ✅ MAIN VALIDATOR FUNCTION
def validate(student_timetable):
    unit_to_semester = {}
    for sem_index, semester in enumerate(student_timetable):
        for unit in semester:
            if unit:
                unit_to_semester[unit] = sem_index

    validation_results = []

    # Prerequisite check
    for unit, semester in unit_to_semester.items():
        for prereq in unit_prereqs.get(unit, []):
            prereq_sem = unit_to_semester.get(prereq)
            if prereq_sem is None:
                validation_results.append((unit, f"Missing prerequisite: {prereq}"))
            elif prereq_sem >= semester:
                validation_results.append((unit, f"Prerequisite {prereq} taken in same/later semester"))

    # Option A check
    taken_option_a = [u for u in unit_to_semester if u in option_a_units]
    total_points_option_a = sum(unit_points.get(u, 6) for u in taken_option_a)
    level_5_points = sum(unit_points.get(u, 6) for u in taken_option_a if get_unit_level(u) == 5)

    if total_points_option_a < 24:
        validation_results.append(("Option A", f"Only {total_points_option_a} points taken, need 24"))
    if level_5_points < 12:
        validation_results.append(("Option A", f"Only {level_5_points} points at level 5, need 12"))

    # Graduation total
    all_units = [u for sem in student_timetable for u in sem if u]
    total_credits = sum(unit_points.get(u, 6) for u in all_units)
    if total_credits < 96:
        validation_results.append(("Graduation", f"Only {total_credits} credit points completed, need 96"))

    # Core and Conversion validation
    missing_core = [u for u in core_units if u not in unit_to_semester]
    
    for unit in missing_core:
        validation_results.append(("Core", f"Missing core unit: {unit}"))

    conversion_section = None
    for section in target_ruleset.findall(".//section"):
        if section.findtext("code") == "conversion":
            conversion_section = section
            break
    if conversion_section is not None:
        taken_units = set(unit_to_semester.keys())
        conversion_conditions = conversion_section.findall(".//condition")

    for cond in conversion_conditions:
        cond_type = cond.findtext("type")
        cond_points = int(cond.findtext("points"))
        cond_units = [u.strip() for u in cond.findtext("units").split(",")]

        matched = taken_units.intersection(cond_units)
        earned_points = sum(unit_points.get(u, 6) for u in matched)

        if earned_points < cond_points:
            validation_results.append((
                    "Conversion",
                    f"Only {earned_points} points from {cond_units}, need {cond_points}"
                ))
        elif earned_points > cond_points:
            validation_results.append((
                    "Conversion",
                f"{earned_points} points taken from {cond_units}, but only {cond_points} allowed"
                 ))  
   

    if not validation_results:
        return {
            "valid": True,
            "issues": [],
            "message": "✅ No validation issues found. Timetable satisfies all rules in MIT2024 Handbook."
        }
    else:
        return {
            "valid": False,
            "issues": validation_results
        }

