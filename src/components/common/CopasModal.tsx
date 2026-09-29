import React, { useState } from 'react';
import { X, Copy, Check, Share2, FileText, Smartphone } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatter';
import { useToast } from './Toast';

interface CopasModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  waText: string;
  docText?: string;
  categoryName?: string;
}

export const CopasModal: React.FC<CopasModalProps> = ({
  isOpen,
  onClose,
  title,
  waText,
  docText,
  categoryName = 'Konten'
}) => {
  const [activeTab, setActiveTab] = useState<'wa' | 'doc'>('wa');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const currentContent = activeTab === 'wa' ? waText : (docText || waText);

  const handleCopy = async () => {
    const success = await copyToClipboard(currentContent);
    if (success) {
      setCopied(true);
      showToast('📋 Berhasil disalin ke clipboard! Siap dipaste ke WA/Dokumen.', 'copas');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(waText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Copy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                Salin Cepat (COPAS) {categoryName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100/70 border-b border-slate-200">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('wa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'wa'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Format WhatsApp (Bintang/Bold)
            </button>
            {docText && (
              <button
                onClick={() => setActiveTab('doc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'doc'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Format Word / Docs Bersih
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            By : Dzakirul Husni | MIN 1 Paser
          </span>
        </div>

        {/* Content Preview Box */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
          {currentContent}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Kirim ke WhatsApp
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : '📋 Salin ke Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
