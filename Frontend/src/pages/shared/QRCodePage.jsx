import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MdDownload, MdOpenInNew } from 'react-icons/md';

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeEzTFhy6hDg_UkAWjpqi-bln6B3PgpNE80mQ5YrF3wkycl3Q/viewform?usp=header';

function QRCodePage() {
  const svgRef = useRef(null);

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diacare-feedback-qr.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-lg text-center space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-[#0f172a]">Feedback Form</h1>
          <p className="text-sm text-[#64748b]">Scan to open the DiaCare feedback form</p>
        </div>

        {/* QR Code */}
        <div ref={svgRef} className="flex justify-center">
          <div className="rounded-2xl border-4 border-[#2563EB]/10 p-3 bg-white">
            <QRCodeSVG
              value={FORM_URL}
              size={220}
              bgColor="#ffffff"
              fgColor="#1e3a5f"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* URL preview */}
        <p className="break-all rounded-xl bg-[#f1f5f9] px-3 py-2 text-[11px] text-[#64748b] font-mono">
          {FORM_URL}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] py-2.5 text-sm font-semibold text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <MdDownload size={16} /> Download
          </button>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
          >
            <MdOpenInNew size={16} /> Open form
          </a>
        </div>
      </div>
    </div>
  );
}

export default QRCodePage;
