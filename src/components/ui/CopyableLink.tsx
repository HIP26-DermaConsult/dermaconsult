import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "./Button";

/** Read-only link field with a copy-to-clipboard button. */
export function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be unavailable; the link stays selectable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0 flex items-center gap-2 h-10 px-3 rounded-md border border-ink-200 bg-ink-50 text-sm text-ink-700">
        <Link2 className="w-4 h-4 text-ink-400 shrink-0" />
        <span className="truncate font-mono text-xs" title={url}>
          {url}
        </span>
      </div>
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        {copied ? "Kopiert" : "Kopieren"}
      </Button>
    </div>
  );
}
