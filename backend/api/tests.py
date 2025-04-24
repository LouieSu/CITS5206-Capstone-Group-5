from django.test import TestCase

# Create your tests here.
from validator.mds2025 import validate  # adjust import path as needed

# Sample test timetable
test_timetable = [
    ["STAT2401", "STAT2402", "CITS1401", "CITS4012"],
    ["BUSN5003", "CITS1402", "CITS5508", "CITS5504"],
    ["CITS5505", "CITS5506", "STAT4064", "CITS5553"],
    ["STAT4066", "CITS5507", "CITS4407", "CITS4009"]
]

result = validate(test_timetable)
print(result)

from validator.mds2024 import validate  # adjust path as needed

test_timetable = [
    ["STAT1400", "STAT1520", "STAT2401", "STAT2402"],
    ["STAT3064", "STAT3066", "STAT3404", "STAT4064"],
    ["STAT4066", "STAT4401", "STAT4502", "STAT4503"],
    ["CITS4407", "STAT4065", "STAT4404", "STAT3405"]
]

result = validate(test_timetable)
print(result)

from validator.mit2025 import validate  # adjust path as needed

test_timetable = [
    ["CITS1003", "CITS1401", "CITS1402", "PHIL4100"],
    ["CITS2002", "CITS2005", "CITS2401", "INMT5526"],
    ["CITS4401", "CITS5505", "CITS5506", "CITS5508"],
    ["CITS5206", "CITS5507", "CITS5501", "CITS5503"]
]

result = validate(test_timetable)
print(result)

from validator.mit2024 import validate  # adjust path as needed

test_timetable = [
    ["CITS1003", "CITS1401", "CITS1402", "CITS2002"],
    ["CITS2005", "CITS4401", "CITS5206", "CITS5505"],
    ["CITS5506", "GENG5505", "CITS5501", "CITS5503"],
    ["INMT5526", "CITS5508", "CITS5507", "CITS4404"]
]

result = validate(test_timetable)
print(result)
