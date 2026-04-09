import * as filesService from "../../services/filesService/files.service.js";

export const downloadFile = async (req, res) => {
  try {
    const { type, filename } = req.params;

    const filePath = filesService.getFilePath(type, filename);

    if (!filesService.fileExists(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.download(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};