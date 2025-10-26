const tolerances = require("./Tolerances.json");

function getAllTolerances(materialType) {
  if (
    materialType === undefined ||
    materialType === null ||
    materialType.trim() === ""
  ) {
    throw new Error("Material type is required and cannot be empty.");
  }
  const trimmedMaterialType = materialType.trim().toLowerCase();
  if (trimmedMaterialType.includes("housing")) {
    return tolerances["housingBores"];
  } else if (trimmedMaterialType.includes("shaft")) {
    return tolerances["shafts"];
  } else if (trimmedMaterialType.includes("shell")) {
    return tolerances["shell"];
  } else {
    throw new Error(
      `Unknown material type: ${materialType}. Valid types are 'housing', 'shaft', or 'shell'.`
    );
  }
}
module.exports = getAllTolerances;
