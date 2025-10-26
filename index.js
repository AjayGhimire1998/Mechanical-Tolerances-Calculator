const tolerances = require("./Tolerances.json");

function getAllTolerances(materialType) {
  if (
    materialType === undefined ||
    materialType === null ||
    materialType.trim() === ""
  ) {
    return { error: "Material type is required and cannot be empty." };
  }
  const trimmedMaterialType = materialType.trim().toLowerCase();
  if (trimmedMaterialType.includes("housing")) {
    return { housingBoresTolerances: tolerances["housingBores"] };
  } else if (trimmedMaterialType.includes("shaft")) {
    return { shaftTolerances: tolerances["shafts"] };
  } else if (trimmedMaterialType.includes("shell")) {
    return { shellBoreTolerances: tolerances["shell"] };
  } else {
    return {
      error: `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`,
    };
  }
}
module.exports = getAllTolerances;
