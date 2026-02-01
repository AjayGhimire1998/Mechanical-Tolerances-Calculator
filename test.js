const {
  checkMultipleMeasurementsFor,
  checkOneMeasurementFor,
} = require("./index");
// console.log(checkMultipleMeasurementsFor("housing", [100.04, 100.05]));
// console.log(checkMultipleMeasurementsFor("housing", [100.04, 100.05, 95.06]));
console.log(checkMultipleMeasurementsFor("housing", [99.99, 100.15, 100.2]));
console.log(checkOneMeasurementFor("shaft", 199.98));
