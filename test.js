const { checkMultipleMeasurementsFor } = require("./index");
// console.log(checkMultipleMeasurementsFor("housing", [100.04, 100.05]));
// console.log(checkMultipleMeasurementsFor("housing", [100.04, 100.05, 95.06]));
console.log(
  checkMultipleMeasurementsFor(
    "housing",
    [100.04, 100.05, 100.05, 98.08, 98.07, 100.09, 98.07, 98.03],
  ),
);
