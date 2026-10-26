import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, RefreshCw, CheckCircle2, File } from 'lucide-react';
import Badge from '../ui/Badge';

export const Step3SupportingDocs = ({ watch, setValue }) => {
  const uploadedFiles = watch('uploadedFiles') || [];

  const onDrop = useCallback(
    (acceptedFiles) => {
      const formatted = acceptedFiles.map((file) => ({
        id: 'file_' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        rawSize: file.size,
        type: file.type,
        fileObject: file,
        progress: 100,
        status: 'Uploaded',
      }));

      setValue('uploadedFiles', [...uploadedFiles, ...formatted], { shouldValidate: true });
    },
    [uploadedFiles, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 25 * 1024 * 1024, // 25MB limit
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
    },
  });

  const handleRemoveFile = (fileId) => {
    const updated = uploadedFiles.filter((f) => f.id !== fileId);
    setValue('uploadedFiles', updated, { shouldValidate: true });
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return <ImageIcon className="w-5 h-5 text-secondary-light" />;
    return <FileText className="w-5 h-5 text-primary-light" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-card-border/60 pb-3">
        <h2 className="text-lg font-bold text-text-main">Step 3: Supporting Technical Documents</h2>
        <p className="text-xs text-text-muted">
          Attach technical diagrams, claim drafts, flowcharts, or research papers (PDF, DOCX, PNG up to 25MB).
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary bg-primary/10 shadow-glow-primary'
            : 'border-card-border/80 hover:border-primary/50 bg-[#0F172A]/80'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 rounded-2xl bg-card border border-card-border flex items-center justify-center mx-auto mb-3 text-primary-light shadow-md">
          <UploadCloud className="w-7 h-7 animate-bounce" />
        </div>

        <h3 className="text-sm font-bold text-text-main mb-1">
          {isDragActive ? 'Drop technical files here...' : 'Drag & drop technical documents here'}
        </h3>
        <p className="text-xs text-text-muted mb-4">
          or click to browse from your computer (Max file size: 25 MB)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-text-subtle">
          <span className="px-2 py-0.5 rounded bg-card border border-card-border">PDF</span>
          <span className="px-2 py-0.5 rounded bg-card border border-card-border">DOCX</span>
          <span className="px-2 py-0.5 rounded bg-card border border-card-border">PNG / JPG</span>
          <span className="px-2 py-0.5 rounded bg-card border border-card-border">Max 25MB</span>
        </div>
      </div>

      {/* Uploaded Files List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
          Attached Documents ({uploadedFiles.length})
        </h4>

        {uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-xl glass-card border border-card-border flex items-center justify-between gap-4 animate-fadeIn"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-card-border">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-main truncate">{file.name}</p>
                    <p className="text-[10px] text-text-subtle font-mono">{file.size} • Uploaded</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                  </Badge>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-card-border/60 text-center text-xs text-text-subtle">
            No supporting files uploaded yet. (Optional, but recommended for claim verification).
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3SupportingDocs;
