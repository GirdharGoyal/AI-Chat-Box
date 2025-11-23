import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isSpeaking?: boolean;
}

const ChatMessage = ({ message, isUser, isSpeaking }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg",
          isSpeaking && "animate-pulse-glow"
        )}>
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3 shadow-lg",
          isUser
            ? "bg-gradient-accent text-primary-foreground"
            : "bg-card text-card-foreground border border-border"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
