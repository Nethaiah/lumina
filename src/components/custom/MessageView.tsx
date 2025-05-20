import { Message } from "@/api/types";
import { Bot, Copy, User } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import MarkdownView from "./MarkdownView";

const MessageView = ({ m }: { m: Message | null }) => {
  const { copy, isCopied } = useClipboard();

  if (!m) return null;

  const isUser = m.role === "user";

  return (
    <div
      className={`group flex items-start gap-4 ${isUser ? "justify-end" : ""}`}
    >
      <div
        className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm ${
            isUser
              ? "bg-primary border-primary/10"
              : "bg-secondary border-border/50"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-secondary-foreground" />
          )}
        </div>

        <div
          className={`flex-1 space-y-2 overflow-hidden ${
            isUser ? "text-start" : ""
          }`}
        >
          <div
            className={`rounded-lg p-4 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 backdrop-blur-sm border border-border/50 text-card-foreground"
            }`}
          >
            <MarkdownView text={m.content} />
          </div>

          <button
            onClick={() => copy(m.content)}
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? "float-left" : "float-right"
            } text-xs text-muted-foreground hover:text-foreground flex items-center gap-1`}
          >
            <Copy className="h-3 w-3" />
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageView;
