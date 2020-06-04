import { inject, injectable, named } from 'inversify';

import { Context } from '@actions/github/lib/context';
import { Handler } from '../api/handler';
import { IssueCommentListener } from '../api/issue-comment-listener';
import { MultiInjectProvider } from '../api/multi-inject-provider';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { WebhookPayloadIssueComment } from '@octokit/webhooks';

@injectable()
export class IssueCommentHandler implements Handler {
  @inject(MultiInjectProvider)
  @named(IssueCommentListener)
  protected readonly issueCommentListeners: MultiInjectProvider<IssueCommentListener>;

  supports(eventName: string): boolean {
    return 'issue_comment' === eventName;
  }

  async handle(eventName: string, context: Context, webhookPayLoad: WebhookPayload): Promise<void> {
    //

    // cast payload
    const issuePayLoad = webhookPayLoad as WebhookPayloadIssueComment;

    await Promise.all(this.issueCommentListeners.getAll().map(async listener => listener.execute(issuePayLoad)));
  }
}
