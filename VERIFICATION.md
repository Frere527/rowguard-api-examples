# Verification

Checked locally on 2026-09-12:

- `npm run check`: passed; validates the request fixture, JavaScript syntax, required URLs and absence of key-shaped strings.
- `python -m py_compile examples/client.py`: passed with Python 3.
- `sh -n examples/curl.sh`: not executed because this Windows host has no POSIX shell. The script is short, uses `set -eu`, quotes every environment value, sets a 15-second curl timeout and is forced to LF on checkout by `.gitattributes`.

No request was sent from this repository because doing so requires a consumer subscription key. Provider tests are recorded separately and do not count as customer activity.
