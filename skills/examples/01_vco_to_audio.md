# Example 01 — VCO → Audio Out

Minimal patch: a single oscillator routed to the audio interface.
Good as a first test to confirm the server is working end-to-end.

## Steps

### 1. Confirm server is alive

```bash
python skills/vcvrack_client.py status
```

### 2. Find the correct slugs

```bash
python skills/vcvrack_client.py library VCV
```

Look for `VCO-1` and `AudioInterface2` in the output.

### 3. Add modules

```bash
python skills/vcvrack_client.py add VCV VCO-1
# → note returned id, e.g. 42

python skills/vcvrack_client.py add VCV AudioInterface2
# → note returned id, e.g. 99
```

### 4. Inspect ports

```bash
python skills/vcvrack_client.py module 42
# outputs: 0=SIN, 1=TRI, 2=SAW, 3=SQR, 4=VCO (mix)

python skills/vcvrack_client.py module 99
# inputs: 0=L, 1=R
```

### 5. Set VCO frequency (param 0 = FREQ, unit = semitones from A4)

```bash
# 0.0 = A4 (440 Hz)
python skills/vcvrack_client.py set-param 42 0 0.0
```

### 6. Connect VCO SIN output → Audio L input

```bash
python skills/vcvrack_client.py connect 42 0 99 0
```

### 7. (Optional) Also connect to R for stereo

```bash
python skills/vcvrack_client.py connect 42 0 99 1
```

### 8. Save

```bash
python skills/vcvrack_client.py save ~/Documents/Rack2/patches/01_vco_audio.vcv
```

## Result

A sine wave at A4 playing through the audio interface.
