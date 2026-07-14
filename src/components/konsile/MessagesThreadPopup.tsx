import { Dispatch, SetStateAction, useState } from "react";
import { MessageSquare, MessageSquarePlus, Send, X } from "lucide-react";
import type { Message } from "@/types/konsil";
import { MessageThread } from "./MessageThread";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

type FloatingMessagesProps = {
    messages: Message[];
    description?: string;
    reply: string;
    setReply: Dispatch<SetStateAction<string>>;
    sending: boolean;
    onSend: () => Promise<void>;
    closed?: boolean;
};

export function FloatingMessages({
                                     messages,
                                     description,
                                     reply,
                                     setReply,
                                     sending,
                                     onSend,
                                     closed = false,
                                 }: FloatingMessagesProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-700"
            >
                <MessageSquare className="h-4 w-4" />
                Nachrichten

                {messages.length > 0 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-700">
            {messages.length}
          </span>
                )}
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                        <div>
                            <h3 className="font-semibold text-ink-900">Kommunikation</h3>
                            {description && (
                                <p className="text-xs text-ink-500">{description}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="max-h-[45vh] overflow-y-auto p-4">
                        <MessageThread messages={messages} />
                    </div>

                    {!closed && (
                        <div className="border-t border-ink-100 p-4 space-y-2">
                            <Textarea
                                rows={3}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Antwort oder Zusatzinformation an die Dermatologie…"
                            />

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setReply("")} disabled={!reply}>
                                    <MessageSquarePlus className="w-4 h-4" />
                                    Verwerfen
                                </Button>

                                <Button onClick={onSend} loading={sending} disabled={!reply.trim()}>
                                    <Send className="w-4 h-4" />
                                    Senden
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}