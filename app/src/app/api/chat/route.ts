import { NextRequest, NextResponse } from 'next/server';
import { AIProjectsClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';

// In-memory storage for thread IDs (in production, use a database)
const sessionThreads = new Map<string, string>();

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json();

  // Generate a session ID if not provided
  const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // TODO: Move these to environment variables for production
  const connectionString = "swedencentral.api.azureml.ms;6c446ac5-664e-4b5d-b45a-64211c7a689e;mf-fabriccon-2024;fabcon24";
  const agentId = "asst_ns0kEr00K5NG9rYLl50nTCP3";

  try {
    const client = AIProjectsClient.fromConnectionString(connectionString, new DefaultAzureCredential());
    const agent = await client.agents.getAgent(agentId);

    // Get or create thread for this session
    let threadId = sessionThreads.get(currentSessionId);
    let thread;

    if (!threadId) {
      // Create a new thread for this session
      thread = await client.agents.createThread();
      threadId = thread.id;
      sessionThreads.set(currentSessionId, threadId);
    } else {
      // Use existing thread
      thread = await client.agents.getThread(threadId);
    }

    await client.agents.createMessage(thread.id, {
      role: 'user',
      content: message,
    });

    let run = await client.agents.createRun(thread.id, agent.id);

    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await client.agents.getRun(thread.id, run.id);
    }

    const messages = await client.agents.listMessages(thread.id);
    const chat = messages.data.reverse().map((dataPoint: any) => ({
      id: dataPoint.id,
      role: dataPoint.role,
      content: dataPoint.content.filter((c: any) => c.type === 'text').map((c: any) => c.text.value).join('\n'),
      createdAt: dataPoint.createdAt,
    }));

    return NextResponse.json({
      chat,
      sessionId: currentSessionId,
      threadId: threadId
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
