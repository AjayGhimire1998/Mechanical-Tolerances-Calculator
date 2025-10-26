const tolerances = require("./Tolerances.json");

function getAllTolerances(materialType) {
  const trimmedMaterialType = materialType.trim().toLowerCase();
  if (trimmedMaterialType.includes("housing")) {
    console.log();
    const data = tolerances["housingBores"];
    return data["H8"];
  }
}
module.exports = getAllTolerances;
