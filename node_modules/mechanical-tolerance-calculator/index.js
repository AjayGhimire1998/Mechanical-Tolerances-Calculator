const tolerances = require("./Tolerances.json");

/* Validates the material type passed is not an empty string. */
function validateMaterialType(materialType) {
  if (typeof materialType != "string") {
    // checks if
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
/**
 * Returns all tolerances for the given material type.
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

/**
 * Returns tolerance data for a given material type.
 *
 * - If `spec` is provided:
 *   → returns only that specific tolerance
 *   → returns an error object if the spec does not exist
 *
 * - If `spec` is not provided:
 *   → returns all available tolerances for the material type
 *
 * @param {string} executableMaterialType - Material type (e.g. shaft, bore)
 * @param {string} [spec=""] - Optional tolerance specification (e.g. H7, h6)
 */
function returnTolerancesFor(executableMaterialType, spec = "") {
  const materialTolerances = tolerances[executableMaterialType];

  // Guard: invalid material type
  if (!materialTolerances) {
    return {
      error: `Unknown material type: ${executableMaterialType}`,
    };
  }

  // If a specific spec is requested
  if (spec) {
    if (!materialTolerances[spec]) {
      return {
        error: `Available specifications: ${Object.keys(
          materialTolerances,
        ).join(", ")}`,
      };
    }

    return {
      type: executableMaterialType,
      specification: materialTolerances[spec],
    };
  }

  // Return all specs for the material
  return {
    type: executableMaterialType,
    specifications: materialTolerances,
  };
}

/**
 * Validates a measurement input.
 *
 * Rules:
 * - Must be a number (or numeric string)
 * - Must not be NaN
 * - Must be within a realistic measurement range
 *
 * @param {number|string} measurement
 * @returns {boolean}
 */
function isValidMeasurement(measurement) {
  const value = Number(measurement);

  return Number.isFinite(value) && value >= 0 && value < 1000;
}

/**
 * Derives the nominal size from a raw measurement
 * based on material behavior (shaft vs bore).
 *
 * @param {number|string} measurement
 * @param {"shafts"|"housingBores"|"shellBores"} materialType
 * @param {number} THRESHOLD - allowable deviation before snapping to next nominal
 * @returns {number|{error: string}}
 */
function parseNominalFromMeasurement(
  measurement,
  materialType,
  THRESHOLD = 0.9,
) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 and 1000." };
  }

  const value = Number(measurement);

  /**
   * SHAFTS
   * - Nominal is normally ABOVE the measurement
   * - Upper deviation is 0
   * - Rare cases allow slight overshoot (handled via threshold)
   */
  if (materialType === "shafts") {
    const ceilNominal = Math.ceil(value);
    const deviationFromCeil = ceilNominal - value;

    // If shaft is too far below the nominal, snap down
    return deviationFromCeil >= THRESHOLD ? Math.floor(value) : ceilNominal;
  }

  /**
   * BORES (housing / shell)
   * - Nominal is normally BELOW the measurement
   * - Lower deviation is 0
   */
  if (materialType === "housingBores" || materialType === "shellBores") {
    const floorNominal = Math.floor(value);
    const deviationFromFloor = value - floorNominal;

    // If bore grows too much above nominal, snap up
    return deviationFromFloor >= THRESHOLD ? Math.ceil(value) : floorNominal;
  }

  /**
   * Fallback
   * - Used only if material type is unknown
   */
  return Math.round(value);
}

/**
 * Configuration defining how each material type
 * maps to specifications, IT grades, and nominal matching rules.
 */
const MATERIAL_TYPE_CONFIG = {
  shafts: {
    specification: "h9",
    itGrade: "IT5",

    /**
     * Shafts:
     * - Upper deviation = 0
     * - Nominal sits at the top end of the range
     */
    rangeMatch: (nominal, spec) =>
      nominal > spec.minimum_diameter && nominal <= spec.maximum_diameter,
  },

  housingBores: {
    specification: "H8",
    itGrade: "IT6",

    /**
     * Housing bores:
     * - Lower deviation = 0
     * - Nominal sits at the bottom end of the range
     */
    rangeMatch: (nominal, spec) =>
      nominal >= spec.minimum_diameter && nominal < spec.maximum_diameter,
  },

  shellBores: {
    specification: "H9",
    itGrade: "IT6",

    /**
     * Shell bores:
     * - Same rule as housing bores, different spec
     */
    rangeMatch: (nominal, spec) =>
      nominal >= spec.minimum_diameter && nominal < spec.maximum_diameter,
  },
};

