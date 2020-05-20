import * as Webhooks from '@octokit/webhooks';

import { IssueInfo, IssueInfoBuilder } from '../info/issue-info';
import { inject, injectable } from 'inversify';

import { IssueListener } from '../api/issue-listener';

@injectable()
export class IssueAction implements IssueListener {
  private issueCallbacks: Map<string, Array<(issue: IssueInfo) => Promise<void>>>;

  @inject(IssueInfoBuilder)
  private issueInfoBuilder: IssueInfoBuilder;

  constructor() {
    this.issueCallbacks = new Map();
  }

  /**
   * Add the callback provided by given event name
   */
  registerCallback(events: string[], callback: (issueInfo: IssueInfo) => Promise<void>): void {
    events.forEach((eventName) => {
      if (!this.issueCallbacks.has(eventName)) {
        this.issueCallbacks.set(eventName, []);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.issueCallbacks.get(eventName)!.push(callback);
    });
  }

  async execute(payload: Webhooks.WebhookPayloadIssues): Promise<void> {
    const eventName = payload.action;
    const callbacks = this.issueCallbacks.get(eventName);

    if (callbacks) {
      const issueInfo = this.issueInfoBuilder.build().withPayLoadIssues(payload);
      for await (const callback of callbacks) {
        callback(issueInfo);
      }
    }
  }
}
