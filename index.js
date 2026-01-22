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
          allTolerances,
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

function isValidMeasurement(measurement) {
  const num = parseFloat(measurement);
  return !isNaN(num) && num >= 0 && num < 1000;
}

function parseNominalFromMeasurement(
  measurement,
  materialType,
  THRESHOLD = 0.9,
) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }
  // For shafts: upper_deviation is 0, so measurement ≤ nominal
  // Therefore, nominal must be ceiling of measurement
  if (materialType === "shafts") {
    const standardNominal = Math.ceil(measurement); //a standard shaft will always have measurements less than the nominal

    //however, in some cases, we get shafts going beyond the upper deviation
    //so, we work with a threshold of 0.10 (meaning, a shaft can only go upto 0.10 of it's upper deviation)
    if (standardNominal - measurement >= THRESHOLD) {
      return Math.floor(measurement);
    }
    return Math.ceil(measurement);
  }

  // For bores: lower_deviation is 0, so measurement ≥ nominal
  // Therefore, nominal must be floor of measurement
  if (materialType === "housingBores" || materialType === "shellBores") {
    const standardNominal = Math.floor(measurement);

    return measurement - standardNominal >= THRESHOLD
      ? Math.ceil(measurement)
      : standardNominal;
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
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }
  const measure = parseStringFloat(measurement);
  const upper = parseStringFloat(bounds.upperBound);
  const lower = parseStringFloat(bounds.lowerBound);

  return measure >= lower && measure <= upper;
}

function processMeasurement(materialType, measurement, tolerances) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }
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
    config.rangeMatch,
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

  const specMeetingReason = generateReasonForSpecs(
    meetsSpec,
    measurement,
    computedBounds.lowerBound,
    computedBounds.upperBound,
  );

  const outcome =
    measurement > computedBounds.upperBound
      ? `${materialType} is over-sized.`
      : measurement >= computedBounds.lowerBound &&
          measurement <= computedBounds.upperBound
        ? `${materialType} is in acceptable size.`
        : `${materialType} is under-sized.`;

  return {
    measurement: parseStringFloat(measurement),
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

function processOneMeasurement(materialType, measurement, tolerances) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }
  const processedMeasurement = processMeasurement(
    materialType,
    measurement,
    tolerances,
  );
  return {
    ...processedMeasurement,
    meets_IT_tolerance: processedMeasurement.meets_specification.meetsSpec,
  };
}

function checkOneMeasurementFor(materialType, measurement) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }
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

  return processOneMeasurement(
    camcoStandardTolerances.type,
    measurement,
    camcoStandardTolerances,
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
function processIndividualMeasurement(materialType, measurement, tolerances) {
  if (!isValidMeasurement(measurement)) {
    return { error: "Measurement must be between 0 to 1000." };
  }
  const processedMeasurement = processMeasurement(
    materialType,
    measurement,
    tolerances,
  );
  return processedMeasurement;
}

function checkMultipleMeasurementsFor(materialType, measurements) {
  const validated = validateMeasurements(measurements);
  if (validated) {
    return validated;
  }

  const errors = [];

  measurements.forEach((m, index) => {
    if (!isValidMeasurement(m)) {
      errors.push({
        index,
        value: m,
        error: "Invalid measurement: must be 0–1000",
      });
    }
  });

  if (errors.length > 0) {
    return { error: "Some measurements are invalid.", details: errors };
  }

  const camcoStandardTolerances = getCamcoStandardTolerancesFor(materialType);

  let largestMeasurement = Math.max(...measurements);
  let smallestMeasurement = Math.min(...measurements);
  let ITDifference = parseToFixedThreeString(
    largestMeasurement - smallestMeasurement,
  );

  let mostFarMeasurement = largestMeasurement;
  const nominals = {};
  let count = 0;
  let withInSpecs = [];
  const results = measurements.map((measurement) => {
    const result = processIndividualMeasurement(
      camcoStandardTolerances.type,
      measurement,
      camcoStandardTolerances,
    );
    withInSpecs.push(result.meets_specification.meetsSpec);
    nominals[result.nominal] = count++;

    if (
      Math.abs(result.nominal - result.measurement) >
      Math.abs(result.nominal - mostFarMeasurement)
    ) {
      mostFarMeasurement = result.measurement;
    }

    return result;
  });

  let countOfMostOccuredNominal = Math.max(...Object.values(nominals));

  let mostOccuredNominal = Object.keys(nominals).find(
    (nominal) => nominals[nominal] === countOfMostOccuredNominal,
  );

  const baseSpec = results.find(
    (result) => result.nominal === parseInt(mostOccuredNominal),
  );
  const baseITValue = baseSpec.matched_spec[baseSpec.IT_grade];

  const meetsIT = ITDifference <= baseITValue;
  const itMeetingReason = generateReasonForTolerances(
    meetsIT,
    largestMeasurement,
    smallestMeasurement,
    baseITValue,
  );

  const meetsSpec = withInSpecs.every((v) => v === true);
  const specMeetingReason = generateReasonForSpecs(
    meetsSpec,
    mostFarMeasurement,
    baseSpec.computed_specification_bounds.lowerBound,
    baseSpec.computed_specification_bounds.upperBound,
  );

  const isOverSized =
    mostFarMeasurement > baseSpec.computed_specification_bounds.upperBound;
  const isWithinSizeRange =
    mostFarMeasurement <= baseSpec.computed_specification_bounds.upperBound &&
    mostFarMeasurement >= baseSpec.computed_specification_bounds.lowerBound;
  const outcome =
    (isWithinSizeRange
      ? `${materialType} is acceptable in size`
      : isOverSized
        ? `${materialType} is over-sized`
        : `${materialType} is under-sized`) +
    (isWithinSizeRange && meetsIT
      ? `, and `
      : !meetsIT && isWithinSizeRange
        ? `, but `
        : `, and `) +
    (meetsIT ? `meets IT tolerance.` : `doesn't meet IT tolerance.`);
  return {
    ...baseSpec,
    measurement: measurements,
    meets_specification: { meetsSpec, reason: specMeetingReason },
    meets_IT_Tolerance: { meetsIT, reason: itMeetingReason },
    meets_final_compliance: meetsIT === true && meetsSpec === true,
  };
}

function generateReasonForSpecs(spec, measurement, base1, base2) {
  if (spec === true) {
    return `${parseToFixedThreeString(
      measurement,
    )} falls between ${base1} and ${base2}`;
  }
  return `${parseToFixedThreeString(
    measurement,
  )} doesn't fall between ${base1} and ${base2}`;
}

function generateReasonForTolerances(spec, measurement1, measurement2, base) {
  if (spec === true) {
    return `The difference between ${parseToFixedThreeString(
      measurement1,
    )} and ${parseToFixedThreeString(
      measurement2,
    )} is less than or equal to ${base}.`;
  }
  return `The difference between ${parseToFixedThreeString(
    measurement1,
  )} and ${parseToFixedThreeString(measurement2)} is greater than ${base}.`;
}

function validateMeasurements(measurements) {
  if (!Array.isArray(measurements)) {
    return {
      error: "Measurements must be an array of numbers",
    };
  }

  if (measurements.length === 0) {
    return {
      error: "Measurements array cannot be empty",
    };
  }

  return null;
}

module.exports = {
  getAllTolerancesFor,
  getCamcoStandardTolerancesFor,
  checkOneMeasurementFor,
  checkMultipleMeasurementsFor,
};
