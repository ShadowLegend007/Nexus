import React, { useEffect, useState, useCallback } from 'react';
import { getConversationDocuments } from '../../api/messages';
import { FolderOpen, FileText, Image as ImageIcon, Video, Music, File, X, Download, Eye } from 'lucide-react';
import { formatBytes } from '../../utils/fileValidator';
import toast from 'react-hot-toast';

const FILE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'audio', label: 'Audio' },
  { id: 'pdf', label: 'Docs' },
];

function typeIcon(type, size = 16) {
  if (type === 'image') return <ImageIcon size={size} className="text-blue-400" />;
  if (type === 'video') return <Video size={size} className="text-pink-400" />;
  if (type === 'audio') return <Music size={size} className="text-green-400" />;
  if (type === 'pdf' || type === 'word' || type === 'ppt' || type === 'excel') return <FileText size={size} className="text-orange-400" />;
  return <File size={size} className="text-purple-400" />;
}

export function DocsPanel({ conversationId, onClose }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const loadDocs = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const data = await getConversationDocuments(conversationId);
      setDocs(data || []);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const filtered = activeTab === 'all'
    ? docs
    : docs.filter(d => {
        if (activeTab === 'pdf') return ['pdf', 'word', 'ppt', 'excel', 'other'].includes(d.contentType);
        return d.contentType === activeTab;
      });

  const handleDownload = (e, url, name) => {
    e.preventDefault();
    const a = document.createElement('a');
    a.href = url; a.download = name; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const images = filtered.filter(d => d.contentType === 'image');
  const others = filtered.filter(d => d.contentType !== 'image');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FolderOpen size={18} className="text-purple-400" />
          Media, Links & Docs
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {FILE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && docs.length > 0 && (
              <span className="ml-1.5 bg-purple-500/30 text-purple-300 text-[9px] px-1.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <FolderOpen size={36} className="text-white/20" />
            <p className="text-white/50 text-sm">No files in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Photo grid */}
            {images.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Photos</p>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                  {images.map(doc => (
                    <div key={doc._id} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                      <img src={doc.fileUrl} alt={doc.fileName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40 transition-colors">
                          <Eye size={12} className="text-white" />
                        </a>
                        <button onClick={(e) => handleDownload(e, doc.fileUrl, doc.fileName)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40 transition-colors">
                          <Download size={12} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File list */}
            {others.length > 0 && (
              <div className="space-y-2">
                {images.length > 0 && <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Files</p>}
                {others.map(doc => (
                  <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                    <div className="p-2.5 bg-white/10 rounded-xl flex-shrink-0">
                      {typeIcon(doc.contentType, 18)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{doc.fileName || 'Attachment'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/40">{formatBytes(doc.fileSize || 0)}</span>
                        <span className="text-[10px] text-white/30">·</span>
                        <span className="text-[10px] text-white/40">
                          {new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-colors">
                        <Eye size={14} />
                      </a>
                      <button onClick={(e) => handleDownload(e, doc.fileUrl, doc.fileName)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-colors">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DocsPanel;
