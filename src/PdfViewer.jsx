import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css"; //Required for annotation layer
// import "react-pdf/dist/esm/Page/TextLayer.css";

// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = () => {
  const pdfRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function handleRenderError(err) {
    console.error("Error rendering:", err);
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && pageNumber > 1) {
        setPageNumber(pageNumber - 1);
      } else if (event.key === "ArrowRight" && pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pageNumber, numPages]);

  return (
    <div ref={pdfRef}>
      <div className="nav">
        <h1>PDF Viewer</h1>
        <button onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber <= 1}>
          Previous
        </button>
        <button onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber >= numPages}>
          Next
        </button>
        <span>
          Page {pageNumber} of {numPages}
        </span>
      </div>
      <Document
        file={import.meta.env.VITE_PDF_ADDRESS}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => console.error("Failed to load document: ", error)}
      >
        <Page
          pageNumber={pageNumber}
          renderMode="canvas"
          onRenderError={handleRenderError}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};

export default PDFViewer;
