import React from "react";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import SelectModel from "@/components/custom/SelectModel";
import { useLocalModel } from "@/hooks/useModels";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import ConversationView from "@/components/custom/CoversationView";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/global/AppHeader";
import CalculationSelector from "@/components/custom/CalculationSelector";

const Chat = () => {
  
  const navigate = useNavigate()
  const { id } = useParams<{id:string}>()
  
  const {model, models, setModel} = useLocalModel("completion-lab")
  
  const {
    input,
    setInput,
    handleSubmit,
    isLoading,
    getNewConversation,
    currentConversation,
    setCurrentId,
  } = useChat()

  const hasCreatedRef = React.useRef(false)
  React.useEffect(() => {
    if (!id && !hasCreatedRef.current) {
      hasCreatedRef.current = true
      const newId = getNewConversation() 
      navigate(`/chat/${newId}`)
    } else if (id) {
      setCurrentId(id)
    }
  },[id, navigate])

  const handleFormSubmit = (e: React.FormEvent) => {
    if (model){
      handleSubmit(e, model.name);
    }
  }

  if (!currentConversation) {
    return <div className="p-4">Conversation not found.</div>
  }

  const isActive = (!isLoading) && (input.trim() !== "") && model 

  
  return (
    <div className="flex flex-col h-screen bg-background/95">
      <Header />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <CalculationSelector />
          <ConversationView c={currentConversation} />
        </div>
      </div>

      <div className="border-t border-border/40 bg-background/95 backdrop-blur-sm p-4">
        <form onSubmit={handleFormSubmit} className="flex-col max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="bg-card/50 flex-1 mb-4 focus-visible:ring-primary/20 min-h-24 border border-border/50 rounded-lg shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
            disabled={isLoading}
          />
          <div className="flex justify-between gap-4">
            <SelectModel 
              model={model} 
              setModel={setModel} 
              models={models} 
              className="flex-1 focus:ring-primary/20 h-10 focus:outline-none bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm"
            />
          
            <Button
              className={`flex h-10 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md
                ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"}`}
              disabled={!isActive}
              type="submit"
            > 
              <span className="mr-2">Run</span>
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

}

export default Chat;
