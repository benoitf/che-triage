import { WebhookPayloadIssues } from '@octokit/webhooks';

export const IssueListener = Symbol.for('IssueListener');
export interface IssueListener {
  execute(payload: WebhookPayloadIssues): Promise<void>;
}
