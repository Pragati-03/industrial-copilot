import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  FileType,
  File as FileIcon,
  Trash2,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DocumentRecord } from "@/lib/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function iconForExtension(ext: string) {
  const e = ext.toLowerCase();
  if (e === ".pdf") return FileText;
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(e)) return ImageIcon;
  if (e === ".docx") return FileType;
  return FileIcon;
}

interface DocumentsListProps {
  documents: DocumentRecord[];
  onDelete: (id: number) => Promise<void>;
}

export function DocumentsList({ documents, onDelete }: DocumentsListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Uploaded Documents</CardTitle>
        <CardDescription>
          {documents.length} file{documents.length === 1 ? "" : "s"} in the library
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet. Drag files above to get started.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const Icon = iconForExtension(doc.extension);
              const isDeleting = deletingId === doc.id;
              return (
                <div key={doc.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {doc.original_filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(doc.size_bytes)} · {formatDate(doc.uploaded_at)}
                    </p>
                  </div>
                  <Badge variant="success" className="hidden shrink-0 sm:inline-flex">
                    {doc.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${doc.original_filename}`}
                    disabled={isDeleting}
                    onClick={() => handleDelete(doc.id)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}