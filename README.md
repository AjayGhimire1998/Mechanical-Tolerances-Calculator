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
const { getAllTolerancesFor } = require("mechanical-tolerance-calculator");

// ES module
// import { getAllTolerancesFor } from "mechanical-tolerance-calculator";

// Example: Housing Bore Toelrances
const housingTolerances = getAllTolerancesFor("housing");
console.log(housingTolerances["housingBoresTolerances"]);
```

---

## API

### `getAllTolerancesFor(materialType: String)`

**Parameters**

- `materialType` (`string`) — Type of material to check tolerances for (e.g. `"housing"`, `"shaft"`, `"shell"`).

**Returns**

An object with the following shape (example):

```json
{
  "type": "housing bore" | "shaft" | "shell bore",
  "specifications": {
     "H6": [
      {
        "minimum_diameter": 0,
        "maximum_diameter": 3,
        "upper_deviation": 0.006,
        "lower_deviation": 0,
        "IT6": 0.006,
        "IT5": 0.004
      },
      {
        "minimum_diameter": 3,
        "maximum_diameter": 6,
        "upper_deviation": 0.008,
        "lower_deviation": 0,
        "IT6": 0.008,
        "IT5": 0.005
      }
     ],

     "H7": [
      {
        "minimum_diameter": 0,
        "maximum_diameter": 3,
        "upper_deviation": 0.01,
        "lower_deviation": 0,
        "IT7": 0.01,
        "IT6": 0.006,
        "IT5": 0.004
      },
      {
        "minimum_diameter": 3,
        "maximum_diameter": 6,
        "upper_deviation": 0.012,
        "lower_deviation": 0,
        "IT7": 0.012,
        "IT6": 0.008,
        "IT5": 0.005
      },
     ]
  }
}
```

- `type`: `"housing bore"` or `"shaft"` or `"shell bore"` inferred from the materialType parameter.
- `specifications`: ISO or ANSI fit/tolerance designation associated with the entry (e.g., H7, h6, etc.).

- `maximum_diameter`: The upper bound of the nominal diameter range (in millimetres) for which the tolerance values apply.
- `minimum_diameter`: The upper bound of the nominal diameter range (in millimetres) for which the tolerance values apply.
- `upper_deviation` / `lower_deviation`: The positive / negative deviation limit from the basic size (in millimetres).
- `IT5` / `IT6` / `IT8`, etc: International Tolerance (IT) grades defining standard tolerance magnitudes for each grade level.

---

## Example Output

```json
{
  "type": "housing bore",
  "specifications": {
    "H6": [
      {
        "minimum_diameter": 0,
        "maximum_diameter": 3,
        "upper_deviation": 0.006,
        "lower_deviation": 0,
        "IT6": 0.006,
        "IT5": 0.004
      },
      {
        "minimum_diameter": 3,
        "maximum_diameter": 6,
        "upper_deviation": 0.008,
        "lower_deviation": 0,
        "IT6": 0.008,
        "IT5": 0.005
      }
    ],

    "H7": [
      {
        "minimum_diameter": 0,
        "maximum_diameter": 3,
        "upper_deviation": 0.01,
        "lower_deviation": 0,
        "IT7": 0.01,
        "IT6": 0.006,
        "IT5": 0.004
      },
      {
        "minimum_diameter": 3,
        "maximum_diameter": 6,
        "upper_deviation": 0.012,
        "lower_deviation": 0,
        "IT7": 0.012,
        "IT6": 0.008,
        "IT5": 0.005
      }
    ]
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

Clone the repository or use the module directly after installing.

```bash
git clone <repo-url>
cd mechanical-tolerance-calculator
npm install
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
