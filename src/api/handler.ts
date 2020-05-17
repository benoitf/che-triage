import { WebhookPayload } from '@actions/github/lib/interfaces';

export const Handler = Symbol.for('Handler');
export interface Handler {
  supports(eventName: string): boolean;

  handle(eventName: string, webhookPayLoad: WebhookPayload): Promise<void>;
}
