"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, CalendarHeart, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
    setSessionId(`session-${Date.now()}`); // Generate a completely fresh memory context on every page load
    // Add waitlist message on mount only
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content: "Hello! Welcome to Apex Dental Studio. How can I assist you today?\n\n[BUTTON: Book Appointment] [BUTTON: Reschedule] [BUTTON: Clinic Hours & Info] [BUTTON: Other]"
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      scrollToBottom();
    }
  }, [messages, mounted]);

  const sendTextToAPI = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the complete message history and the dynamic session ID
        body: JSON.stringify({ messages: [...messages, userMessage], sessionId })
      });

      const botText = await response.text();
      const botMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: botText };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "I am having trouble connecting to n8n. Please ensure the webhook is active!" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendTextToAPI(input);
  };

  const handleButtonClick = (buttonText: string) => {
    sendTextToAPI(buttonText);
  };

  // Parses and renders raw LLM text with proper line breaks, but checks for [BUTTON: ] tags to render actionable options.
  const renderMessageContent = (content: string) => {
    // Regex matches [BUTTON: text] and optionally removes leading bullets (- or 1.) and trailing newlines
    const buttonRegex = /(?:-\s*|\d+\.\s*)?\[BUTTON:\s*(.*?)\s*\]\s*\n?/g;
    let buttons: string[] = [];
    
    // Extract all button labels and remove them from the main text cleanly
    let cleanedText = content.replace(buttonRegex, (match, p1) => {
      buttons.push(p1);
      return ""; // completely erase the bullet and tag
    });
    
    // Clean up empty lines that might have been left over
    cleanedText = cleanedText.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{cleanedText.trim()}</span>
        
        {buttons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
            {buttons.map((btnLabel, i) => (
              <button 
                key={i} 
                onClick={() => handleButtonClick(btnLabel)} 
                className="ai-suggestion-button"
                disabled={isLoading}
              >
                {btnLabel}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="full-screen-center">
      <div className="app-container">
        
        {/* Left Side: Marketing / Pitch */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-premium"
          >
            Apex Dental <br />
            <span className="gradient-text">AI Assistant</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="subheading"
          >
            A fully autonomous agent that manages our calendar, answers questions, and schedules your visits securely 24/7.
          </motion.p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              { icon: <CalendarHeart color="var(--primary)" size={24} />, title: "Live Availability", desc: "Check real-time slots and book instantly." },
              { icon: <Bot color="var(--secondary)" size={24} />, title: "Autonomous Expert", desc: "Knowledgeable about all our dental services." },
              { icon: <ShieldCheck color="var(--accent)" size={24} />, title: "Private & Secure", desc: "Your data is handled with the highest standards." },
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + (idx * 0.1) }}
                style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}
              >
                <div style={{ background: "var(--surface)", padding: "12px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  {feature.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "4px" }}>
                    {feature.title}
                  </h4>
                  <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Agent Chat UI */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <div className="chat-container glass-panel">
            <div className="chat-header">
              <div className="chat-avatar">
                <Bot size={24} />
              </div>
              <div className="chat-titles">
                <h3>Apex Assistant</h3>
                <p><span className="online-dot"></span> Online and ready</p>
              </div>
            </div>

            <div className="chat-messages">
              <AnimatePresence initial={false}>
                {mounted && messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`message-bubble ${m.role === "user" ? "message-user" : "message-bot"}`}
                  >
                    {renderMessageContent(m.content)}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-bubble message-bot">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button type="submit" className="send-button" disabled={!input.trim() || isLoading}>
                  <Send size={18} style={{ marginLeft: "2px" }} />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
        
      </div>
    </main>
  );
}
