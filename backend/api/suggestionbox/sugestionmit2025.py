import os
import xml.etree.ElementTree as ET

# Load XML files
base_dir = os.path.dirname(os.path.abspath(__file__))
ruleset_tree = ET.parse(os.path.join(base_dir, '../../config/ruleset.xml'))
units_tree = ET.parse(os.path.join(base_dir, '../../config/units.xml'))

ruleset_root = ruleset_tree.getroot()
units_root = units_tree.getroot()

# Parse MIT-2025 ruleset
target_ruleset = None
for rs in ruleset_root.findall(".//ruleset"):
    if rs.findtext("code") == "MIT-2025":  # CHANGED for MIT-2025
        target_ruleset = rs
        break

if target_ruleset is None:
    raise ValueError("MIT-2025 ruleset not found.")

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

# Load unit points
unit_points = {}
for unit in units_root.findall(".//unit"):
    code = unit.findtext("code")
    point = int(unit.findtext("point", "6"))
    unit_points[code] = point

def get_unit_level(unit_code):
    digits = ''.join(filter(str.isdigit, unit_code))
    return int(digits[0]) if digits else None

# ✅ Pure suggestion function for MIT-2025
def generate_suggestions_mit2025(student_timetable):
    unit_to_semester = {}
    for i, sem in enumerate(student_timetable):
        for unit in sem:
            if unit:
                unit_to_semester[unit] = i

    suggestions = []

    # Conversion unit timing advice
    for unit in conversion_units:
        if unit in unit_to_semester and unit_to_semester[unit] > 1:
            suggestions.append(f"Consider taking {unit} earlier. Conversion units are better completed in your first year.")

    # Targeted suggestions
    if "CITS5508" not in unit_to_semester:
        suggestions.append("CITS5508 (Machine Learning) is great for a career in data science or AI roles.")

    if "CITS5508" in unit_to_semester and "CITS5017" not in unit_to_semester:
        suggestions.append("CITS5017 (Deep Learning) builds on Machine Learning and strengthens your AI track.")

    if "CITS5505" in unit_to_semester and unit_to_semester["CITS5505"] > 3:
        suggestions.append("Take CITS5505 (Agile Web Development) earlier to apply agile skills in later units.")

    if "PHIL4100" in unit_to_semester and unit_to_semester["PHIL4100"] < 3:
        suggestions.append("PHIL4100 (Ethics) is best taken in the final year when you can reflect critically.")

    if "CITS5206" in unit_to_semester and unit_to_semester["CITS5206"] < 3:
        suggestions.append("CITS5206 (Capstone) should be in your final year to reflect your full learning journey.")

    # General suggestions (to reach 15)
    general = [
        "Start a GitHub portfolio with your project code. Employers value real examples.",
        "Apply for internships by semester 3 to gain industry experience before graduating.",
        "Join clubs like UWA AI Society or Data Science Club to build connections.",
        "Attend UWA tech meetups and industry events for networking and exposure.",
        "Use UWA’s LinkedIn Learning access for free certifications in Python, AI, and cloud.",
        "Review your plan with a course adviser each year to ensure compliance and balance.",
        "Always keep a list of backup electives in case your preferred units are unavailable."
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
