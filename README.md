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

// Example: Housing Bore Tolerances
const housingTolerances = getAllTolerancesFor("housing");
console.log(housingTolerances["housingBoresTolerances"]);

// Example: Checking Shaft Toleranace for a Measurement
const result = checkOneMeasurementFor('shaft', 179.91); 
console.log(result);

// Exmaple: Checking Housing Specification Tolerance for a Collection of Measurements
const result = checkMultipleMeasurementsFor('housing', [240.05, 240.07, 240.09, 240.05, 240.06, 240.02, 240.09]); 
console.log(result);

```
# API Documentation

This section documents the exported public methods of the **Mechanical Tolerance Calculator** library.

---

## getAllTolerancesFor(materialType)

Returns all available ISO/ANSI tolerance specifications for a given material type.

### Description
Determines the material category from the provided string and returns the full set of tolerance specifications associated with that category.  
Supported material types include **housing**, **shaft**, and **shell** (case-insensitive and partial matches allowed, e.g. `"housing bore"`).

### Parameters
- **materialType** (`string`)  
  The type of material to retrieve tolerances for.  
  Valid values (or substrings):
  - `"housing"`
  - `"shaft"`
  - `"shell"`

### Returns
- **object**

  **On success**
  ```json
  {
    "type": "housingBores" | "shafts" | "shellBores",
    "specifications": {
      "H6": [ { ... } ],
      "H7": [ { ... } ],
      "...": [ { ... } ]
    }
  } ```

 -  **On failure**
    ```json
    {
      "error": "Unknown material type: <value>. Valid types are 'housing', 'shaft', or 'shell'."
    }
    ```

    ### Example
```js
const { getAllTolerancesFor } = require("mechanical-tolerance-calculator");

const tolerances = getAllTolerancesFor("housing");
console.log(tolerances.specifications.H7);

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
