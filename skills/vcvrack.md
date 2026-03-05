# VCV Rack — AI Patch Builder

Control VCV Rack 2 programmatically using `skills/vcvrack_client.py`.

```text
python skills/vcvrack_client.py [--port PORT] <command> [args...]
```

Default port: **2600**. Pass `--port XXXX` if the user configured a different one.

## Before You Start

Check the server is reachable:

```bash
python skills/vcvrack_client.py status
```

Expected response:

```json
{
  "ok": true,
  "data": {
    "server": "VCV Rack MCP Bridge",
    "version": "1.0.0",
    "sampleRate": 44100.0,
    "moduleCount": 3
  }
}
```

If this fails, ask the user to:

1. Open VCV Rack 2
2. Add the **MCP Server** module (search "MCP Server" in the module browser)
3. Click **ON/OFF** until the green STATUS LED lights up

---

## Concepts: Signal Chains & Wiring

In VCV Rack, **modules do nothing on their own**. You must connect them with **virtual cables** to form a **signal chain**.

1.  **Source:** A module that generates a signal (e.g., `VCO` for sound, `LFO` for modulation).
2.  **Processor:** A module that modifies a signal (e.g., `VCF` for filtering, `VCA` for volume).
3.  **Sink:** A module that consumes a signal or sends it to the real world (e.g., `Audio Interface`).

### Audio Interface Configuration (IMPORTANT)

**The MCP Server cannot automatically configure the "Audio Interface" module's driver or device.**

- **Agent Responsibility:** Automatically add the `AudioInterface2` module (from the `Core` plugin) and connect the final output of your signal chain to its inputs (usually 0 for L and 1 for R).
- **User Responsibility:** Once the module is added, the user **MUST** manually click the module in VCV Rack to select their preferred **Audio Driver** (e.g., Core Audio, ASIO, JACK) and **Device** (e.g., Built-in Output, Focusrite USB).
- **Check for existing:** Before adding a new audio module, use `modules` to see if one is already present. If so, use its `id` instead of adding a new one.

**Other modules (VCO, VCF, VCA, etc.) should be managed totally automatically by the agent.**

---

## Command Reference

### status — Server health check
... (rest of status) ...

### add — Add a module to the patch

```bash
# Auto-placed next to the last added module and centered in view
python skills/vcvrack_client.py add <plugin_slug> <module_slug>

# At specific grid position
python skills/vcvrack_client.py add <plugin_slug> <module_slug> <x> <y>
```

Response:

```json
{ "ok": true, "data": { "id": 42, "plugin": "VCV", "slug": "VCO-1", "x": 0, "y": 0 } }
```

> **Save the returned `id`** — you need it for params and cables.
> **Note:** The server automatically scrolls the Rack view to center newly added modules.

... (rest of commands) ...

### connect — Connect two ports (Create a Cable)

```bash
python skills/vcvrack_client.py connect <out_mod_id> <out_port_id> <in_mod_id> <in_port_id>
```

Response:

```json
{ "ok": true, "data": { "id": 7 } }
```

> **CRITICAL:** Use `module <id>` to find the correct `outputs` (source) and `inputs` (destination) IDs. Wires are the "glue" that makes the patch work.

... (rest of file) ...

---

## Standard Workflow: The "Patch Building" Loop

Building a patch is an iterative process of adding, configuring, and **wiring**:

```
status → library → add → module → connect → set-param → save
```

1.  **`status`** — Confirm server is alive.
2.  **`library`** — Find exact plugin + module slugs.
3.  **`add`** — Place modules in the rack. They will appear to the right of the Server module and be centered in your view.
4.  **`module <id>`** — **Discovery Phase.** List the available inputs, outputs, and parameters.
5.  **`connect`** — **Wiring Phase.** Link an `output` of one module to the `input` of another. (e.g., VCO Sine Out -> Audio In).
6.  **`set-param`** — **Tuning Phase.** Adjust knobs to get the desired sound.
7.  **`save`** — Persist your creation.


---

## Examples

See the `skills/examples/` folder for ready-to-run walkthroughs:

| File | Patch |
|------|-------|
| `examples/01_vco_to_audio.md` | VCO → Audio out (minimal test tone) |
| `examples/02_vco_vcf_vca.md` | VCO → VCF → VCA → Audio (classic subtractive voice) |
| `examples/03_lfo_modulation.md` | LFO modulating VCF cutoff |
