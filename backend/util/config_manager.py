import json
from pathlib import Path
from .config_parsers import RulesetParser, UnitParser
from django.conf import settings


_units = {}
_ruelsets = {}
_default_plans = {}
_conf_loaded = False

_BASE_DIR = Path(settings.BASE_DIR) / "config"


def get_units(unit_code_list):
    global units, _conf_loaded
    if not _conf_loaded:
        load_conf()
    if unit_code_list is None:
        return {}
    return {unit_code: _units[unit_code] for unit_code in unit_code_list if unit_code in _units}


def get_ruleset(rulset_code):
    global _ruelsets, _conf_loaded
    if not _conf_loaded:
        load_conf()
    if rulset_code is None:
        return {}
    if rulset_code in _ruelsets:
        return _ruelsets[rulset_code]
    return {}


def get_default_plan(ruleset, start, specialisation=None):
    global _default_plans, _conf_loaded
    if not _conf_loaded:
        load_conf()
    if ruleset is None or start is None:
        return {}
    key = f"{ruleset}-{start}"
    if specialisation is not None:
        key = f"{key}-{specialisation}"
    if key in _default_plans:
        return _default_plans[key]
    return {}


def _load_default_plan():
    global _default_plans
    try:
        with open(_BASE_DIR / "default_plans.json") as file:
            _default_plans = json.load(file)
    except FileNotFoundError:
        print(f"Error: File not found at {_BASE_DIR / 'default_plans.json'}")
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file: {e}")


def _add_unit(section):
    if 'units' in section:
        units = section['units']
        details = [_units[unit_code] for unit_code in units if unit_code in _units]
        section['units'] = details
        section['unit_codes'] = units


def _enrich_ruleset_units():
    for _, ruleset in _ruelsets.items():
        if 'sections' in ruleset:
            sections = ruleset['sections']
            for _, section in sections.items():
                _add_unit(section)
        if 'specialisations' in ruleset:
            specialisations = ruleset['specialisations']
            for _, specialisation in specialisations.items():
                _add_unit(specialisation)
            

 
def load_conf():

    global _units, _ruelsets, _conf_loaded

    # load units
    unit_parser = UnitParser(_BASE_DIR / "units.xml")
    unit_parser.load_xml()
    _units = unit_parser.get_units()


    # load rulesets
    ruleset_parser = RulesetParser(_BASE_DIR / "ruleset.xml")
    ruleset_parser.load_xml()
    _ruelsets = ruleset_parser.get_rulesets()

    # for rulesets, replace unit codes with detailed unit info
    _enrich_ruleset_units()

    # load default plans
    _load_default_plan()

    _conf_loaded = True

