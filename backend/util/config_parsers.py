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
        return self._parse_sections(ruleset)
    
    def get_specialisations(self, ruleset):
        return self._parse_sections(ruleset, specilisation=True)

    def _parse_sections(self, ruleset, specilisation=False):
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
                    "units": section.find("units").text.split(",") if section.find("units") is not None else [],
                    "conditions": self._get_conditions(section),
                }
        return sections

    def _get_conditions(self, section):
        conditions = section.find("conditions")
        return ConditionParser(conditions).get_conditions()
            

class UnitParser(XmlParser):

    def __init__(self, file_path):
        super().__init__(file_path)
        self.reference = {}

    def get_units(self):
        """
        Extract all units
        """
        if self.root is not None:

            # parse pre-defined conditions and condition groups
            self._enrich_reference()
            self._enrich_reference(key="conditionGroups", sub_key="conditionGroup")

            # parse units
            units = []
            unit_nodes = self.root.findall("unit")
            for node in unit_nodes:
                units.append(self._parse_unit(node))
            return units

    def _parse_unit(self, node):
        if node is not None:
            unit = {
                "code": node.find("code").text,
                "name": node.find("name").text,
                "points": int(node.find("points").text.strip()) if node.find("points") is not None else 0,
                "availability": node.find("availability").text.split(",") if node.find("availability") is not None else [],
                "incompability": node.find("incompability").text.split(",") if node.find("incompability") is not None else [],
            }
            pre_node = node.find("prerequisites")
            if pre_node is not None:
                cons = ConditionParser(pre_node, reference_dict=self.reference).get_conditions()
                unit["conditions"]= cons
            return unit


    def _enrich_reference(self, key="conditions", sub_key="condition"):
        nodes = self.root.findall(key)
        if nodes is not None:
            for node in nodes:
                sub_nodes = node.findall(sub_key)
                ConditionParser(sub_nodes, self.reference, ref_mode=True).get_conditions()



class ConditionParser:

    # ref_mode will enables real time referencing, and will add every 
    # first-class condition/conditionGroup parsed into reference_dict in real time.
    def __init__(self, nodes, reference_dict=None, ref_mode=False):
        self.ref_mode = ref_mode
        if nodes is not None:
            self.nodes = list(nodes)
        else:
            self.nodes = []
        if reference_dict is not None:
            self.reference_dict = reference_dict
            self.reference = True
        else:
            self.reference = False
            self.reference_dict = None
        
        if ref_mode and not self.reference:
            # enters self referencing mode. self referencing mode has no affect outside the scope
            # only have affect during the life of this ConditionParser.
            self.reference_dict = {}
            self.reference = True
            

    def get_conditions(self):
        conditions = []
        for node in self.nodes:
            condition = None
            if node.tag == 'condition':
                condition = self._parse_condition(node)
            if node.tag == 'conditionGroup':
                condition = self._parse_condition_group(node)
            if self.ref_mode and "code" in condition:
                self.reference_dict[condition["code"]] = condition
            conditions.append(condition)
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
        _code = node.find("code")
        if _code is not None:
            condition["code"] = _code.text

        # type can be: UnitPoint/LevelPoint/UnitNumber/Unit/TotalPoint/Programme/LevelNumber

        if _type == "UnitPoint":
            condition["points"] = int(node.find("points").text.strip()) if node.find("points") is not None else 0
            condition["units"] = node.find("units").text.split(",") if node.find("units") is not None else [],
        elif _type == "LevelPoint":
            condition["points"] = int(node.find("points").text.strip()) if node.find("points") is not None else 0
            condition["level"] = node.find("level").text
        elif _type == "Programme":
            condition["programme"] = node.find("programme").text.strip() if node.find("programme") is not None else ""
        elif _type == "Unit":
            condition["unit"] = node.find("unit").text
        elif _type == "TotalPoint":
            condition["points"] = int(node.find("points").text.strip()) if node.find("points") is not None else 0
        elif _type == "UnitNumber":
            condition["number"] = int(node.find("number").text.strip()) if node.find("number") is not None else 0
            condition["units"] = node.find("units").text.split(",") if node.find("units") is not None else [],
        elif _type == "LevelNumber":
            condition["number"] = int(node.find("number").text.strip()) if node.find("number") is not None else 0
            condition["level"] = node.find("level").text

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
        _code = node.find("code")
        if _code is not None:
            group["code"] = _code.text
        conditions = node.find("conditions")
        if conditions is not None:
            group['conditions'] = ConditionParser(conditions, self.reference_dict).get_conditions()
        return group




if __name__ == "__main__":
    # file_path = Path(__file__).resolve().parent.parent / "config" / "ruleset.xml"
    # parser = RulesetParser(file_path)
    # parser.load_xml()
    #
    # # Example: Get programmes
    # programmes = parser.get_programmes()
    # print("Programmes:", programmes)
    #
    # # Example: Get rulesets
    # rulesets = parser.get_rulesets()
    # print("Rulesets:", rulesets)

    file_path = Path(__file__).resolve().parent.parent / "config" / "units.xml"
    parser = UnitParser(file_path)
    parser.load_xml()

    units = parser.get_units()
    print(units)