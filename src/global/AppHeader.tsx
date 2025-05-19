import { useLocation } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { useCompletion } from "@/context/CompletionContext";
import SidebarButtonTrigger from "@/components/custom/SidebarButtonTrigger";
import { useSidebar } from "@/components/ui/sidebar";

const AppHeader = () => {
  const location = useLocation();
  const { open } = useSidebar();
  
  const useChatHolder = useChat();
  const useCompletionHolder = useCompletion();
  

  const isChat = location.pathname.startsWith("/chat");
  const { currentConversation } = isChat ? useChatHolder : useCompletionHolder;

  return (
    <header className="flex w-full bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-2 items-center min-h-14 gap-4 sticky top-0 z-10">
      {!open && <SidebarButtonTrigger />}
      <h1 className="font-semibold text-foreground/90">
        {currentConversation?.title}
      </h1>
    </header>
  );
};

export default AppHeader;
