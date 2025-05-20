import os
import xml.etree.ElementTree as ET

# === Load XML files ===
base_dir = os.path.dirname(os.path.abspath(__file__))
ruleset_tree = ET.parse(os.path.join(base_dir, '../../config/ruleset.xml'))
units_tree = ET.parse(os.path.join(base_dir, '../../config/units.xml'))

ruleset_root = ruleset_tree.getroot()
units_root = units_tree.getroot()

# === Select MDS-2024 ruleset ===
target_ruleset = None
for rs in ruleset_root.findall(".//ruleset"):
    if rs.findtext("code") == "MDS-2024":
        target_ruleset = rs
        break

if target_ruleset is None:
    raise ValueError("MDS-2024 ruleset not found.")

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

# === Load unit attributes ===
unit_points = {}
for unit in units_root.findall(".//unit"):
    code = unit.findtext("code")
    point = int(unit.findtext("point", "6"))
    unit_points[code] = point

def get_unit_level(unit_code):
    digits = ''.join(filter(str.isdigit, unit_code))
    return int(digits[0]) if digits else None

# === Main suggestion function ===
def generate_suggestions_mds2024(student_timetable):
    unit_to_semester = {}
    for i, sem in enumerate(student_timetable):
        for unit in sem:
            if unit:
                unit_to_semester[unit] = i  # map unit to semester index

    suggestions = []

    # ✅ 1. Conversion units taken too late
    for unit in conversion_units:
        if unit in unit_to_semester and unit_to_semester[unit] > 1:
            suggestions.append(f"Consider taking {unit} earlier. Conversion units should be completed in your first year.")

    # ✅ 2. Missing Python programming foundation
    if "CITS1401" not in unit_to_semester and "CITS2401" not in unit_to_semester:
        suggestions.append("Include a Python programming unit early (e.g., CITS1401) to support data analysis tasks.")

    # ✅ 3. Recommend pairing ML with statistics
    if "CITS5508" in unit_to_semester and not any(u in unit_to_semester for u in ["STAT4066", "STAT4064"]):
        suggestions.append("Pair CITS5508 (Machine Learning) with a statistics unit like STAT4064 for better model evaluation skills.")

    # ✅ 4. Data Wrangling unit too late
    if "DATA5001" in unit_to_semester and unit_to_semester["DATA5001"] > 1:
        suggestions.append("Move DATA5001 (Data Wrangling) earlier to build essential data handling skills.")

    # ✅ 5. Project or capstone missing
    if not any("capstone" in u.lower() or "project" in u.lower() for u in unit_to_semester):
        suggestions.append("Include a project or or 3rd capstone unit in your final semester to demonstrate practical experience.")

    # ✅ 6. Too many units in any semester (>3)
    for i, sem in enumerate(student_timetable):
        if len(sem) > 3:
            suggestions.append(f"Semester {i+1} has a heavy load. Consider reducing to 3 units for academic balance.")
            break

    # === General MDS tips (fill to 15) ===
    general = [
        "Practice using real-world datasets from Kaggle or UCI Machine Learning Repository.",
        "Build a portfolio of visualizations and dashboards using Python or Power BI.",
        "Attend UWA Data Science Society events to network with peers and industry speakers.",
        "Start a GitHub repo to document your Jupyter notebooks and class projects.",
        "Learn cloud data tools like AWS, Azure, or GCP, which are widely used in data roles.",
        "Apply for internships by your third semester through UWA Careers Centre.",
        "Use UWA’s LinkedIn Learning access for R, SQL, Tableau, and big data tutorials."
    ]

    for tip in general:
        if len(suggestions) < 15:
            suggestions.append(tip)
        else:
            break

    return {
        "valid": True,
        "suggestion_count": len(suggestions),
        "suggestions": suggestions
    }
