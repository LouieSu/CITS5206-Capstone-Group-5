from pathlib import Path
from .config_parsers import RulesetParser, UnitParser
from django.conf import settings


_units = {}
_ruelsets = {}
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

 
def load_conf():

    global _units, _ruelsets, _conf_loaded

    # load rulesets
    ruleset_parser = RulesetParser(_BASE_DIR / "ruleset.xml")
    ruleset_parser.load_xml()
    _ruelsets = ruleset_parser.get_rulesets()

    # load units
    unit_parser = UnitParser(_BASE_DIR / "units.xml")
    unit_parser.load_xml()
    _units = unit_parser.get_units()

    _conf_loaded = True