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

function parseNominalFromMeasurement(measurement, materialType) {
  // For shafts: upper_deviation is 0, so measurement ≤ nominal
  // Therefore, nominal must be ceiling of measurement
  if (materialType === "shafts") {
    return Math.ceil(measurement);
  }

  // For bores: lower_deviation is 0, so measurement ≥ nominal
  // Therefore, nominal must be floor of measurement
  if (materialType === "housingBores" || materialType === "shellBores") {
    return Math.floor(measurement);
  }

  // Default: round to nearest
  return Math.round(measurement);
}

const MATERIAL_TYPE_CONFIG = {
  shafts: {
    specification: "h9",
    itGrade: "IT5",

    rangeMatch: (nominal, spec) =>
      nominal > spec.minimum_diameter && nominal <= spec.maximum_diameter,
  },
  housingBores: {
    specification: "H8",
    itGrade: "IT6",

    rangeMatch: (nominal, spec) =>
      nominal >= spec.minimum_diameter && nominal < spec.maximum_diameter,
  },
  shellBores: {
    specification: "H9",
    itGrade: "IT6",
    rangeMatch: (nominal, spec) =>
      nominal >= spec.minimum_diameter && nominal < spec.maximum_diameter,
  },
};

function findMatchingSpec(nominal, specs, rangeMatchFn) {
  return specs.find((spec) => rangeMatchFn(nominal, spec)) || null;
}

function calculateComputedBounds(nominal, spec) {
  return {
    upperBound: parseComputedBound(nominal, spec.upper_deviation, 3),
    lowerBound: parseComputedBound(nominal, spec.lower_deviation, 3),
  };
}

function calculateUncomputedBounds(nominal, spec) {
  return {
    upperBound: parseUncomputedBound(nominal, spec.upper_deviation, "+"),
    lowerBound: parseUncomputedBound(nominal, spec.lower_deviation, "-"),
  };
}

function checkMeetsSpecification(measurement, bounds) {
  const measure = parseStringFloat(measurement);
  const upper = parseStringFloat(bounds.upperBound);
  const lower = parseStringFloat(bounds.lowerBound);

  return measure >= lower && measure <= upper;
}

function processMeasurement(materialType, measurement, tolerances) {
  const config = MATERIAL_TYPE_CONFIG[materialType];

  if (!config) {
    return {
      error: true,
      message: `Unknown material type: ${materialType}`,
    };
  }

  // Calculate nominal diameter
  const nominal = parseNominalFromMeasurement(measurement, materialType);

  // Find matching specification
  const matchedSpec = findMatchingSpec(
    nominal,
    tolerances.specification,
    config.rangeMatch
  );

  if (!matchedSpec) {
    return {
      error: true,
      message: `No specification found for nominal diameter: ${nominal}`,
      nominal,
    };
  }

  // Calculate bounds
  const computedBounds = calculateComputedBounds(nominal, matchedSpec);
  const uncomputedBounds = calculateUncomputedBounds(nominal, matchedSpec);

  // Check if measurement meets specification
  const meetsSpec = checkMeetsSpecification(measurement, computedBounds);

  return {
    measurement: parseStringFloat(measurement),
    nominal,
    specification: config.specification,
    IT_grade: config.itGrade,
    computed_specification_bounds: computedBounds,
    uncomputed_specification_bounds: uncomputedBounds,
    meet_specification: meetsSpec,
    meets_IT_tolerance: meetsSpec,
    matched_spec: matchedSpec,
  };
}

function checkOneMeasurementFor(materialType, measurement) {
  const camcoStandardTolerances = getCamcoStandardTolerancesFor(materialType);

  if (camcoStandardTolerances.error) {
    return camcoStandardTolerances;
  }

  if (typeof measurement !== "number" || isNaN(measurement)) {
    return {
      error: true,
      message: "Invalid measurement value",
    };
  }

  return processMeasurement(
    camcoStandardTolerances.type,
    measurement,
    camcoStandardTolerances
  );
}

function parseComputedBound(base, value, decimalCount) {
  return Number(base + parseStringFloat(value)).toFixed(decimalCount);
}

function parseUncomputedBound(value1, value2, sign) {
  if (value2.startsWith("-")) {
    return (
      parseToFixedThreeString(value1) +
      " " +
      sign +
      " " +
      parseToFixedThreeString(value2.slice(1, value2.length))
    );
  }

  return (
    parseToFixedThreeString(value1) +
    " " +
    sign +
    " " +
    parseToFixedThreeString(value2)
  );
}

function parseToFixedThreeString(value) {
  if (typeof value === "number") {
    return value.toFixed(3);
  }
  return value;
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
