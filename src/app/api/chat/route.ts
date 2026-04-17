import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    // Switched to production URL. 
    // n8n requires this URL to be used when the workflow is marked as "Active" in the top right corner.
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/dental-ai-chat";

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: lastMessage.content,
        // sessionID helps the n8n memory keep track of the conversation
        sessionId: "user-session-1234"
      }),
    });

    if (!response.ok) {
        let errorDetails = "";
        try {
           const errJson = await response.json();
           errorDetails = JSON.stringify(errJson);
        } catch(e) {}
        throw new Error(`n8n responded with status: ${response.status}. Details: ${errorDetails}`);
    }

    const data = await response.json();
    
    // n8n Webhook returns the AI's response in data.output 
    const botText = data.output || "I'm sorry, I received an empty response from the AI Agent.";

    // Return the response back to your beautiful Next.js UI
    return new Response(botText, {
        headers: { "Content-Type": "text/plain" }
    });

  } catch (error: any) {
    console.error("n8n Webhook Error:", error);
    return NextResponse.json(
      { error: "Failed to reach AI Agent", details: error.message },
      { status: 500 }
    );
  }
}
