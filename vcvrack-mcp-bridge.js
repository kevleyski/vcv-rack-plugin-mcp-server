#!/usr/bin/env node
/**
 * stdio-to-HTTP MCP bridge for VCV Rack
 * Forwards JSON-RPC messages from Claude Desktop (stdio) to your HTTP MCP server.
 * 
 * Place this file somewhere permanent, e.g.:
 *   ~/Library/Application Support/Claude/vcvrack-mcp-bridge.js
 */

const http = require("http");

const TARGET_URL = "http://127.0.0.1:2600/mcp";

function postToServer(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(TARGET_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${raw}`));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Read newline-delimited JSON from stdin, forward to HTTP, write response to stdout
let buffer = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep incomplete last line

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let message;
    try {
      message = JSON.parse(trimmed);
    } catch {
      process.stderr.write(`[bridge] Failed to parse stdin: ${trimmed}\n`);
      continue;
    }

    try {
      const response = await postToServer(message);
      process.stdout.write(JSON.stringify(response) + "\n");
    } catch (err) {
      process.stderr.write(`[bridge] HTTP error: ${err.message}\n`);

      // Return a JSON-RPC error so Claude Desktop doesn't hang
      const errResponse = {
        jsonrpc: "2.0",
        id: message.id ?? null,
        error: {
          code: -32603,
          message: `Bridge error: ${err.message}`,
        },
      };
      process.stdout.write(JSON.stringify(errResponse) + "\n");
    }
  }
});

process.stdin.on("end", () => process.exit(0));
