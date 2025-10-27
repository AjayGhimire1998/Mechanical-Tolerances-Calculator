const tolerances = require("./Tolerances.json");

/**
 * Returns all tolerances for the given material type.
 * @description
 * The function checks the provided material type string to determine
 * which category of tolerances to return. It supports 'housing', 'shaft',
 * and 'shell' as valid material types. If the input is invalid or does not
 * match any known category, an error message is returned.
 * @param {String} materialType
 * @returns {Object} An object containing the relevant tolerances or an error message.
 */
function getAllTolerancesFor(materialType) {
  // Validate input as string. If not a string, return error
  if (typeof materialType !== "string") {
    return { error: "Material type must be a string." }; // early return with error message
  }

  // Validate input is not empty,null or undefined or only whitespace
  if (
    materialType === undefined ||
    materialType === null ||
    materialType.trim() === ""
  ) {
    return { error: "Material type is required and cannot be empty." }; // early return with error message
  }

  const trimmedMaterialType = materialType.trim().toLowerCase(); // normalize input
  if (trimmedMaterialType.includes("housing")) {
    // includes to allow variations like "housing bore"
    return { type: "housing bore", specifications: tolerances["housingBores"] }; // return relevant tolerances
  } else if (trimmedMaterialType.includes("shaft")) {
    // includes to allow variations like "shaft rod"
    return { type: "shaft", specifications: tolerances["shafts"] }; // return relevant tolerances
  } else if (trimmedMaterialType.includes("shell")) {
    // includes to allow variations like "shell bore"
    return { type: "shell bore", specifications: tolerances["shell"] }; // return relevant tolerances
  } else {
    return {
      error: `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`, // error for invalid typefac
    };
  }
}

function parseNominalFromMeasurement(measurement) {
  const nominalString = measurement.toString();
  let nominal = ""; // initialize empty string
  for (let index = 0; index < nominalString.length; index++) {
    if (nominalString[index] === ".") {
      break; // stop at decimal point
    }
    nominal += nominalString[index]; // append character to nominal
  }
  return parseInt(nominal); // convert to integer and return
}

function checkOneMeasurementFor(materialType, measurement) {
  const allTolerances = getAllTolerancesFor(materialType);
  if (allTolerances.error) {
    return allTolerances; // return error if material type is invalid
  }
  let nominal = parseNominalFromMeasurement(measurement);

  Object.keys(allTolerances.specifications).forEach((spec) => {
    const toleranceArray = allTolerances.specifications[spec];
    toleranceArray.forEach((range) => {
      if (
        nominal >= range.minimum_diameter &&
        nominal <= range.maximum_diameter
      ) {
        console.log(
          `For measurement ${measurement} (nominal: ${nominal}), spec ${spec}:`
        );
        console.log(`  Upper Deviation: ${range.upper_deviation} mm`);
        console.log(`  Lower Deviation: ${range.lower_deviation} mm`);
      }
    });
  });
}

module.exports = { getAllTolerancesFor, checkOneMeasurementFor };
