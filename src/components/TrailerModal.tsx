import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  trailerUrl: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  title,
  trailerUrl,
}) => {
  if (!isOpen) return null;

  // Extract YouTube ID if valid
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    } catch {}
    return null;
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="text-sm font-bold text-white truncate max-w-md">
              {title} – Official Trailer
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {trailerUrl && (
              <a
                href={trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8">
              <Play className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <p className="text-sm text-neutral-300 font-medium mb-4">
                Official high-definition teaser preview is available directly on YouTube.
              </p>
              <a
                href={trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/60 transition-all"
              >
                <span>Watch Trailer on YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
