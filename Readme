🧮 Mechanical Tolerance Calculator

Mechanical Tolerance Calculator is a lightweight JavaScript utility for calculating international standard specifications and tolerances for bores, round bars, and metallic mechanical units.
It supports common engineering fit and tolerance designations such as H7, H8, H9, h8, h9, and IT5–IT6 according to ISO/ANSI standards.

🚀 Features

Calculates standard tolerances (IT grades) and shaft/hole deviations.

Supports ISO system of limits and fits (e.g., H7/h6, H8/f7).

Works for both bores (holes) and shafts (round bars).

Returns tolerance ranges, upper/lower deviations, and clearance/interference fit results.

Lightweight and dependency-free.

📦 Installation
npm install mechanical-tolerance-calculator

or using yarn:

yarn add mechanical-tolerance-calculator

🧰 Usage
import { calculateTolerance } from "mechanical-tolerance-calculator";

// Example: Hole tolerance for H7, nominal size 50 mm
const hole = calculateTolerance("H7", 50);
console.log(hole);
/_
{
type: "hole",
nominal: 50,
designation: "H7",
upperDeviation: 0.025,
lowerDeviation: 0.000,
tolerance: 0.025,
ITGrade: 7
}
_/

// Example: Shaft tolerance for h6, nominal size 50 mm
const shaft = calculateTolerance("h6", 50);
console.log(shaft);
/_
{
type: "shaft",
nominal: 50,
designation: "h6",
upperDeviation: 0.000,
lowerDeviation: -0.016,
tolerance: 0.016,
ITGrade: 6
}
_/

⚙️ API Reference
calculateTolerance(designation, nominalSize)
Parameter Type Description
designation string ISO/ANSI tolerance designation (e.g. "H7", "h6", "IT6")
nominalSize number Nominal dimension in millimeters

Returns:
An object containing tolerance values and deviation limits.

📚 Standards Referenced

ISO 286-1: Geometrical Product Specifications (GPS) — Limits and Fits

ANSI B4.2: Preferred Metric Limits and Fits

🧪 Example Applications

Mechanical part design and inspection tools

CAD/CAM automation scripts

Manufacturing tolerance checkers

Educational or research tools for mechanical engineering

🧑‍💻 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a GitHub issue
or submit a pull request.

📄 License

MIT © 2025 Ajay Ghimire
