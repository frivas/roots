import type { ServerResponse } from 'node:http';
import type { IllustrationEventPublisher } from './illustration-jobs.js';

const channelKey = (ownerId: string, sessionId: string) =>
  `${ownerId.length}:${ownerId}${sessionId}`;

export class SessionEventRegistry implements IllustrationEventPublisher {
  private readonly connections = new Map<string, Set<ServerResponse>>();

  subscribe(ownerId: string, sessionId: string, response: ServerResponse) {
    const key = channelKey(ownerId, sessionId);
    const connections = this.connections.get(key) ?? new Set<ServerResponse>();
    connections.add(response);
    this.connections.set(key, connections);
  }

  unsubscribe(ownerId: string, sessionId: string, response: ServerResponse) {
    const key = channelKey(ownerId, sessionId);
    const connections = this.connections.get(key);
    connections?.delete(response);
    if (connections?.size === 0) {
      this.connections.delete(key);
    }
  }

  publish(
    ownerId: string,
    sessionId: string,
    event: {
      type: 'illustration-completed' | 'illustration-failed';
      jobId: string;
      imageUrl?: string;
      errorCode?: string;
    },
  ) {
    const connections = this.connections.get(channelKey(ownerId, sessionId));
    if (!connections) {
      return;
    }

    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const connection of connections) {
      try {
        connection.write(payload);
      } catch {
        this.unsubscribe(ownerId, sessionId, connection);
      }
    }
  }

  count(ownerId: string, sessionId: string) {
    return this.connections.get(channelKey(ownerId, sessionId))?.size ?? 0;
  }
}
