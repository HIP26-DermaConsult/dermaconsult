import type { TimelineEvent } from "@/types/konsil";
import { formatDateTime } from "@/utils/formatters";
import { CheckCircle2, Circle, MessageSquare, Send, Eye, HelpCircle, Lock, Plus } from "lucide-react";

const ICONS = {
  created: Plus,
  submitted: Send,
  assigned: Eye,
  in_review: Eye,
  rueckfrage: HelpCircle,
  answered: CheckCircle2,
  closed: Lock,
  message: MessageSquare,
  note: Circle,
} as const;

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-4 relative pl-6">
      <div className="absolute left-[10px] top-1 bottom-1 w-px bg-ink-200" />
      {events.map((e) => {
        const Icon = ICONS[e.type] ?? Circle;
        return (
          <li key={e.id} className="relative">
            <div className="absolute -left-[18px] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-brand-500 grid place-items-center">
              <Icon className="w-3 h-3 text-brand-700" />
            </div>
            <div className="pl-2">
              <div className="text-sm text-ink-800">{e.description}</div>
              <div className="text-xs text-ink-500 mt-0.5">
                {e.by} · {formatDateTime(e.at)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