/**
 * Finds the specification that matches a given nominal
 * using a material-specific range matching rule.
 *
 * @param {number} nominal
 * @param {Array<Object>} specs
 * @param {(nominal: number, spec: Object) => boolean} rangeMatchFn
 * @returns {Object|null}
 */
function findMatchingSpec(nominal, specs, rangeMatchFn) {
  if (!Array.isArray(specs)) return null;

  return specs.find((spec) => rangeMatchFn(nominal, spec)) ?? null;
}

/**
 * Calculates numeric (computed) upper and lower bounds.
 *
 * Example:
 * nominal = 200
 * upper_deviation = 0.072 → 200.072
 */
function calculateComputedBounds(nominal, spec) {
  return {
    upperBound: parseComputedBound(nominal, spec.upper_deviation, 3),
    lowerBound: parseComputedBound(nominal, spec.lower_deviation, 3),
  };
}

/**
 * Calculates display-friendly (uncomputed) bounds.
 *
 * Example:
 * 200 + 0.072
 * 200 - 0.000
 */
function calculateUncomputedBounds(nominal, spec) {
  return {
    upperBound: parseUncomputedBound(nominal, spec.upper_deviation, "+"),
    lowerBound: parseUncomputedBound(nominal, spec.lower_deviation, "-"),
  };
}

/**
 * Checks whether a measurement falls within
 * the calculated specification bounds.
 *
 * @param {number|string} measurement
 * @param {{ upperBound: number|string, lowerBound: number|string }} bounds
 * @returns {boolean|{error: string}}
 */
function checkMeetsSpecification(measurement, bounds) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 and 1000." };
  }

  const value = Number(measurement);
  const upper = Number(bounds.upperBound);
  const lower = Number(bounds.lowerBound);

  if (![value, upper, lower].every(Number.isFinite)) {
    return { error: "Invalid specification bounds." };
  }

  return value >= lower && value <= upper;
}

/**
 * Processes a single measurement for a given material type.
 *
 * Steps:
 * 1. Validates the measurement.
 * 2. Retrieves configuration for the material type.
 * 3. Calculates the nominal diameter based on the measurement.
 * 4. Finds the matching specification for the nominal.
 * 5. Calculates numeric (computed) and display-friendly (uncomputed) bounds.
 * 6. Checks if the measurement meets the specification.
 * 7. Generates a human-readable outcome and reasoning.
 *
 * @param {"shafts"|"housingBores"|"shellBores"} materialType
 * @param {number|string} measurement - The raw measurement value.
 * @param {Object} tolerances - Tolerance data for the material type.
 * @returns {Object} Processed measurement details, or error if invalid.
 */
function processOneMeasurement(materialType, measurement, tolerances) {
  // 1. Validate the measurement
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 and 1000." };
  }

  // 2. Get material configuration (specification, IT grade, range matching)
  const config = MATERIAL_TYPE_CONFIG[materialType];
  if (!config) {
    return {
      error: true,
      message: `Unknown material type: ${materialType}`,
    };
  }

  // 3. Derive nominal diameter from the measurement
  const nominal = parseNominalFromMeasurement(measurement, materialType);
  if (nominal?.error) {
    return { error: true, message: nominal.error };
  }

  // 4. Find the specification that matches the nominal
  const matchedSpec = findMatchingSpec(
    nominal,
    tolerances.specification,
    config.rangeMatch,
  );
  if (!matchedSpec) {
    return {
      error: true,
      message: `No specification found for nominal diameter: ${nominal}`,
      nominal,
    };
  }

  // 5. Calculate specification bounds
  const computedBounds = calculateComputedBounds(nominal, matchedSpec); // numeric bounds for checking
  const uncomputedBounds = calculateUncomputedBounds(nominal, matchedSpec); // human-readable bounds for display

  // 6. Check if measurement meets the specification
  const meetsSpec = checkMeetsSpecification(measurement, computedBounds);
  const specMeetingReason = generateReasonForSpecs(
    meetsSpec,
    measurement,
    computedBounds.lowerBound,
    computedBounds.upperBound,
  );

  // 7. Determine human-readable outcome
  const numericMeasurement = parseStringFloat(measurement);
  let outcome;
  if (numericMeasurement > computedBounds.upperBound) {
    outcome = `${materialType} is over-sized.`;
  } else if (numericMeasurement < computedBounds.lowerBound) {
    outcome = `${materialType} is under-sized.`;
  } else {
    outcome = `${materialType} is in acceptable size.`;
  }

  // 8. Return structured result
  return {
    measurement: numericMeasurement,
    nominal,
    specification: config.specification,
    IT_grade: config.itGrade,
    computed_specification_bounds: computedBounds,
    uncomputed_specification_bounds: uncomputedBounds,
    matched_spec: matchedSpec,

    meets_specification: {
      meetsSpec,
      reason: specMeetingReason,
      concludedReason: outcome,
    },
  };
}

