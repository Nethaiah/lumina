import { isToday, isYesterday, subDays } from "date-fns"
import { Conversation } from "@/api/types"
import { Content } from "@radix-ui/react-dialog";
type Content = {
  text: string;
  type: "think" | "markdown"
}
export const splitTextByContentType = (text:string):Content[] =>  {
  let processingText = text
  if (processingText.includes("<think>") && !processingText.includes("</think>")) {
    processingText = processingText + "</think>"
  }

  const regex = /<think>([\s\S]*?)<\/think>/g;
  const parts:Content[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(processingText)) !== null) {
    const [fullMatch, thinkContent] = match;
    const index = match.index;
    if (index > lastIndex) {
      parts.push({ type: "markdown", text: processingText.slice(lastIndex, index) });
    }
    parts.push({ type: "think", text: thinkContent.trim() });
    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < processingText.length) {
    parts.push({ type: "markdown", text: processingText.slice(lastIndex) });
  }

  return parts;
}
export const removeThinkBlocks = (text: string) => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '');
};

export enum ConversationGroup {
  TODAY = "Today",
  YESTERDAY = "Yesterday",
  LAST_7_DAYS = "Last 7 Days",
  LAST_30_DAYS = "Last 30 Days",
  OLDER = "Older",
}


export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export function groupConversations(conversatins:Conversation[]) {
  const groups: Record<ConversationGroup, Conversation[]> = {
    [ConversationGroup.TODAY]: [],
    [ConversationGroup.YESTERDAY]: [],
    [ConversationGroup.LAST_7_DAYS]: [],
    [ConversationGroup.LAST_30_DAYS]: [],
    [ConversationGroup.OLDER]: [],
  };

  const now = new Date()
  for (const conv of conversatins) {
    const createdAt = new Date(conv.created_at) 
    if (isToday(createdAt)) {
      groups[ConversationGroup.TODAY].push(conv)
    } else if (isYesterday(createdAt)) {
      groups[ConversationGroup.YESTERDAY].push(conv)
    } else if (createdAt > subDays(now, 7)) {
      groups[ConversationGroup.LAST_7_DAYS].push(conv)
    } else if (createdAt < subDays(now, 30)) {
      groups[ConversationGroup.LAST_30_DAYS].push(conv)
    } else {
      groups[ConversationGroup.OLDER].push(conv)
    }
  }

  return groups;
}

