import xml.etree.ElementTree as ET
import pandas as pd

# Load XML files
ruleset_tree = ET.parse(r"C:\Users\hp\CITS5206-Capstone-Group-5\CITS5206-Capstone-Group-5\backend\config\ruleset.xml")
units_tree = ET.parse(r"C:\Users\hp\CITS5206-Capstone-Group-5\CITS5206-Capstone-Group-5\backend\config\units.xml")

ruleset_root = ruleset_tree.getroot()
units_root = units_tree.getroot()

# Build maps from units.xml
unit_prereqs = {}
unit_offered = {}
unit_levels = {}
unit_points = {}

for unit in units_root.findall(".//Unit"):
    code = unit.attrib.get("code")
    prereqs = [prereq.text.strip() for prereq in unit.findall(".//Prerequisite")]
    availability = unit.attrib.get("availability", "")
    level = unit.attrib.get("level", "")
    points = int(unit.attrib.get("points", "6"))
    unit_prereqs[code] = prereqs
    unit_offered[code] = availability
    unit_levels[code] = level
    unit_points[code] = points


# ✅ Make it a reusable function
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

    # Step 1: Find MDS-2024 ruleset
    target_ruleset = None
    for rs in ruleset_root.findall(".//ruleset"):
        if rs.findtext("code") == "MDS-2024":
            target_ruleset = rs
            break

    if target_ruleset is None:
        raise ValueError("MDS-2024 ruleset not found.")

    # Step 2: Extract unit lists from MDS-2024
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

    # Option A check
    taken_option_a = [u for u in unit_to_semester if u in option_a_units]
    total_points_option_a = sum(unit_points.get(u, 6) for u in taken_option_a)

    def get_unit_level(unit_code):
        level_str = unit_levels.get(unit_code, "")
        if level_str:
            return int(level_str)
        digits = ''.join(filter(str.isdigit, unit_code))
        return int(digits[0]) if digits else None

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
    missing_conversion = [u for u in conversion_units if u not in unit_to_semester]

    for unit in missing_core:
        validation_results.append(("Core", f"Missing core unit: {unit}"))
    for unit in missing_conversion:
        validation_results.append(("Conversion", f"Missing conversion unit: {unit}"))

    # ✅ Return validation result 
    if not validation_results:
        return {
            "valid": True,
            "issues": [],
            "message": "✅ No validation issues found. Timetable satisfies all rules in MDS2025 Handbook."
        }
    else:
        return {
            "valid": False,
            "issues": validation_results
        }

