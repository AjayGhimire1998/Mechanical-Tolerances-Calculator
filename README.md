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

## API EXACPLES

### **1. getAllTolerancesFor(materialType)** Returns all tolerances for a given material type. - **Parameters:** - `materialType` **(string)**: Type of material. Valid values include `'housing'`, `'shaft'`, `'shell'`. - **Returns:** - **object**: Contains all relevant tolerances for the material type, or an error message if invalid. - **Example:** ```js const tolerances = getAllTolerancesFor('housing'); console.log(tolerances); ``` --- ### **2. getCamcoStandardTolerancesFor(materialType)** Returns Camco Standard specification and tolerances for a given material type. - **Parameters:** - `materialType` **(string)**: Type of material. Valid values include `'housing'`, `'shaft'`, `'shell'`. - **Returns:** - **object**: Contains standard tolerances for the material type, or an error message if invalid. - **Example:** ```js const camcoTolerances = getCamcoStandardTolerancesFor('shaft'); console.log(camcoTolerances); ``` --- ### **3. checkOneMeasurementFor(materialType, measurement)** Checks if a single measurement complies with the Camco standard tolerance and IT grade. - **Parameters:** - `materialType` **(string)**: Type of material. Valid values include `'housing'`, `'shaft'`, `'shell'`. - `measurement` **(number)**: Measurement to check (0–1000). - **Returns:** - **object**: Contains detailed result including nominal, specification, IT grade, bounds, and whether the measurement meets specification. - **Example:** ```js const result = checkOneMeasurementFor('shaft', 25.5); console.log(result); ``` --- ### **4. checkMultipleMeasurementsFor(materialType, measurements)** Checks multiple measurements against the Camco standard tolerances and IT grades. - **Parameters:** - `materialType` **(string)**: Type of material. Valid values include `'housing'`, `'shaft'`, `'shell'`. - `measurements` **(number[])**: Array of measurements to check. - **Returns:** - **object**: Contains detailed results including nominal, IT grade compliance, specification compliance, and overall measurement analysis. - **Example:** ```js const results = checkMultipleMeasurementsFor('housing', [10.2, 10.5, 10.8]); console.log(results); ``` --- ### **Notes** - All measurement values must be **numbers between 0 and 1000**. - Functions normalize material type inputs and accept variations like `"housing bore"` or `"shaft rod"`. - Returned objects include: - `nominal`: Nominal value derived from measurement - `specification`: Standard spec used - `IT_grade`: Tolerance grade - `computed_specification_bounds`: Upper and lower bounds as numbers - `uncomputed_specification_bounds`: Upper and lower bounds as formatted strings - `meets_specification`: Boolean and reason for compliance - `meets_IT_Tolerance`: Boolean and reason for IT compliance (for multiple measurements) --- **Module Export:** ```js module.exports = { getAllTolerancesFor, getCamcoStandardTolerancesFor, checkOneMeasurementFor, checkMultipleMeasurementsFor, }; ```
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
