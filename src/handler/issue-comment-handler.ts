import { injectable, multiInject, optional } from 'inversify';

import { Handler } from '../api/handler';
import { IssueCommentListener } from '../api/issue-comment-listener';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { WebhookPayloadIssueComment } from '@octokit/webhooks';

@injectable()
export class IssueCommentHandler implements Handler {
  @optional()
  @multiInject(IssueCommentListener)
  protected readonly issueCommentListeners: IssueCommentListener[];

  supports(eventName: string): boolean {
    return 'issue_comment' === eventName;
  }

  async handle(eventName: string, webhookPayLoad: WebhookPayload): Promise<void> {
    //

    // cast payload
    const issuePayLoad = webhookPayLoad as WebhookPayloadIssueComment;

    await Promise.all(this.issueCommentListeners.map(async (listener) => listener.execute(issuePayLoad)));
  }
}
