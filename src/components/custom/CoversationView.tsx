import React from "react";
import { Conversation, Message } from "@/api/types";
import { Bot } from "lucide-react";
import MessageView from "./MessageView";

const ConversationView = ({ c }: { c: Conversation | null }) => {
  const messagesEndRef = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current && c && c.messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [c?.messages]);

  if (!c) return null;

  if (c.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full">
        <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg flex flex-col items-center">
          <Bot className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-lg font-medium text-foreground">
            No messages yet
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Start a conversation by typing a message below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="my-4 flex flex-col gap-8 mx-auto max-w-7xl">
      {c.messages.map((m: Message, index) => (
        <li key={index} className="relative">
          <div className="absolute -left-4 w-[2px] h-full bg-border/30" />
          <MessageView m={m} />
        </li>
      ))}
      <li ref={messagesEndRef}></li>
    </ol>
  );
};

export default ConversationView;
