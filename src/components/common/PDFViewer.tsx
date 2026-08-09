import React, { useState } from 'react';
import { FileText, Download, Maximize2, Minimize2, X, ExternalLink } from 'lucide-react';

/**
 * PDFViewer — Renders a PDF inline using the browser's native PDF viewer.
 * Falls back to a download link if embedding isn't supported.
 *
 * Props:
 *  url      — URL to the PDF file
 *  title    — Optional title to display above the viewer
 *  height   — Height of the viewer (default: '600px')
 *  onClose  — Optional callback to close/dismiss the viewer
 */
const PDFViewer = ({ url, title, height = '600px', onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loadError, setLoadError] = useState(false);

    if (!url) {
        return (
            <div className="flex items-center justify-center p-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
                <FileText size={24} className="mr-2" />
                No file to display
            </div>
        );
    }

    // Ensure absolute URL
    const fileUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const isPDF = url.toLowerCase().endsWith('.pdf');

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = title || 'assignment';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
                {/* Fullscreen toolbar */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-900">
                    <div className="flex items-center gap-3 text-white">
                        <FileText size={20} />
                        <span className="font-medium text-sm truncate max-w-md">
                            {title || 'Document'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm transition-colors">
                            <Download size={14} /> Download
                        </button>
                        <button onClick={() => window.open(fileUrl, '_blank')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm transition-colors">
                            <ExternalLink size={14} /> Open
                        </button>
                        <button onClick={() => setIsFullscreen(false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm transition-colors">
                            <Minimize2 size={14} /> Exit
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    {isPDF ? (
                        <iframe
                            src={`${fileUrl}#toolbar=1&navpanes=1`}
                            className="w-full h-full border-0"
                            title={title || 'PDF Viewer'}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <img src={fileUrl} alt={title} className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                    <FileText size={18} className="text-indigo-600" />
                    <span className="font-medium text-sm truncate max-w-xs">
                        {title || 'Document'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={handleDownload}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                        title="Download">
                        <Download size={14} />
                    </button>
                    <button onClick={() => window.open(fileUrl, '_blank')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                        title="Open in new tab">
                        <ExternalLink size={14} />
                    </button>
                    <button onClick={() => setIsFullscreen(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                        title="Fullscreen">
                        <Maximize2 size={14} />
                    </button>
                    {onClose && (
                        <button onClick={onClose}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs font-medium transition-colors"
                            title="Close">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isPDF && !loadError ? (
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    style={{ height }}
                    className="w-full border-0"
                    title={title || 'PDF Viewer'}
                    onError={() => setLoadError(true)}
                />
            ) : !isPDF && (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                <div className="flex items-center justify-center p-4 bg-gray-50" style={{ maxHeight: height }}>
                    <img src={fileUrl} alt={title} className="max-w-full max-h-full object-contain rounded" />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                    <FileText size={48} className="mb-4 opacity-30" />
                    <p className="font-medium mb-2">Unable to preview this file</p>
                    <button onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
                        <Download size={16} /> Download File
                    </button>
                </div>
            )}
        </div>
    );
};

export default PDFViewer;
