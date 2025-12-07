import './TesseractMesh.css';

export function TesseractMesh() {
  return (
    <div className="tesseract-mesh">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tesseractPattern" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect x="20" y="20" width="160" height="160" fill="none" stroke="rgba(102, 211, 250, 0.05)" strokeWidth="1"/>
            <rect x="60" y="60" width="80" height="80" fill="none" stroke="rgba(102, 211, 250, 0.05)" strokeWidth="1"/>
            <line x1="20" y1="20" x2="60" y2="60" stroke="rgba(102, 211, 250, 0.05)" strokeWidth="1"/>
            <line x1="180" y1="20" x2="140" y2="60" stroke="rgba(102, 211, 250, 0.05)" strokeWidth="1"/>
            <line x1="20" y1="180" x2="60" y2="140" stroke="rgba(102, 211, 250, 0.05)" strokeWidth="1"/>
            <line x1="180" y1="180" x2="140" y2="140" stroke="rgba(102, 211, 250, 0.05)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="2" fill="rgba(102, 211, 250, 0.08)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tesseractPattern)"/>
      </svg>
    </div>
  );
}
