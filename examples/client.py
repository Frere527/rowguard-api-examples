"""Python 3.10+, standard library only. Set the three environment variables below."""
import json
import os
import urllib.request
import urllib.error
from pathlib import Path

payload = json.loads(Path(__file__).with_name('request.json').read_text(encoding='utf-8'))
base = os.environ['RAPIDAPI_BASE_URL'].rstrip('/')
if not base.startswith('https://'):
    raise ValueError('Use the HTTPS marketplace URL')
request = urllib.request.Request(base + '/v1/validate', data=json.dumps(payload).encode('utf-8'), headers={
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': os.environ['RAPIDAPI_KEY'],
    'X-RapidAPI-Host': os.environ['RAPIDAPI_HOST'],
}, method='POST')
try:
    with urllib.request.urlopen(request, timeout=15) as response:
        result = json.load(response)
except urllib.error.HTTPError as error:
    print(f'HTTP {error.code}; Retry-After: {error.headers.get("Retry-After", "n/a")}')
    raise SystemExit(1)
print(json.dumps(result, indent=2))
if not result['valid']:
    print('Review the error report before importing. Partial valid rows are optional, not automatic writes.')
