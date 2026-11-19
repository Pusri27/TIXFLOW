// Real-time seat map updates use periodic HTTP polling for free-tier serverless compatibility.

export class SeatWebSocketService {
  constructor(eventId, onMessageCallback) {
    this.eventId = eventId;
    this.onMessageCallback = onMessageCallback;
    this.pollingInterval = null;
  }

  connect() {
    // No-op: EventDetailPage handles periodic seat-map polling directly.
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
