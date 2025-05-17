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

  
  return (    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-y-auto p-4">
        <CalculationSelector />
        <ConversationView c={currentConversation} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleFormSubmit} className="flex-col">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="bg-white flex-1 mb-4 focus-visible:ring-0 min-h-24"
            disabled={isLoading}
          />
          <div className="flex justify-between gap-4">
            <SelectModel 
              model={model} 
              setModel={setModel} 
              models={models} 
              className="flex-1 focus:ring-0 h-10 focus:outline-none"
            />
          
            <Button
              className={`flex bg-gray-300 text-gray-600 h-10 p-4 
                ${isActive ? "bg-cyan-500 text-white": ""}`}
              disabled={!isActive}
              type="submit"
            > 
              <span className="">Run</span>
              <span className={`py-0.5 px-2 border-gray-400 border-1 
                flex justify-center items-center rounded-sm ${isActive ? "border-white": ""}`}>
                <CornerDownLeft className="" />  
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

}

export default Chat;
