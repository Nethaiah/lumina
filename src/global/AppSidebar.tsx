import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Conversation } from "@/api/types";
import { useChat } from "@/context/ChatContext";
import { useLocation, useNavigate } from "react-router-dom";
import { groupConversations } from "@/utils";
import SidebarConversationItem from "@/components/custom/SidbarConversationItem";
import { useCompletion } from "@/context/CompletionContext";
import { Trash2Icon, MessageSquarePlus, Sparkles, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LuminaLogo } from "@/assets";
import SidebarButtonTrigger from "@/components/custom/SidebarButtonTrigger";
import { auth } from "@/firebase";
import { Separator } from "@/components/ui/separator";

const AppSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate();

  const isChat = location.pathname.startsWith("/chat")
  const rootPath = isChat ? "chat" : "completion"

  const {
    conversations, 
    clearConversations, 
    deleteConversation,
    getNewConversation,
  } = isChat ? useChat() : useCompletion()

  const grouped = groupConversations(conversations)

  const handleClearConveration = () => {
    clearConversations()
    handleNewConverstion()
  }

  const handleNewConverstion = () => {
    const newId = getNewConversation()
    navigate(`/${rootPath}/${newId}`)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Clear localStorage
      localStorage.clear();
      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
   <Sidebar className="bg-background" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="px-4 py-3 mb-2">
        <div className="flex items-center justify-between">
          <span className="flex gap-1" >
            <img src={LuminaLogo} />
            <h2 className="text-lg font-semibold text-cyan-700">Lumina</h2>
          </span>
          <SidebarButtonTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={isChat ? () => navigate("/completion") : () => navigate("/chat")}
          >
            {isChat ? <Sparkles className="h-4 w-4" /> : <MessageSquare /> } 
            Go to {isChat ? "Completion": "Chat"}
          </Button>
        </div>

        <div className="p-2">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleNewConverstion}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New {isChat ? "Chat" : "Completion"} 
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-13rem)]">
          <SidebarMenu className="p-2">
            {Object.entries(grouped).map(([label,items]) => items.length > 0 && (
                <div key={label} className="mb-2">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">{label}</div> 
                    {items.map((c:Conversation) => {
                      return (
                        <SidebarConversationItem 
                          key={c.id}
                          c={c}
                          root={rootPath}
                          isActive={location.pathname === `/${rootPath}/${c.id}`}
                          onDelete={deleteConversation}
                        />
                    )
                  })}
                </div>
              )
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <AlertDialog>
          <AlertDialogTrigger >
            <div 
            role="button"
              className="w-full flex justify-center items-center gap-2 cursor-pointer border-1 rounded-md p-1.5 capitalize text-orange-500 hover:text-orange-600 hover:bg-orange-50"
            >
              <Trash2Icon className="!h-4 !w-4" />
              clear all
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-orange-500" 
                onClick={() => handleClearConveration()}
              >Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost" 
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar;
