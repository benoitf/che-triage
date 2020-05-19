import { WebhookPayloadPullRequest } from '@octokit/webhooks';

export const PullRequestListener = Symbol.for('PullRequestListener');
export interface PullRequestListener {
  execute(payload: WebhookPayloadPullRequest): Promise<void>;
}
