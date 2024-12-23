import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerWithMarker = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [markerColor, setMarkerColor] = useState("red");
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const colors = ["red", "blue", "green", "yellow", "black"];

  // Handle successful document load
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Keyboard navigation for page switching
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && pageNumber > 1) {
        setPageNumber((prev) => prev - 1);
      } else if (event.key === "ArrowRight" && pageNumber < numPages) {
        setPageNumber((prev) => prev + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pageNumber, numPages]);

  // Cleanup uploaded file on reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      setUploadedFile(null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Initialize drawing on the canvas
  useEffect(() => {
    if (!canvasRef.current) return; // Prevent accessing null canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const startDrawing = (event) => {
      isDrawing.current = true;
      ctx.beginPath();
      ctx.moveTo(
        event.nativeEvent.offsetX,
        event.nativeEvent.offsetY
      );
    };

    const draw = (event) => {
      if (!isDrawing.current) return;

      ctx.strokeStyle = markerColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineTo(
        event.nativeEvent.offsetX,
        event.nativeEvent.offsetY
      );
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing.current = false;
      ctx.closePath();
    };

    // Attach event listeners to the canvas
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, [markerColor]);

  return (
    <div>
      <header className="nav">
        <h1>PDF Viewer with Marker Tool</h1>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          style={{ marginBottom: "1rem" }}
        />
        <div>
          <button
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <button
            onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
          <span>
            Page {pageNumber} of {numPages || "?"}
          </span>
        </div>
        <div className="color-picker">
          <p>Select Marker Color:</p>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setMarkerColor(color)}
              style={{
                backgroundColor: color,
                border: markerColor === color ? "2px solid black" : "none",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                cursor: "pointer",
                margin: "0 5px",
              }}
            />
          ))}
        </div>
      </header>
      <main style={{ position: "relative" }}>
        {uploadedFile ? (
          <>
            <Document
              file={uploadedFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) =>
                console.error("Failed to load document: ", error)
              }
            >
              <Page
                pageNumber={pageNumber}
                renderMode="canvas"
                onRenderError={(error) =>
                  console.error("Error rendering page: ", error)
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
              width={800}
              height={1100}
            />
          </>
        ) : (
          <p>Please upload a PDF file to view its contents.</p>
        )}
      </main>
    </div>
  );
};

export default PDFViewerWithMarker;