/**
 * Checks a single measurement against Camco standard tolerances.
 *
 * Optional helper function for quick validation of one measurement.
 *
 * @param {"shafts"|"housingBores"|"shellBores"} materialType
 * @param {number|string} measurement
 * @returns {Object} Processed measurement details or error object
 */
function checkOneMeasurementFor(materialType, measurement) {
  // 1. Validate measurement value
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 and 1000." };
  }

  // 2. Retrieve Camco standard tolerances for the material type
  const camcoStandardTolerances = getCamcoStandardTolerancesFor(materialType);
  if (camcoStandardTolerances.error) {
    return camcoStandardTolerances; // pass through the error
  }

  // 3. Ensure measurement is numeric
  const numericMeasurement = Number(measurement);
  if (!Number.isFinite(numericMeasurement)) {
    return {
      error: true,
      message: "Invalid measurement value",
    };
  }

  // 4. Process the measurement using standard tolerances
  return processOneMeasurement(
    camcoStandardTolerances.type,
    numericMeasurement,
    camcoStandardTolerances,
  );
}

/**
 * Calculates a numeric upper or lower bound by adding the deviation to the nominal.
 *
 * @param {number} base - The nominal measurement.
 * @param {number|string} value - The deviation (can be negative or string).
 * @param {number} decimalCount - Number of decimals to round to.
 * @returns {string} - Computed bound as a string with fixed decimals.
 */
function parseComputedBound(base, value, decimalCount = 3) {
  const numericValue = parseStringFloat(value);
  const bound = Number(base) + numericValue;
  return bound.toFixed(decimalCount);
}

/**
 * Formats a human-readable bound string for display purposes.
 * Example: "200.000 + 0.072" or "200.000 - 0.115"
 *
 * @param {number} nominal - Nominal value.
 * @param {string|number} deviation - Deviation value (can start with "-" for negative).
 * @param {"+"|"-"} sign - Sign to display for the deviation.
 * @returns {string} - Formatted bound string.
 */
function parseUncomputedBound(nominal, deviation, sign) {
  const numericNominal = parseToFixedThreeString(nominal);

  // Handle negative deviation
  if (typeof deviation === "string" && deviation.startsWith("-")) {
    const positiveDeviation = deviation.slice(1);
    return `${numericNominal} ${sign} ${parseToFixedThreeString(positiveDeviation)}`;
  }

  return `${numericNominal} ${sign} ${parseToFixedThreeString(deviation)}`;
}

/**
 * Utility to convert a number or string to a string with 3 decimals.
 * @param {number|string} value
 * @returns {string}
 */
function parseToFixedThreeString(value) {
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num.toFixed(3) : "0.000";
}

/**
 * Converts a number or numeric string to a string with 3 decimal places.
 * If input is invalid, returns "0.000".
 *
 * @param {number|string} value
 * @returns {string} - Number formatted as a string with 3 decimals.
 */
function parseToFixedThreeString(value) {
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num.toFixed(3) : "0.000";
}

/**
 * Converts a string or number to a float.
 * Safely handles null, undefined, or non-numeric strings by returning 0.
 *
 * @param {number|string} value - Value to convert to float
 * @returns {number} - Parsed float number
 */
function parseStringFloat(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Processes a single measurement for a given material type.
 * Validates the measurement and calculates its nominal, specification compliance,
 * and IT tolerance based on the provided tolerances.
 *
 * @param {string} materialType - The type of material (e.g., "shafts", "housingBores", "shellBores")
 * @param {number} measurement - The measurement value to process
 * @param {object} tolerances - Tolerance definitions for the material type
 * @returns {object} Processed measurement details including nominal, spec bounds, IT grade,
 *                   and whether it meets specification
 */
function processIndividualMeasurement(materialType, measurement, tolerances) {
  // Validate that the measurement is a valid number between 0 and 1000
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }

  // Delegate actual processing to the generic processMeasurement function
  const processedMeasurement = processOneMeasurement(
    materialType,
    measurement,
    tolerances,
  );

  return processedMeasurement;
}

