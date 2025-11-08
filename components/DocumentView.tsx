import React from 'react';
import { Document } from '../types';
import { PdfIcon, DocxIcon, XlsxIcon, PptxIcon, LinkIcon, BackIcon, VideoIcon } from './icons/Icons';

interface DocumentViewProps {
  document: Document | null;
  onBack: () => void;
  isMobile: boolean;
}

const AttachmentIcon: React.FC<{ type: string }> = ({ type }) => {
    switch(type) {
        case 'pdf': return <PdfIcon className="h-6 w-6 text-red-500" />;
        case 'docx': return <DocxIcon className="h-6 w-6 text-blue-500" />;
        case 'xlsx': return <XlsxIcon className="h-6 w-6 text-green-500" />;
        case 'pptx': return <PptxIcon className="h-6 w-6 text-orange-500" />;
        case 'video': return <VideoIcon className="h-6 w-6 text-purple-500" />;
        default: return <LinkIcon className="h-6 w-6 text-gray-500" />;
    }
};

const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return match[2];
    }
    return null;
};


const DocumentView: React.FC<DocumentViewProps> = ({ document, onBack, isMobile }) => {
  if (!document) {
    return (
      <section className="flex-1 bg-white p-8 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <h2 className="text-2xl font-semibold">Chọn một tài liệu</h2>
          <p>Chọn một tài liệu từ danh sách để đọc nội dung.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
        {isMobile && (
            <button 
                onClick={onBack} 
                className="flex items-center mb-6 text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] font-semibold"
            >
                <BackIcon className="h-5 w-5 mr-2"/>
                Quay lại danh sách
            </button>
        )}
      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{document.title}</h1>
        <p className="text-sm text-gray-500 mb-6">Cập nhật lần cuối: {document.lastUpdated}</p>

        <div 
          className="prose max-w-none prose-h2:text-[var(--color-primary-800)] prose-a:text-[var(--color-primary-600)] hover:prose-a:text-[var(--color-primary-800)]" 
          dangerouslySetInnerHTML={{ __html: document.content }} 
        />

        {document.attachments.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tệp đính kèm</h3>
            <ul className="space-y-4">
              {document.attachments.map((file) => {
                if (file.type === 'video') {
                  const videoId = extractYouTubeId(file.url);
                  const isUploadedVideo = file.url.startsWith('data:video');
                  const isDirectVideoLink = /\.(mp4|webm|ogv)$/i.test(file.url);

                  // Render YouTube player
                  if (videoId) {
                    return (
                      <li key={file.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          <AttachmentIcon type={file.type} />
                          <span className="ml-4 font-medium text-gray-700">{file.name}</span>
                        </div>
                        <div className="relative" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-md"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={file.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </li>
                    );
                  }

                  // Render local video player for uploaded files or direct links
                  if (isUploadedVideo || isDirectVideoLink) {
                     return (
                      <li key={file.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          <AttachmentIcon type={file.type} />
                          <span className="ml-4 font-medium text-gray-700">{file.name}</span>
                        </div>
                        <video
                          controls
                          src={file.url}
                          className="w-full max-h-[480px] rounded-md bg-black"
                          title={file.name}
                        >
                          Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                      </li>
                    );
                  }
                }

                // Default attachment link for other types or non-embeddable videos
                return (
                  <li key={file.name}>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <AttachmentIcon type={file.type} />
                      <span className="ml-4 font-medium text-gray-700">{file.name}</span>
                      <LinkIcon className="h-5 w-5 text-gray-400 ml-auto" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </article>
    </section>
  );
};

export default DocumentView;