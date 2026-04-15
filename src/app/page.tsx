"use client";

import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, CalendarHeart, ShieldCheck, User } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            {/* Header */}
            <div className="chat-header">
              <div className="chat-avatar">
                <Bot size={24} />
              </div>
              <div className="chat-titles">
                <h3>Apex Assistant</h3>
                <p><span className="online-dot"></span> Online and ready</p>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="message-bubble message-bot"
                  >
                    Hello! Welcome to Apex Dental Studio. How can I help you today?
                  </motion.div>
                )}
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`message-bubble ${m.role === "user" ? "message-user" : "message-bot"}`}
                  >
                    {m.content}
                    
                    {m.toolInvocations && m.toolInvocations.map((toolInvoc, idx) => (
                        <div key={idx} className="tool-indicator">
                          🛠️ {toolInvoc.toolName === 'checkAvailability' ? 'Checking calendar...' : 
                              toolInvoc.toolName === 'bookAppointment' ? 'Finalizing booking...' : 
                              `Running ${toolInvoc.toolName}...`}
                        </div>
                    ))}
                  </motion.div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === "user" && (
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

            {/* Input */}
            <div className="chat-input-area">
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask about dental services or booking..."
                  value={input || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button type="submit" className="send-button" disabled={!(input || "").trim() || isLoading}>
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
