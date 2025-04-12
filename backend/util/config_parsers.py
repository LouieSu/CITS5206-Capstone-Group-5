import xml.etree.ElementTree as ET
from pathlib import Path



class XmlParser:
    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self.tree = None
        self.root = None

    def load_xml(self):
        """
        Load and parse the XML file.
        """
        try:
            self.tree = ET.parse(self.file_path)
            self.root = self.tree.getroot()
        except ET.ParseError as e:
            print(f"Error parsing XML file: {e}")
            self.tree = None
            self.root = None


class RulesetParser(XmlParser):

    def get_programmes(self):
        """
        Extract programme information from the XML.
        """
        programmes = {}
        if self.root is not None:
            for programme in self.root.findall("programme"):
                _code = programme.find("code").text
                programmes[_code] = {
                    "code": _code,
                    "name": programme.find("name").text
                }
        return programmes

    def get_rulesets(self):
        """
        Extract ruleset information from the XML.
        """
        rulesets = {}
        if self.root is not None:
            for ruleset in self.root.findall("ruleset"):
                _code = ruleset.find("code").text
                rulesets[_code] = {
                    "code": _code,
                    "name": ruleset.find("name").text,
                    "programmeCode": ruleset.find("programmeCode").text,
                    "totalPoints": int(ruleset.find("totalPoints").text),
                    "sections": self.get_sections(ruleset),
                    "specialisations": self.get_specialisations(ruleset),
                }
        return rulesets

    def get_sections(self, ruleset):
        return self._parse_section(ruleset)
    
    def get_specialisations(self, ruleset):
        return self._parse_section(ruleset, specilisation=True)

    def _parse_section(self, ruleset, specilisation=False):
        """
        Extract sections or specialisations from a given ruleset.
        """
        sections = {}
        sections_element = ruleset.find("sections")
        if sections_element is not None:
            for section in sections_element.findall("specialisation" if specilisation else "section"):
                _code = section.find("code").text
                sections[_code] = {
                    "code": _code,
                    "name": section.find("name").text,
                    "description": section.find("description").text.strip() if section.find("description") is not None else "",
                    "units": section.find("units").text.split(", ") if section.find("units") is not None else [],
                    "conditions": self._get_conditions(section),
                }
        return sections

    def _get_conditions(self, section):
        conditions = section.find("conditions")
        return ConditionParser(conditions).get_conditions()
            


class UnitParser(XmlParser):
    pass



class ConditionParser:

    def __init__(self, nodes, reference_dict=None):
        if nodes is not None:
            self.nodes = list(nodes)
        else:
            self.nodes = []
        if reference_dict is not None:
            self.reference_dict = reference_dict
            self.reference = True

    def get_conditions(self):
        conditions = []
        for node in self.nodes:
            if node.tag == 'condition':
                conditions.append(self._parse_condition(node))
            if node.tag == 'conditionGroup':
                conditions.append(self._parse_condition_group(node))
        return conditions

    def _parse_condition(self, node):
        if self.reference:
            _ref = node.get("ref")
            if _ref is not None:
                return self.reference_dict[_ref] if self.reference_dict[_ref] is not None else {}
        
        _type = node.find("type").text
        condition = {
            "group": False,
            "type": _type,
        }
        if _type == "UnitPoint":
            condition["points"] = int(node.find("points").text.strip()) if node.find("points") is not None else 0
            condition["units"] = node.find("units").text.split(", ") if node.find("units") is not None else [],
        elif _type == "LevelPoint":
            condition["points"] = int(node.find("points").text.strip()) if node.find("points") is not None else 0
            condition["level"] = int(node.find("level").text.strip()) if node.find("level") is not None else 0

        return condition

    def _parse_condition_group(self, node):
        if self.reference:
            _ref = node.get("ref")
            if _ref is not None:
                return self.reference_dict[_ref] if self.reference_dict[_ref] is not None else {}
        
        group = {
            "group": True,
            "type": node.find("type").text,
        }
        conditions = node.find("conditions")
        if conditions is not None:
            group['conditions'] = ConditionParser(conditions, self.reference_dict).get_conditions()
        return group




if __name__ == "__main__":
    file_path = Path(__file__).resolve().parent.parent / "config" / "ruleset.xml"
    parser = RulesetParser(file_path)
    parser.load_xml()

    # Example: Get programmes
    programmes = parser.get_programmes()
    print("Programmes:", programmes)

    # Example: Get rulesets
    rulesets = parser.get_rulesets()
    print("Rulesets:", rulesets)