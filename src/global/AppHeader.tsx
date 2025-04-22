
import { useLocation } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { useCompletion } from "@/context/CompletionContext";
import SidebarButtonTrigger from "@/components/custom/SidebarButtonTrigger";
import { useSidebar } from "@/components/ui/sidebar";
const AppHeader = () => {
  const location = useLocation();
  const {open} = useSidebar()

  const isChat = location.pathname.startsWith("/chat")
  const {currentConversation} = isChat ? useChat() : useCompletion()

  return (
    <header className="flex w-full bg-background border-b px-4 py-2 items-center min-h-14 gap-4">
      {!open && <SidebarButtonTrigger />}
      <h1 className="font-semibold">{currentConversation?.title}</h1>
    </header>
  );
};

export default AppHeader;
