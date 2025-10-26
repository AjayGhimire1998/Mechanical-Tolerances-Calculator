# Mechanical Tolerance Calculator

Calculates international standard specifications and tolerances for bores, round bars, and metallic mechanical units.  
Supports standard engineering fits and tolerance grades such as `H7`, `H8`, `H9`, `h6`, `h8`, `h9`, and `IT5`/`IT6` based on ISO tolerance systems.

---

## Installation

```bash
npm install mechanical-tolerance-calculator
```

---

## Usage

```javascript
// CommonJS
const { calculateTolerance } = require("mechanical-tolerance-calculator");

// ES module
// import { calculateTolerance } from "mechanical-tolerance-calculator";

// Example: Hole tolerance for H7, nominal size 50 mm
const hole = calculateTolerance("H7", 50);
console.log(hole);

// Example: Shaft tolerance for h6, nominal size 50 mm
const shaft = calculateTolerance("h6", 50);
console.log(shaft);
```

---

## API

### `calculateTolerance(designation, nominalSize)`

**Parameters**

- `designation` (`string`) — ISO tolerance designation (e.g. `"H7"`, `"h6"`, `"IT6"`).
- `nominalSize` (`number`) — Nominal dimension in millimetres.

**Returns**

An object with the following shape (example):

```json
{
  "type": "hole" | "shaft",
  "nominal": 50,
  "designation": "H7",
  "ITGrade": 7,
  "upperDeviation": 0.025,
  "lowerDeviation": 0.000,
  "tolerance": 0.025,
  "limits": {
    "maximumMaterialCondition": 50.000,
    "leastMaterialCondition": 50.025
  }
}
```

- `type`: `"hole"` or `"shaft"` inferred from the designation letter (uppercase = hole, lowercase = shaft).
- `ITGrade`: numerical IT grade.
- `upperDeviation` / `lowerDeviation`: deviations in mm.
- `tolerance`: total tolerance (upper - lower).
- `limits`: absolute dimension limits (mm).

---

## Example Output

```json
{
  "type": "hole",
  "nominal": 50,
  "designation": "H7",
  "ITGrade": 7,
  "upperDeviation": 0.025,
  "lowerDeviation": 0.0,
  "tolerance": 0.025,
  "limits": {
    "maximumMaterialCondition": 50.0,
    "leastMaterialCondition": 50.025
  }
}
```

---

## Features

- Compute ISO/ANSI tolerance limits and deviations for common designations.
- Support for both bores (holes) and shafts (round bars).
- Returns IT grade, upper/lower deviations, tolerance range, and absolute limits.
- Lightweight, zero external dependencies.
- Suitable for design tools, validation scripts, CAD/CAM pipelines, and educational purposes.

---

## Reference Standards

- ISO 286-1: Geometrical Product Specifications (GPS) — Limits and Fits
- ANSI B4.2: Preferred Metric Limits and Fits

---

## Examples / Typical Use Cases

- Engineering tolerance calculators and utilities
- Automated checks in CAD/CAM export workflows
- Manufacturing inspection tooling and QA scripts
- Educational examples for mechanical engineering courses

---

## Development

Clone the repository and run the test suite (if provided) or use the module directly after installing.

```bash
git clone <repo-url>
cd mechanical-tolerance-calculator
npm install
npm test
```

---

## Contributing

Contributions and bug reports are welcome. Please open issues or pull requests on the project repository and follow the repository CONTRIBUTING guidelines if present.

---

## Author

Ajay Ghimire

---

## License

MIT © 2025 Ajay Ghimire

---

## Keywords (suggested for package.json)

```
mechanical tolerance, ISO 286, limits and fits, H7, h6, IT5, IT6, bore, shaft, tolerances, engineering
```
