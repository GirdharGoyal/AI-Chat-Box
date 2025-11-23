import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  text: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakText = (text: string) => {
    if (!autoSpeak) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { text: messageText, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: { message: messageText },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        text: data.message,
        isUser: false,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      speakText(data.message);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-background/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Virtual AI Chat Box</h1>
              <p className="text-sm text-primary-foreground/80">
                {isSpeaking ? "Speaking..." : "Ready to help"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (!autoSpeak) {
                toast({
                  title: "Voice enabled",
                  description: "The assistant will now speak responses",
                });
              } else {
                window.speechSynthesis.cancel();
                toast({
                  title: "Voice disabled",
                  description: "The assistant will no longer speak",
                });
              }
            }}
            className="hover:bg-primary-foreground/20"
          >
            {autoSpeak ? (
              <Volume2 className="w-6 h-6 text-primary-foreground" />
            ) : (
              <VolumeX className="w-6 h-6 text-primary-foreground" />
            )}
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto  p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Hello! I'm your virtual assistant
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything and I'll respond with voice!
                </p>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg.text}
              isUser={msg.isUser}
              isSpeaking={!msg.isUser && idx === messages.length - 1 && isSpeaking}
            />
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg animate-pulse-glow">
                <span className="text-lg">🤔</span>
              </div>
              <div className="bg-card rounded-2xl px-4 py-3 border border-border">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-background/80 backdrop-blur-sm border-t border-border">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