/**
 * Processes multiple measurements for a given material type.
 * Determines spec compliance, IT tolerance, and final compliance.
 */
function checkMultipleMeasurementsFor(materialType, measurements) {
  // 1. Validate measurements
  const validationError = validateMeasurementsArray(measurements);
  if (validationError) return validationError;

  // 2. Get Camco standard tolerances
  const camcoTolerances = getCamcoStandardTolerancesFor(materialType);
  if (camcoTolerances.error) return camcoTolerances;

  // 3. Process all measurements individually
  const results = measurements.map((m) =>
    processIndividualMeasurement(camcoTolerances.type, m, camcoTolerances),
  );

  // 4. Determine most common nominal and farthest measurement
  const mostOccuredNominal = findMostOccuredNominal(results);
  const mostFarMeasurement = findFarthestMeasurement(
    measurements,
    mostOccuredNominal,
  );

  // 5. Base spec for the most common nominal
  const baseSpec = results.find((r) => r.nominal === mostOccuredNominal);
  const baseITValue = baseSpec.matched_spec[baseSpec.IT_grade];

  // 6. Check IT tolerance and spec compliance
  const { meetsIT, itReason } = checkITTolerance(
    measurements,
    baseITValue,
    baseSpec.IT_grade,
  );
  const { meetsSpec, specReason } = checkSpecCompliance(
    results,
    baseSpec,
    mostFarMeasurement,
  );

  // 7. Generate outcome messages
  const generalizedOutcome = generateOutcomeMessage(
    materialType,
    mostFarMeasurement,
    baseSpec,
    meetsSpec,
    meetsIT,
  );

  return {
    ...baseSpec,
    measurement: measurements,
    meets_specification: { meetsSpec, reason: specReason },
    meets_IT_Tolerance: { meetsIT, reason: itReason },
    meets_final_compliance: meetsSpec && meetsIT,
    generalized_outcome: generalizedOutcome,
  };
}

/** --- Helper Functions for checkMultipleMeasuremetsFor() start--- */

/** Validate the array of measurements */
function validateMeasurementsArray(measurements) {
  const validationError = validateMeasurements(measurements);
  if (validationError) return validationError;

  const invalids = measurements
    .map((m, idx) => (!isValidMeasurement(m) ? { index: idx, value: m } : null))
    .filter(Boolean);

  if (invalids.length > 0)
    return { error: "Some measurements are invalid.", details: invalids };
  return null;
}

/** Find the most frequently occurring nominal */
function findMostOccuredNominal(results) {
  const nominalCounts = {};
  results.forEach(
    (r) => (nominalCounts[r.nominal] = (nominalCounts[r.nominal] || 0) + 1),
  );

  return parseInt(
    Object.keys(nominalCounts).find(
      (n) => nominalCounts[n] === Math.max(...Object.values(nominalCounts)),
    ),
  );
}

/** Find the measurement farthest from the most common nominal */
function findFarthestMeasurement(measurements, referenceNominal) {
  return measurements.reduce(
    (farthest, current) =>
      Math.abs(current - referenceNominal) >
      Math.abs(farthest - referenceNominal)
        ? current
        : farthest,
    measurements[0],
  );
}

/** Check IT tolerance */
function checkITTolerance(measurements, baseITValue, ITGrade) {
  const largest = Math.max(...measurements);
  const smallest = Math.min(...measurements);
  const ITDifference = parseToFixedThreeString(largest - smallest);

  const meetsIT = ITDifference <= baseITValue;
  const reason = generateReasonForTolerances(
    meetsIT,
    largest,
    smallest,
    baseITValue,
    ITGrade,
  );

  return { meetsIT, itReason: reason };
}

/** Check if all measurements meet specification bounds */
function checkSpecCompliance(results, baseSpec, mostFarMeasurement) {
  const meetsSpec = results.every(
    (r) =>
      r.measurement >= baseSpec.computed_specification_bounds.lowerBound &&
      r.measurement <= baseSpec.computed_specification_bounds.upperBound,
  );

  const reason = generateReasonForSpecs(
    meetsSpec,
    mostFarMeasurement,
    baseSpec.computed_specification_bounds.lowerBound,
    baseSpec.computed_specification_bounds.upperBound,
    baseSpec.specification,
  );

  return { meetsSpec, specReason: reason };
}

