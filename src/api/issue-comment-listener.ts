import { WebhookPayloadIssueComment } from '@octokit/webhooks';

export const IssueCommentListener = Symbol.for('IssueCommentListener');
export interface IssueCommentListener {
  execute(payload: WebhookPayloadIssueComment): Promise<void>;
}
