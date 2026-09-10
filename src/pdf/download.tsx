import type { TripPdfData } from "@/lib/trip-pdf";

/**
 * Builds the PDF in the browser and hands it to the download. The renderer
 * and the document are fetched on the first click, not with the page: they
 * are the largest thing the site can load, and most visits never ask for
 * them. The fonts come from this origin and are fetched by the renderer the
 * same way.
 */
export async function downloadTripPdf(data: TripPdfData, fileName: string): Promise<void> {
  const [{ pdf }, { TripDocument, registerPdfFonts }] = await Promise.all([import("@react-pdf/renderer"), import("./TripDocument")]);
  registerPdfFonts(`${window.location.origin}/fonts/pdf/`);
  const blob = await pdf(<TripDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Long enough for a slow browser to start the download before the URL goes.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
