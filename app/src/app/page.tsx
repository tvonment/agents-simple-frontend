"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId: sessionId || undefined
        }),
      });

      const data = await res.json();

      if (data.chat) {
        setMessages(data.chat);
        // Store the session ID for subsequent requests
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: data.error,
            createdAt: new Date().toISOString()
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content: "Failed to send message. Please try again.",
          createdAt: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId("");
    setInput("");
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">AI Assistant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Azure AI Agent</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={startNewChat}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">Online</span>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Welcome to AI Assistant</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Start a conversation with our Azure AI agent. Ask questions, get help, or just chat!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start space-x-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user"
                      ? "bg-blue-600 ml-3"
                      : msg.role === "assistant"
                        ? "bg-green-600 mr-3"
                        : "bg-red-600 mr-3"
                    }`}>
                    {msg.role === "user" ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : msg.role === "assistant" ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5C3.498 18.333 4.46 20 6 20z" />
                      </svg>
                    )}
                  </div>

                  {/* Message */}
                  <div className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : msg.role === "assistant"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
                        : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 ${msg.role === "user"
                        ? "text-blue-100"
                        : "text-slate-500 dark:text-slate-400"
                      }`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={sendMessage} className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                className="w-full resize-none rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 min-h-[52px] max-h-32"
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-2xl px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
