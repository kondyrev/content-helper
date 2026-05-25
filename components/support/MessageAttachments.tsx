"use client";

import { SupportAttachment } from "@/lib/support/types";

interface Props {
  attachments: SupportAttachment[];
}

function isImage(mimeType?: string | null) {
  return mimeType?.startsWith("image/");
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessageAttachments({ attachments }: Props) {
  if (!attachments.length) return null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      {attachments.map((attachment) => {
        const image = isImage(attachment.mime_type);

        if (image && attachment.signed_url) {
          return (
            <a
              key={attachment.id}
              href={attachment.signed_url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition hover:border-violet-400/40"
            >
              <img
                src={attachment.signed_url}
                alt={attachment.file_name}
                className="max-h-[280px] w-full rounded-t-2xl object-contain bg-black"
              />

              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {attachment.file_name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {formatFileSize(attachment.file_size)}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300">
                  🖼️
                </div>
              </div>
            </a>
          );
        }

        return (
          <a
            key={attachment.id}
            href={attachment.signed_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-400/40 hover:bg-white/[0.03]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300">
              📎
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">
                {attachment.file_name}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatFileSize(attachment.file_size)}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300">
              ⬇
            </div>
          </a>
        );
      })}
    </div>
  );
}