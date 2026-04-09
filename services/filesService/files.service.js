import path from "path";
import fs from "fs";

const BASE_DIR = "/data/processed";

// Map pipeline types to ETL entity names
const PIPELINE_TYPE_MAP = {
  exercises: "exercise",
  nutrition: "ingredient",
};

// Helper to distribute files
export const getFilePath = (type, filename) => {
  // Map the pipeline type to the ETL entity name
  const entityName = PIPELINE_TYPE_MAP[type] || type;
  
  // Construct the filename with the correct entity name and .csv extension
  const fullFilename = `${entityName}_${filename}.csv`;
  
  return path.join(BASE_DIR, type, fullFilename);
};

export const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};