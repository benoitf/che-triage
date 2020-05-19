import { inject, injectable, named } from 'inversify';

import { Handler } from '../api/handler';
import { IssueListener } from '../api/issue-listener';
import { MultiInjectProvider } from '../api/multi-inject-provider';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { WebhookPayloadIssues } from '@octokit/webhooks';

@injectable()
export class IssueHandler implements Handler {
  @inject(MultiInjectProvider)
  @named(IssueListener)
  protected readonly issueListeners: MultiInjectProvider<IssueListener>;

  supports(eventName: string): boolean {
    return 'issues' === eventName;
  }

  async handle(eventName: string, webhookPayLoad: WebhookPayload): Promise<void> {
    //

    // cast payload
    const issuePayLoad = webhookPayLoad as WebhookPayloadIssues;

    await Promise.all(this.issueListeners.getAll().map(async (listener) => listener.execute(issuePayLoad)));
  }
}
