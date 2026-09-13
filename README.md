# RowGuard CSV Validation API

[![Verify examples](https://github.com/Frere527/rowguard-api-examples/actions/workflows/check.yml/badge.svg)](https://github.com/Frere527/rowguard-api-examples/actions/workflows/check.yml)

Catch missing values, invalid types and duplicate identifiers before importing a CSV into your database. Send the file as text with your schema; receive structured errors and, optionally, the valid rows. The API does not write to your database.

**Live API:** [Subscribe or try RowGuard on RapidAPI](https://rapidapi.com/Frere527/api/rowguard-csv-validation1). The BASIC plan includes 25 requests per month at no subscription charge. Review the current marketplace terms and bandwidth fee before subscribing.

This repository contains dependency-free Python and Node.js clients plus a cURL example. Copy `.env.example` to your preferred local environment manager and replace only `RAPIDAPI_KEY`; never commit the resulting file.

For an automation workflow, follow the [n8n HTTP Request recipe](docs/n8n.md). It keeps the key in a credential and branches on the response's `valid` field before any database write.

Prefer a visual client? Import [`postman/RowGuard.postman_collection.json`](postman/RowGuard.postman_collection.json), set the collection variable `rapidapiKey` locally, and run either the valid or invalid sample. The committed key value is intentionally empty.

You can also browse the [public RowGuard workspace on Postman API Network](https://www.postman.com/dark-shadow-744867/rowguard-csv-validation-api/overview) or read the [published collection documentation](https://documenter.getpostman.com/view/58184962/2sBYAytUGg). Both public resources keep `rapidapiKey` empty; add your own key only in your local Postman variables.

## First successful request

1. Select BASIC, the free plan, and review RapidAPI's subscription terms.
2. Copy your application key from the playground. Keep it in your backend environment as `RAPIDAPI_KEY`.
3. Call `POST https://rowguard-csv-validation1.p.rapidapi.com/v1/validate` with the JSON below.
4. Check `valid` before importing anything. This example returns `valid: true` and two valid rows.

```json
{
  "csv": "sku,email,quantity\nA-1,ana@example.com,3\nB-2,luis@example.com,5",
  "schema": [
    {"name": "sku", "required": true, "unique": true},
    {"name": "email", "type": "email", "required": true},
    {"name": "quantity", "type": "integer", "min": 0}
  ],
  "include_data": true
}
```

The prepared payload is [`examples/request.json`](examples/request.json). The public sample endpoint `GET /v1/example` intentionally contains invalid rows to demonstrate error reporting.

### cURL

```sh
curl --request POST \
  --url 'https://rowguard-csv-validation1.p.rapidapi.com/v1/validate' \
  --header "X-RapidAPI-Key: $RAPIDAPI_KEY" \
  --header 'X-RapidAPI-Host: rowguard-csv-validation1.p.rapidapi.com' \
  --header 'Content-Type: application/json' \
  --data-binary @examples/request.json
```

### Python

The included [`examples/client.py`](examples/client.py) uses only the Python standard library. The `requests` alternative below can be run from the repository root:

```python
import json
import os
import requests

with open("examples/request.json", encoding="utf-8") as file:
    payload = json.load(file)
response = requests.post(
    "https://rowguard-csv-validation1.p.rapidapi.com/v1/validate",
    headers={
        "X-RapidAPI-Key": os.environ["RAPIDAPI_KEY"],
        "X-RapidAPI-Host": "rowguard-csv-validation1.p.rapidapi.com",
    },
    json=payload,
    timeout=15,
)
response.raise_for_status()
report = response.json()
print(report["valid"], report["summary"])
```

### JavaScript (Node.js)

```javascript
import {readFile} from 'node:fs/promises';

const response = await fetch(
  'https://rowguard-csv-validation1.p.rapidapi.com/v1/validate',
  {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'rowguard-csv-validation1.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: await readFile('request.json', 'utf8'),
    signal: AbortSignal.timeout(15000),
  },
);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const report = await response.json();
console.log(report.valid, report.summary);
```

## Plans and quotas

| RapidAPI plan | Monthly price | Requests/month | Requests/minute |
|---|---:|---:|---:|
| BASIC (free) | USD 0 | 25 | 5 |
| PRO | USD 15 | 2,000 | 20 |
| ULTRA | USD 39 | 10,000 | 60 |
| MEGA | USD 99 | 50,000 | 120 |

Request quotas use hard limits: RowGuard does not sell extra request usage beyond them. A request is a call to any listed endpoint. Treat calls returning errors as potentially metered and check the gateway's quota headers.

**Separate RapidAPI bandwidth fee:** the platform includes 10,240 MB per subscription billing cycle and lists USD 0.001 per additional MB. This fee is charged by RapidAPI to the consumer and is separate from RowGuard's request limits and subscription prices. See the live pricing page and [RapidAPI's explanation](https://docs.rapidapi.com/docs/connecting-to-an-api). Use `include_data: false` when you only need a validation report to reduce response size.

## Request options

| Option | Default | Behavior |
|---|---|---|
| `csv` | required | UTF-8 CSV text, including one header record |
| `schema` | required | One definition per expected column |
| `delimiter` | `,` | Comma, semicolon, tab or pipe; choose explicitly |
| `trim` | `true` | Trim surrounding whitespace in headers and cells |
| `allow_extra_columns` | `false` | Accept additional columns when true |
| `formula_policy` | `reject` | `reject` invalidates rows with formula risks; `warn` only warns |
| `include_data` | `false` | Include valid rows as strings |
| `max_errors` | `100` | Return up to 1–200 issues; totals still cover the whole file |

Each schema field accepts `name`, `type`, `required`, `unique`, `enum`, `min`, `max` and `max_length`. Types: `string`, `integer`, `number`, `boolean`, `date`, `email`. The default type is string. Bounds apply to numeric types. Every schema column must exist in the header, even when its values are optional.

Dates use `YYYY-MM-DD`; booleans use `true` or `false`. Numbers use a decimal point with no grouping or exponent; values outside the JavaScript safe integer magnitude are rejected. Email checks cover basic ASCII syntax only, not deliverability.

Limits per request: 1,000 data rows, 50 columns, 256 KiB JSON, 16 KiB CSV record, 4,096 characters per cell and 100 characters per column name. No Excel, PDF, URL fetching, automatic delimiter detection or AI inference. Split larger files, but duplicate checks only apply within each request.

## Understanding the response

- `valid`: true when there are no validation errors. Warnings may still exist.
- `summary`: total, checked, valid and invalid row counts, plus issue counts.
- `errors`: issue code, explanation, logical row, column, physical ending line and severity.
- `errors_truncated`: true when the issue list was capped; counters remain complete.
- `data`: present only with `include_data: true`; contains valid records as `{row, data}`.
- `request_id`: retain this identifier when reporting a problem.

The header is logical row 1; the first data record is row 2. Blank lines are skipped. Embedded newlines can make physical line numbers differ from logical row numbers. A missing or duplicate header prevents row validation.

All occurrences of a duplicate value are invalidated, including its first appearance. `valid: false` is a successful HTTP 200 validation report. It does not mean the HTTP request failed. No partial data is returned for malformed CSV quoting.

## HTTP errors

| Status | Meaning |
|---:|---|
| 400 | Invalid JSON/UTF-8 or interrupted upload |
| 401 | Invalid gateway credentials or missing authenticated identity |
| 413 | Payload, row, column or record limit exceeded |
| 415 | Unsupported content type or encoding |
| 422 | Invalid request schema, malformed CSV or empty input |
| 429 | Monthly quota or request rate exceeded; honor `Retry-After` when present |
| 500 / 503 | Temporary service error; retry with bounded backoff |

The origin returns `{error: {code, message}, request_id}`. RapidAPI and Cloudflare infrastructure errors may use another envelope. Uploads have a 10-second application deadline; the gateway has a 15-second timeout.

## Data handling and limitations

The application processes CSV in memory and does not store files or log cell values, headers, API keys or user identities. Technical logs contain request IDs, route, status, duration and aggregate counts. Cloudflare and RapidAPI process transport and usage metadata under their own policies.

Formula detection is a conservative heuristic, not a complete spreadsheet export sanitizer. In warning mode, returned data may contain formula risks. Keep safe export handling in your own application. Returned strings are not a guarantee of data accuracy or permission to import them.

No contractual uptime SLA is included in the MVP. Contact the provider through this API's RapidAPI discussion/support channel and include a request ID; do not post CSV containing personal data or API keys.
