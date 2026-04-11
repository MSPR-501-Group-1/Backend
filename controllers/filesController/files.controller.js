import * as filesService from "../../services/filesService/files.service.js";

export const downloadFile = async (req, res) => {
  try {
    const { type, filename } = req.params;

    console.log(`[FILES] Download request: type="${type}", filename="${filename}"`);
    
    const filePath = filesService.getFilePath(type, filename);
    console.log(`[FILES] Constructed path: ${filePath}`);

    if (!filesService.fileExists(filePath)) {
      console.log(`[FILES] File not found: ${filePath}`);
      return res.status(404).json({ error: "File not found" });
    }

    console.log(`[FILES] Serving file: ${filePath}`);
    return res.download(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};