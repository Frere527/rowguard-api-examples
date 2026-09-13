# Use RowGuard in an n8n import workflow

This recipe keeps the RapidAPI key in an n8n credential and stops the workflow before a database write when the CSV is invalid. Node names and screen labels can vary by n8n version.

1. Create an HTTP header credential for `X-RapidAPI-Key`. Store the subscription key in the credential, not in a Set node or exported workflow JSON.
2. Add an **HTTP Request** node with method `POST` and URL `https://rowguard-csv-validation1.p.rapidapi.com/v1/validate`.
3. Attach the key credential and add `X-RapidAPI-Host: rowguard-csv-validation1.p.rapidapi.com` plus `Content-Type: application/json`.
4. Send a JSON body with `csv`, `schema` and the options your import needs. Start from [`../examples/request.json`](../examples/request.json).
5. Add an **If** node after the request. Continue to the database or SaaS import branch only when the response field `valid` is true.
6. Send the false branch to review or notification. Include `request_id`, `summary` and error codes, but do not copy personal CSV values or the API key into logs or messages.

Use `include_data: false` when the downstream system already has the source file. If you enable it, import `data` only after deciding how partial valid rows should be handled. RowGuard does not write to the destination and duplicate checks apply only inside one request.
