import type { Message } from "@/types/konsil";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/utils/formatters";

export function MessageThread({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <div className="text-sm text-ink-500">Noch keine Nachrichten in diesem Konsil.</div>;
  }
  return (
    <div className="space-y-4">
      {messages.map((m) => {
        const isExpert = m.senderRole === "dermatologist";
        return (
          <div key={m.id} className="flex gap-3">
            <Avatar
              name={m.senderName}
              color={isExpert ? "bg-emerald-600" : "bg-brand-600"}
              size={32}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-ink-900">{m.senderName}</span>
                <span className="text-ink-500">·</span>
                <span className="text-ink-500">{formatDateTime(m.createdAt)}</span>
              </div>
              <div className="mt-1 rounded-lg bg-ink-50 border border-ink-100 px-3 py-2 text-sm text-ink-800 whitespace-pre-wrap">
                {m.body}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
