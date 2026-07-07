import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".docx", ".txt"];

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export function Dropzone({ onFilesSelected }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((file) => {
        const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
        return ACCEPTED_EXTENSIONS.includes(ext);
      });
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
        isDragging ? "border-accent bg-accent/5" : "border-border bg-secondary/30 hover:bg-secondary/50"
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Drag & drop files here, or <span className="text-primary underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, TXT, and images — up to 50MB each
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}