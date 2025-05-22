import os
import xml.etree.ElementTree as ET

# Load XML files
base_dir = os.path.dirname(os.path.abspath(__file__))
ruleset_tree = ET.parse(os.path.join(base_dir, '../../config/ruleset.xml'))
units_tree = ET.parse(os.path.join(base_dir, '../../config/units.xml'))

ruleset_root = ruleset_tree.getroot()
units_root = units_tree.getroot()

# Parse ruleset
target_ruleset = None
for rs in ruleset_root.findall(".//ruleset"):
    if rs.findtext("code") == "MIT-2024":
        target_ruleset = rs
        break

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

# ✅ Pure function to generate suggestions (NO Flask)
def generate_suggestions_mit2024(student_timetable):
    unit_to_semester = {}
    for i, sem in enumerate(student_timetable):
        for unit in sem:
            if unit:
                unit_to_semester[unit] = i

    suggestions = []
    
    for unit in conversion_units:
        if unit in unit_to_semester and unit_to_semester[unit] > 1:
            suggestions.append(f"Consider taking {unit} earlier. Conversion units are better completed in your first year.")
    # Targeted suggestions
    if "CITS5508" not in unit_to_semester:
        suggestions.append("CITS5508 (Machine Learning) is great for a career in data science or AI roles.")

    for unit in conversion_units:
        if unit in unit_to_semester and unit_to_semester[unit] > 1:
            suggestions.append(f"Consider taking {unit} earlier. Conversion units are better completed in your first year.")

    if "CITS5206" in unit_to_semester and "CITS5017" not in unit_to_semester:
        suggestions.append("CITS5017 (Deep Learning) builds on Machine Learning and strengthens your AI track.")
    
    if "CITS5206" in unit_to_semester:
        suggestions.append("It is recommended to take CITS5206 – Information Technology Capstone Project in your final semester, as it requires successful completion of 48 points of Level 4 and Level 5 MIT units. This unit serves as a capstone experience to consolidate your learning and demonstrate your practical skills before graduation")


    if "CITS5505" in unit_to_semester and unit_to_semester["CITS5505"] > 3:
        suggestions.append("Take CITS5505 (Agile Web Development) earlier to apply agile skills in later units.")

    if "PHIL4100" in unit_to_semester and unit_to_semester["PHIL4100"] < 3:
        suggestions.append("PHIL4100 (Ethics) is best taken in the final year when you can reflect critically.")

    if "CITS5206" in unit_to_semester and unit_to_semester["CITS5206"] < 4:
        suggestions.append("CITS5206 (Capstone) should be in your final year to reflect your full learning journey.")

    # General tips (fill to 15 suggestions)
    general = [
        "Apply for internships by semester 3 to gain industry experience before graduating.",
        "Join clubs like UWA AI Society or Data Science Club to build connections.",
        "Attend UWA tech meetups and industry events for networking and exposure.",
        "Use UWA’s LinkedIn Learning access for free certifications in Python, AI, and cloud.",
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
