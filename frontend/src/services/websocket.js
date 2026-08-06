// WebSocket real-time updates are disabled for Cloud Run compatibility.
// Cloud Run does not support persistent WebSocket connections (HTTP/2 based).
// Seat map updates are handled via periodic polling instead.

export class SeatWebSocketService {
  constructor(eventId, onMessageCallback) {
    this.eventId = eventId;
    this.onMessageCallback = onMessageCallback;
    this.pollingInterval = null;
  }

  connect() {
    // No-op: WebSocket not supported on Cloud Run.
    // EventDetailPage handles polling directly.
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
