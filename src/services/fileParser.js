async function readPdfFile(file) {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      disableWorker: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim();

      if (pageText) {
        pageTexts.push(pageText);
      }
    }

    const text = pageTexts.join("\n").trim();

    if (!text) {
      throw new Error(
        "Bu PDF taranmış olabilir. Lütfen metin içeren farklı bir PDF deneyin veya CV metnini manuel girin."
      );
    }

    return text;
  } catch (error) {
    console.error("PDF okuma hatası:", error);

    throw new Error(
      "Bu PDF taranmış olabilir. Lütfen metin içeren farklı bir PDF deneyin veya CV metnini manuel girin."
    );
  }
}

async function readDocxFile(file) {
  try {
    const mammothModule = await import("mammoth/mammoth.browser");
    const mammoth = mammothModule.default;
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    const text = value.trim();

    if (!text) {
      throw new Error(
        "Dosya okunamadı. Lütfen dosyayı kontrol edin veya CV metnini manuel girin."
      );
    }

    return text;
  } catch (error) {
    console.error("DOCX okuma hatası:", error);

    throw new Error(
      "Dosya okunamadı. Lütfen dosyayı kontrol edin veya CV metnini manuel girin."
    );
  }
}

export async function parseCvFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".pdf")) {
    return readPdfFile(file);
  }

  if (fileName.endsWith(".docx")) {
    return readDocxFile(file);
  }

  throw new Error("Desteklenmeyen dosya türü. Lütfen PDF veya DOCX yükleyin.");
}
