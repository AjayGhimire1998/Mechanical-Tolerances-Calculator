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
    return returnCamcoTolerancesFor("housingBores", "H8");
  } else if (trimmedMaterialType.includes("shell")) {
    return returnCamcoTolerancesFor("shellBores", "H9");
  } else if (trimmedMaterialType.includes("shaft")) {
    return returnCamcoTolerancesFor("shafts", "h9");
  } else {
    return {
      error: `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`,
    };
  }
}

/**
 * Validate a material type value.
 * @description
 * Checks that the provided value is a non-empty string (not undefined, null,
 * or whitespace-only). If validation fails, an object with an `error` message
 * is returned; otherwise the original string value is returned.
 *
 * @param {string} materialType - The material type to validate.
 * @returns {string|{error: string}} The original materialType string when valid,
 * or an object with an `error` property describing the validation failure.
 *
 * @example
 * // returns "Steel"
 * validateMaterialType("Steel");
 *
 * @example
 * // returns { error: "Material type must be a string." }
 * validateMaterialType(123);
 *
 * @example
 * // returns { error: "Material type is required and cannot be empty." }
 * validateMaterialType("   ");
 */
function validateMaterialType(materialType) {
  if (typeof materialType != "string") {
    return { error: "Material type must be a string." }; // early return with error message
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

function returnCamcoTolerancesFor(executableMaterialType, spec) {
  const allTolerances = getAllTolerancesFor(executableMaterialType);
  console.log(Object.keys(allTolerances["specifications"]));

  if (!Object.keys(allTolerances["specifications"]).includes(spec)) {
    return {
      error: `Currently available specifications are ${Object.keys(
        allTolerances["specifications"]
      )}`,
    };
  }
  return {
    type: executableMaterialType,
    specification: tolerances[executableMaterialType][spec],
  };
}

function parseNominalFromMeasurement(measurement, materialType) {
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

// function checkOneMeasurementFor(materialType, measurement) {}

module.exports = {
  getAllTolerancesFor,
  getCamcoStandardTolerancesFor,
};
