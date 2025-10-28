const tolerances = require("./Tolerances.json");

/**
 * Returns all tolerances for the given material type.
 * @description
 * The function checks the provided material type string to determine
 * which category of tolerances to return. It supports 'housing', 'shaft',
 * and 'shell' as valid material types. If the input is invalid or does not
 * match any known category, an error message is returned.
 * @param {string} materialType
 * @returns {object} An object containing the relevant tolerances or an error message.
 */
function getAllTolerancesFor(materialType) {
  const validatedMaterialType = validateMaterialType(materialType);

  const trimmedMaterialType = validatedMaterialType.trim().toLowerCase(); // normalize input
  if (trimmedMaterialType.includes("housing")) {
    // includes to allow variations like "housing bore"
    return returnTolerancesFor("housingBores"); // return relevant tolerances
  } else if (trimmedMaterialType.includes("shaft")) {
    // includes to allow variations like "shaft rod"
    return returnTolerancesFor("shafts"); // return relevant tolerances
  } else if (trimmedMaterialType.includes("shell")) {
    // includes to allow variations like "shell bore"
    return returnTolerancesFor("shellBores"); // return relevant tolerances
  } else {
    return {
      error: `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`, // error for invalid typefac
    };
  }
}

/**
 * Returns Camco Standard specification and tolerances for the given material type.
 * @description
 * The function checks the provided material type string to determine
 * which category of camco standard tolerances to return. It supports 'housing', 'shaft',
 * and 'shell' as valid material types. If the input is invalid or does not
 * match any known category, an error message is returned.
 * @param {string} materialType
 * @returns {object} An object containing the relevant tolerances or an error message.
 */
function getCamcoStandardTolerancesFor(materialType) {
  const validatedMaterialType = validateMaterialType(materialType);

  const trimmedMaterialType = validatedMaterialType.trim().toLowerCase();

  if (trimmedMaterialType.includes("housing")) {
    return returnTolerancesFor("housingBores", "H8");
  } else if (trimmedMaterialType.includes("shell")) {
    return returnTolerancesFor("shellBores", "H9");
  } else if (trimmedMaterialType.includes("shaft")) {
    return returnTolerancesFor("shafts", "h9");
  } else {
    return {
      error: `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`,
    };
  }
}

function validateMaterialType(materialType) {
  if (typeof materialType != "string") {
    return { error: "Material type must be a string." };
  }

  if (
    materialType == undefined ||
    materialType == null ||
    materialType.trim() === ""
  ) {
    return { error: "Material type is required and cannot be empty." };
  }

  return materialType;
}

function returnTolerancesFor(executableMaterialType, spec = "") {
  if (spec) {
    const allTolerances = tolerances[executableMaterialType];
    if (!Object.keys(allTolerances).includes(spec)) {
      return {
        error: `Currently available specifications are ${Object.keys(
          allTolerances
        )}`,
      };
    }
    return {
      type: executableMaterialType,
      specification: tolerances[executableMaterialType][spec],
    };
  }

  return {
    type: executableMaterialType,
    specifications: tolerances[executableMaterialType],
  };
}

function parseNominalFromMeasurement(measurement) {
  const nominalString = measurement.toString();
  let nominal = "";
  for (let index = 0; index < nominalString.length; index++) {
    if (nominalString[index] === ".") {
      break;
    }
    nominal += nominalString[index];
  }
  return parseInt(nominal);
}

function checkOneMeasurementFor(materialType, measurement) {
  const camcoStandardTolerances = getCamcoStandardTolerancesFor(materialType);
  let nominal = parseNominalFromMeasurement(measurement);
  let matchedSpec = {};
  let meetsSpec = false;
  let meetsTolerance = false;
  let upperBound;
  let lowerBound;
  if (camcoStandardTolerances.type === "shafts") {
    const shaftNominal = nominalForShaft(nominal);
    const specs = camcoStandardTolerances["specification"];
    Array.from(specs).forEach((spec) => {
      if (
        shaftNominal > spec.minimum_diameter &&
        shaftNominal <= spec.maximum_diameter
      ) {
        matchedSpec = spec;
      }
    });

    upperBound = shaftNominal + parseStringFloat(matchedSpec.upper_deviation);
    lowerBound = shaftNominal + parseStringFloat(matchedSpec.lower_deviation);

    console.log("upper: ", upperBound.toFixed(3));
    console.log("lower: ", lowerBound.toFixed(3));
  }
}

function nominalForShaft(nominal) {
  return nominal + 1;
}

/**
 * Converts string float values to actual float numbers
 * @param {string} value - The string representation of a float number
 * @returns {number} - The parsed float number
 */
function parseStringFloat(value) {
  // Handle edge cases
  if (value === null || value === undefined) {
    return 0;
  }

  // If it's already a number, return it
  if (typeof value === "number") {
    return value;
  }

  // Convert string to float
  const parsed = parseFloat(value);

  // Return 0 if parsing fails (NaN)
  return isNaN(parsed) ? 0 : parsed;
}

module.exports = {
  getAllTolerancesFor,
  getCamcoStandardTolerancesFor,
  parseNominalFromMeasurement,
  checkOneMeasurementFor,
};
