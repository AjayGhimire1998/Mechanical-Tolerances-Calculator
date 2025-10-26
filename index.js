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
  if (typeof materialType !== "string") {
    return { error: "Material type must be a string." };
  }

  if (
    materialType === undefined ||
    materialType === null ||
    materialType.trim() === ""
  ) {
    return { error: "Material type is required and cannot be empty." };
  }

  const trimmedMaterialType = materialType.trim().toLowerCase();
  if (trimmedMaterialType.includes("housing")) {
    return { type: "housing bore", specifications: tolerances["housingBores"] };
  } else if (trimmedMaterialType.includes("shaft")) {
    return { type: "shaft", specifications: tolerances["shafts"] };
  } else if (trimmedMaterialType.includes("shell")) {
    return { type: "shell", specifications: tolerances["shell"] };
  } else {
    return {
      error: `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`,
    };
  }
}

module.exports = { getAllTolerancesFor };
