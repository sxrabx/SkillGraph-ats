import React, { useState, useEffect, useRef } from 'react';

export default function PdfViewer({ 
  url, 
  title = "Resume Document", 
  onClose = null,
  isFullscreen = false 
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [viewMode, setViewMode] = useState('continuous'); // 'continuous' | 'single'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef(null);

  // Extract clean filename and API base
  const filename = url ? url.split('/').pop().split('?')[0].split('#')[0] : '';
  const apiBase = url && url.startsWith('http') ? new URL(url).origin : 'http://127.0.0.1:8000';

  // Load document pages directly via server renderer (ZERO auto-downloads, ZERO black screens)
  useEffect(() => {
    if (!filename) return;

    setLoading(true);
    setError(null);
    setPages([]);
    setNumPages(0);
    setCurrentPage(1);

    const infoUrl = `${apiBase}/api/pdf/pages/${filename}`;

    fetch(infoUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch document pages`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.pages && data.pages.length > 0) {
          setPages(data.pages);
          setNumPages(data.total_pages || data.pages.length);
          setLoading(false);
        } else {
          throw new Error("No pages available for this candidate");
        }
      })
      .catch((err) => {
        console.error("Document stream load error:", err);
        setError("Unable to display document stream. Please verify backend is running.");
        setLoading(false);
      });
  }, [filename, apiBase]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      if (containerWidth > 300) {
        const fitScale = containerWidth / 612;
        setScale(Math.max(0.6, Math.min(fitScale, 1.8)));
      }
    }
  };

  // MANUAL DOWNLOAD ONLY: Triggered ONLY when the user clicks the Download button
  const handleManualDownload = async (e) => {
    e.preventDefault();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const downloadUrl = `${apiBase}/api/pdf/${filename}`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Download request failed");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename || 'annotated_resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Manual download error:", err);
      alert("Could not download file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`pdf-viewer-root ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* TOOLBAR */}
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-group">
          <span className="pdf-doc-badge">⚡ Interactive Viewer</span>
          <span className="pdf-title">{title}</span>
        </div>

        <div className="pdf-toolbar-group">
          {/* View Mode Toggle */}
          <button 
            type="button"
            className={`btn-pdf-tool ${viewMode === 'continuous' ? 'active' : ''}`}
            onClick={() => setViewMode((prev) => (prev === 'continuous' ? 'single' : 'continuous'))}
            title="Toggle Continuous / Single Page"
          >
            {viewMode === 'continuous' ? '📜 Continuous' : '📄 Single Page'}
          </button>

          {/* Page Selector for Single Page */}
          {viewMode === 'single' && (
            <div className="pdf-page-controls">
              <button 
                type="button"
                className="btn-pdf-tool" 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ◀
              </button>
              <span className="pdf-page-indicator">
                {currentPage} / {numPages}
              </span>
              <button 
                type="button"
                className="btn-pdf-tool" 
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              >
                ▶
              </button>
            </div>
          )}

          {viewMode === 'continuous' && (
            <span className="pdf-page-indicator">
              Total {numPages} {numPages === 1 ? 'Page' : 'Pages'}
            </span>
          )}

          {/* Zoom Controls */}
          <div className="pdf-zoom-controls">
            <button type="button" className="btn-pdf-tool" onClick={handleZoomOut} title="Zoom Out">－</button>
            <span className="pdf-zoom-val">{Math.round(scale * 100)}%</span>
            <button type="button" className="btn-pdf-tool" onClick={handleZoomIn} title="Zoom In">＋</button>
            <button type="button" className="btn-pdf-tool" onClick={handleFitWidth} title="Fit Width">Fit</button>
          </div>

          {/* MANUAL DOWNLOAD BUTTON: ONLY downloads when clicked! */}
          <button 
            type="button"
            className="btn-pdf-tool btn-pdf-download"
            onClick={handleManualDownload}
            disabled={isDownloading}
            title="Download annotated PDF to your computer"
          >
            {isDownloading ? "⏳ Saving..." : "📥 Download PDF"}
          </button>

          {/* Close button if in modal */}
          {onClose && (
            <button type="button" className="btn-pdf-close" onClick={onClose} title="Close">✕</button>
          )}
        </div>
      </div>

      {/* DOCUMENT PAGES DISPLAY */}
      <div className="pdf-canvas-container" ref={containerRef}>
        {loading && (
          <div className="pdf-status-box">
            <div className="pdf-spinner"></div>
            <p>Loading candidate resume highlights...</p>
          </div>
        )}

        {error && (
          <div className="pdf-status-box error">
            <p>⚠️ {error}</p>
            <button 
              type="button" 
              className="btn-pdf-tool"
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </button>
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <div className="pdf-pages-track">
            {viewMode === 'continuous' ? (
              pages.map((pagePath, index) => (
                <div key={index} className="pdf-page-card">
                  <div className="pdf-page-num-tag">Page {index + 1} of {numPages}</div>
                  <img 
                    src={`${apiBase}${pagePath}`}
                    alt={`Page ${index + 1}`}
                    className="pdf-page-img"
                    style={{
                      width: `${Math.round(595 * scale)}px`,
                      display: 'block',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="pdf-page-card">
                <div className="pdf-page-num-tag">Page {currentPage} of {numPages}</div>
                {pages[currentPage - 1] && (
                  <img 
                    src={`${apiBase}${pages[currentPage - 1]}`}
                    alt={`Page ${currentPage}`}
                    className="pdf-page-img"
                    style={{
                      width: `${Math.round(595 * scale)}px`,
                      display: 'block',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