/** Generate a human-readable outcome message */
function generateOutcomeMessage(
  materialType,
  mostFarMeasurement,
  baseSpec,
  meetsSpec,
  meetsIT,
) {
  const isWithinSizeRange =
    mostFarMeasurement >= baseSpec.computed_specification_bounds.lowerBound &&
    mostFarMeasurement <= baseSpec.computed_specification_bounds.upperBound;

  const isOverSized =
    mostFarMeasurement > baseSpec.computed_specification_bounds.upperBound;

  const sizeOutcome = isWithinSizeRange
    ? `${materialType} is acceptable in size.`
    : isOverSized
      ? `${materialType} is over-sized.`
      : `${materialType} is under-sized.`;

  const ITOutcome =
    isWithinSizeRange && meetsIT
      ? "And, it meets IT tolerance."
      : !isWithinSizeRange && meetsIT
        ? "However, it meets IT tolerance."
        : `${!isWithinSizeRange ? "And, " : "But, "}it fails IT tolerance.`;

  const finalOutcome =
    meetsSpec && meetsIT
      ? "Finally, it meets final compliance and is acceptable to use."
      : "Finally, it doesn't meet final compliance and is not acceptable to use.";

  return `${sizeOutcome} ${ITOutcome} ${finalOutcome}`;
}

/**
 * Generates a human-readable reason explaining whether a measurement
 * meets the given specification bounds.
 *
 * @param {boolean} spec - Whether the measurement meets the specification
 * @param {number} measurement - The actual measurement value
 * @param {number|string} lowerBound - Lower bound of the specification
 * @param {number|string} upperBound - Upper bound of the specification
 * @param {string} specType - The type of specification (e.g., "H8", "h9")
 * @returns {string} Reason describing compliance
 */
function generateReasonForSpecs(
  spec,
  measurement,
  lowerBound,
  upperBound,
  specType,
) {
  const formattedMeasurement = parseToFixedThreeString(measurement);
  if (spec) {
    return `${formattedMeasurement} falls between ${lowerBound} and ${upperBound}. So, the material meets ${specType} specification.`;
  } else {
    return `${formattedMeasurement} doesn't fall between ${lowerBound} and ${upperBound}. So, the material doesn't meet ${specType} specification.`;
  }
}

/**
 * Generates a human-readable reason explaining whether the
 * measurements meet the specified IT tolerance.
 *
 * @param {boolean} spec - Whether the tolerance condition is met
 * @param {number} measurement1 - First measurement value
 * @param {number} measurement2 - Second measurement value
 * @param {number|string} toleranceValue - IT tolerance limit
 * @param {string} toleranceType - Tolerance type (e.g., "IT5", "IT6")
 * @returns {string} Reason describing tolerance compliance
 */
function generateReasonForTolerances(
  spec,
  measurement1,
  measurement2,
  toleranceValue,
  toleranceType,
) {
  const diff1 = parseToFixedThreeString(measurement1);
  const diff2 = parseToFixedThreeString(measurement2);
  if (spec) {
    return `The difference between ${diff1} and ${diff2} is less than or equal to ${toleranceValue}. So, it meets ${toleranceType} Tolerance.`;
  } else {
    return `The difference between ${diff1} and ${diff2} is greater than ${toleranceValue}. So, it doesn't meet ${toleranceType} Tolerance.`;
  }
}

/**
 * Validates that the input is a non-empty array of measurements.
 *
 * @param {Array<number>} measurements - Array of measurements to validate
 * @returns {object|null} Returns error object if invalid, otherwise null
 */
function validateMeasurements(measurements) {
  if (!Array.isArray(measurements)) {
    return { error: "Measurements must be an array of numbers." };
  }

  if (measurements.length === 0) {
    return { error: "Measurements array cannot be empty." };
  }

  return null; // Valid
}

/** --- Helper Functions for checkMultipleMeasuremetsFor() end--- */

module.exports = {
  getAllTolerancesFor,
  getCamcoStandardTolerancesFor,
  checkOneMeasurementFor,
  checkMultipleMeasurementsFor,
};
