import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { AppError } from "../errors/AppError";
import { ALLOWED_DOC_MIME, type DocFileType } from "../config/constants";

const extractPdf = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
};

const extractDocx = async (buffer: Buffer): Promise<string> => {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
};

// Extracts plain text from an uploaded file buffer based on its mime type.
export const extractText = async (
  buffer: Buffer,
  mimeType: string,
): Promise<{ text: string; fileType: DocFileType }> => {
  const fileType = ALLOWED_DOC_MIME[mimeType];
  if (!fileType) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "Only PDF, DOCX, TXT, and MD files are supported",
      400,
    );
  }

  let text: string;
  if (fileType === "pdf") {
    text = await extractPdf(buffer);
  } else if (fileType === "docx") {
    text = await extractDocx(buffer);
  } else {
    text = buffer.toString("utf-8");
  }

  if (!text.trim()) {
    throw new AppError(
      "EMPTY_DOCUMENT",
      "Could not extract any text from the document",
      400,
    );
  }

  return { text, fileType };
};
