const { checkMultipleMeasurementsFor } = require("./index");
console.log(checkMultipleMeasurementsFor("housing", [100.04, 100.05]));
console.log(checkMultipleMeasurementsFor("housing", [100.04, 100.05, 95.06]));
console.log(
  checkMultipleMeasurementsFor("housing", [100.04, 100.05, 95.06, 80.09]),
);
