import React from "react"
import {v4 as uuidv4} from "uuid"
import { 
  Message, 
  Conversation, 
  CalculationData, 
  GenerateChatReq, 
  GenerateChatRes,
  GenerateCompletionReq
} from "@/api/types";
import { ref, get } from "firebase/database";
import { database } from "@/firebase";
import { fetchGenerateChatStream } from "@/api/generate-stream";
import { fetchGenerateCompletion } from "@/api/generate";
import { logger } from "@/utils/logger";
import { removeThinkBlocks } from "@/utils";

const STORAGE_KEY = "chat-conversations";

interface ChatContextType {
  conversations: Conversation[];
  currentId: string | null;
  setCurrentId: (id: string) => void;
  addMessageToCurrent: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  getNewConversation: () => string;
  clearConversations: () => void;
  getCurrentConversation: () => Conversation | null;
  currentConversation: Conversation | null;
  deleteConversation: (id: string) => void;

  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent, modelName: string) => Promise<void>;
  isLoading: boolean;
  
  // Calculation related fields
  userCalculations: CalculationData[];
  selectedCalculation: CalculationData | null;
  setSelectedCalculation: (calc: CalculationData | null) => void;
  fetchUserCalculations: () => Promise<void>;
  calculationsLoading: boolean;
  calculationsError: string | null;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [conversations, setConversations] = React.useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved): [];
  });
  const [currentId, setCurrentId] = React.useState<string|null>(null);
  const [input, setInput] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  
  // New calculation states
  const [userCalculations, setUserCalculations] = React.useState<CalculationData[]>([]);
  const [selectedCalculation, setSelectedCalculation] = React.useState<CalculationData | null>(null);
  const [calculationsLoading, setCalculationsLoading] = React.useState<boolean>(false);
  const [calculationsError, setCalculationsError] = React.useState<string | null>(null);

  const fetchUserCalculations = async () => {
    const userId = localStorage.getItem("uid");
    if (!userId) {
      setCalculationsError("Please sign in to view your calculations");
      return;
    }

    setCalculationsLoading(true);
    setCalculationsError(null);

    try {
      const calculationsRef = ref(database, `users/${userId}/calculations`);
      const snapshot = await get(calculationsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object of objects to array
        const calculationsArray = Object.entries(data).map(([id, calc]: [string, any]) => ({
          id,
          ...calc
        }));
        setUserCalculations(calculationsArray);
      } else {
        setUserCalculations([]);
      }
    } catch (error) {
      console.error("Error fetching calculations:", error);
      setCalculationsError("Failed to load calculations. Please try again.");
    } finally {
      setCalculationsLoading(false);
    }
  };

  React.useEffect(() => {
    localStorage.setItem("chat-conversations", JSON.stringify(conversations));
  },[conversations])
  
  // Fetch calculations when component mounts or when user signs in
  React.useEffect(() => {
    const userId = localStorage.getItem("uid");
    if (userId) {
      fetchUserCalculations();
    }
  }, []); // Only run once on mount

  // Clear calculations when user signs out
  React.useEffect(() => {
    const unsubscribe = () => {
      const userId = localStorage.getItem("uid");
      if (!userId) {
        setUserCalculations([]);
        setSelectedCalculation(null);
      }
    };

    window.addEventListener("storage", unsubscribe);
    return () => window.removeEventListener("storage", unsubscribe);
  }, []);
  
  const getCurrentConversation = ():Conversation | null => {
    return conversations.find((c:Conversation) => c.id === currentId) || null;
  }

  const deleteConversation = (id:string) => {
    setConversations((prevConvs) => prevConvs.filter((c:Conversation) => c.id !== id))
  }

  const renameConversation = (id:string, newTitle: string) => {
    setConversations((prevConvs) =>
      prevConvs.map((c) =>
        c.id === id ? { ...c, title: newTitle, updated_at: Date.now() } : c
      )
    );
  }

  const getNewConversation = ():string => {
    // check if currntly have any empty Conversation
    let emptConv:Conversation = conversations.filter((c:Conversation) => c.messages.length === 0)[0]
    if (!emptConv) {
      const id = uuidv4()
      emptConv = {
        id,
        title: "New Converation",
        messages:[],
        created_at: Date.now(),
        updated_at: Date.now(),
      }
      setConversations((prev:Conversation[]) => [emptConv, ...prev])
    }else{
      emptConv.created_at = Date.now()
      emptConv.updated_at = Date.now()
    }
    setCurrentId(emptConv.id)
    return emptConv.id
  }

  const addMessageToCurrent = (message: Message) => {
    setConversations((prev:Conversation[]) => 
      prev.map((conv:Conversation) => {
        if (conv.id === currentId) {
          return {...conv, messages: [...conv.messages, message], updated_at: Date.now()}
        }else {
          return conv
        } 
      })
    )
  }
  const updateLastAssistantMessage = (content: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== currentId) return conv;
        const updated = [...conv.messages];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + content,
            updated_at: Date.now(),
          };
        }
        return { ...conv, messages: updated, updated_at: Date.now() };
      })
    );
  };  const clearConversations = () => {
    setConversations([]);
    setCurrentId(null)    
  }

  // Fetch calculations when component mounts
  React.useEffect(() => {
    fetchUserCalculations();
  }, []);

  

  // Fetch calculations when component mounts
  React.useEffect(() => {
    fetchUserCalculations();
  }, []);
  // Handle chat submissions with calculation context
  const handleSubmitWithCalculation = async (e: React.FormEvent, modelName: string) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !modelName) return;

    // Create user message
    const userMessage: Message = {
      role: "user",
      content: input,
      creator: "user",
      created_at: Date.now(),
      updated_at: Date.now()
    };

    // Get current conversation messages
    const conv = getCurrentConversation();
    const currentMessages = conv?.messages || [];

    // Build the messages array
    const messages: Message[] = [];
    
    // Add initial system prompt for first message in conversation
    if (currentMessages.length === 0 && selectedCalculation) {
      // Create a summary of appliances and their costs
      const applianceSummary = selectedCalculation.appliances
        .map(app => `- ${app.name}: ${app.watt}W, ${app.hours}h/day, ${app.days.length} days/week, ₱${(app.costPerWeek * 4).toFixed(2)}/month`)
        .join('\n');

      const systemMessage: Message = {
        role: "system",
        content: `You are an energy consumption analyst reviewing the following electricity calculation:

Monthly Total Cost: ₱${selectedCalculation.totalCost.toFixed(2)}
Daily Usage Cost: ₱${selectedCalculation.totalCostPerDay.toFixed(2)}
Weekly Usage Cost: ₱${selectedCalculation.totalCostPerWeek.toFixed(2)}
Number of Appliances: ${selectedCalculation.appliances.length}

Appliance Details:
${applianceSummary}

Your role is to:
1. Analyze consumption patterns and identify high-consumption appliances
2. Provide specific recommendations for reducing electricity usage
3. Estimate potential cost savings for each recommendation
4. Suggest energy-efficient alternatives for high-consumption appliances
5. Share best practices for efficient appliance usage

Please provide practical, actionable advice with specific references to the appliances and costs shown above.`,
        creator: "system",
        created_at: Date.now(),
        updated_at: Date.now()
      };
      messages.push(systemMessage);
    }

    // Add existing conversation messages
    messages.push(...currentMessages);

    // Add the new user message
    messages.push(userMessage);

    // Generate a title for new conversation
    if (currentMessages.length === 0) {
      try {
        const reqTitle: GenerateCompletionReq = {
          prompt: input,
          model: modelName,
          stream: false,
          system: "You are a tool that receives an input and responds exclusively with a 2-5 word summary of the topic based on the words used in the input. Return only the summary, no additional text.",
        };

        await fetchGenerateCompletion(
          reqTitle,
          (resp: string) => {
            if (currentId) {
              const title = removeThinkBlocks(resp);
              renameConversation(currentId, title);
            }
          },
          (error: unknown) => {
            logger.error("Error generating title:", error);
          }
        );
      } catch (error) {
        logger.error("Error in title generation:", error);
      }
    }

    // Prepare chat request
    const chatRequest: GenerateChatReq = {
      model: modelName,
      messages: messages,
      stream: true
    };

    setIsLoading(true);
    setInput("");

    try {
      // Add user message to conversation
      addMessageToCurrent(userMessage);

      // Create assistant message placeholder
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        creator: "assistant",
        created_at: Date.now(),
        updated_at: Date.now()
      };
      addMessageToCurrent(assistantMessage);

      // Stream the response
      await fetchGenerateChatStream(
        chatRequest,
        (response: GenerateChatRes) => {
          if (response.message?.content) {
            updateLastAssistantMessage(removeThinkBlocks(response.message.content));
          }
          if (response.done) {
            setIsLoading(false);
          }
        },
        (error: unknown) => {
          console.error('Error in chat generation:', error);
          updateLastAssistantMessage("I apologize, but I encountered an error while processing your request. Please try again.");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error in chat generation:', error);
      updateLastAssistantMessage("I apologize, but I encountered an error while processing your request. Please try again.");
      setIsLoading(false);
    }
  };

  const value = {
    conversations,
    currentConversation: getCurrentConversation(),
    currentId,
    setCurrentId,
    addMessageToCurrent,
    updateLastAssistantMessage,
    getNewConversation,
    clearConversations,
    getCurrentConversation,
    deleteConversation,

    setInput,
    input,
    handleSubmit: handleSubmitWithCalculation,
    isLoading,

    // Add new calculation-related values
    userCalculations,
    selectedCalculation,
    setSelectedCalculation,
    fetchUserCalculations,
    calculationsLoading,
    calculationsError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
