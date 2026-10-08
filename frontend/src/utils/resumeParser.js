import * as pdfjsLib from 'pdfjs-dist';

// Set up worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/**
 * Reads a File and returns its ArrayBuffer.
 */
function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract plain text from a PDF file using pdfjs-dist.
 */
async function extractPdfText(file) {
  const buffer = await readFileAsBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

/**
 * Extract plain text from a DOCX file using mammoth.
 */
async function extractDocxText(file) {
  const mammoth = (await import('mammoth')).default;
  const buffer = await readFileAsBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

/**
 * Main entry point. Extracts text from PDF or DOCX.
 * Returns { text, error }.
 */
export async function extractResumeText(file) {
  try {
    const ext = file.name.split('.').pop().toLowerCase();
    let text = '';

    if (ext === 'pdf') {
      text = await extractPdfText(file);
    } else if (ext === 'docx' || ext === 'doc') {
      text = await extractDocxText(file);
    } else {
      return { text: '', error: 'Unsupported file type. Use PDF or DOCX.' };
    }

    if (!text || text.length < 50) {
      return { text: '', error: 'Could not extract meaningful text from the file. Please ensure it is not image-based.' };
    }

    return { text, error: null };
  } catch (err) {
    console.error('Resume extraction error:', err);
    return { text: '', error: 'Failed to read the file. It may be corrupted or password-protected.' };
  }
}
