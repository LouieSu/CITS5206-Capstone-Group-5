import os
import xml.etree.ElementTree as ET

# === Load XML files ===
base_dir = os.path.dirname(os.path.abspath(__file__))
ruleset_tree = ET.parse(os.path.join(base_dir, '../../config/ruleset.xml'))
units_tree = ET.parse(os.path.join(base_dir, '../../config/units.xml'))

ruleset_root = ruleset_tree.getroot()
units_root = units_tree.getroot()

# === Select MDS-2025 ruleset ===
target_ruleset = None
for rs in ruleset_root.findall(".//ruleset"):
    if rs.findtext("code") == "MDS-2025":
        target_ruleset = rs
        break

if target_ruleset is None:
    raise ValueError("MDS-2025 ruleset not found.")

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

# === Load unit points ===
unit_points = {}
for unit in units_root.findall(".//unit"):
    code = unit.findtext("code")
    point = int(unit.findtext("point", "6"))
    unit_points[code] = point

def get_unit_level(unit_code):
    digits = ''.join(filter(str.isdigit, unit_code))
    return int(digits[0]) if digits else None

# === MDS-2025 Suggestion Generator ===
def generate_suggestions_mds2025(student_timetable):
    unit_to_semester = {}
    for i, sem in enumerate(student_timetable):
        for unit in sem:
            if unit:
                unit_to_semester[unit] = i

    suggestions = []

    # ✅ 1. Conversion unit timing
    for unit in conversion_units:
        if unit in unit_to_semester and unit_to_semester[unit] > 1:
            suggestions.append(f"Consider taking {unit} earlier. Conversion units should be completed in your first year.")

    # ✅ 2. Recommend Python programming if missing
    if not any(u in unit_to_semester for u in ["CITS1401", "CITS2401"]):
        suggestions.append("Include a Python programming unit early (e.g., CITS1401) to build data science coding skills.")

    # ✅ 3. Recommend pairing ML with statistics
    if "CITS5508" in unit_to_semester and not any(u in unit_to_semester for u in ["STAT4064", "STAT4066"]):
        suggestions.append("Pair CITS5508 (Machine Learning) with a statistics unit like STAT4064 for a more robust understanding.")

    # ✅ 4. Warn if DATA5001 (Data Wrangling) is too late
    if "DATA5001" in unit_to_semester and unit_to_semester["DATA5001"] > 1:
        suggestions.append("Move DATA5001 (Data Wrangling) earlier to strengthen your foundations for future units.")

    # ✅ 5. capstone
    if "CITS5553" in unit_to_semester:
        suggestions.append("It is recommended to take CITS5553 – Data Science Capstone Project in your final (third or last) semester, as it requires the completion of at least 24 points of Level 4 or Level 5 units and serves as a culminating experience for students enrolled in the 62530 Master of Data Science program.")


    # ✅ 7. Check if Option A units are missing
    option_a_selected = [u for u in unit_to_semester if u in option_a_units]
    if len(option_a_selected) < 2:
        suggestions.append("Add more Option A electives to broaden your technical exposure and meet graduation conditions.")

    # === General Advice (fill to 15) ===
    general = [
        "Explore internships via the UWA Careers Centre from semester 3 onward.",
        "Join the UWA Data Science Club for networking and workshops.",
        "Attend industry events and conferences related to AI and analytics.",
        "Learn cloud data tools like AWS S3, BigQuery, or Azure ML.",
        "Use UWA’s free LinkedIn Learning access to take courses in SQL, Power BI, and TensorFlow."
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
