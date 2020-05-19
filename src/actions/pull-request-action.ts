import * as Webhooks from '@octokit/webhooks';

import { PullRequestInfo, PullRequestInfoBuilder } from '../info/pull-request-info';
import { inject, injectable } from 'inversify';

import { PullRequestListener } from '../api/pull-request-listener';

@injectable()
export class PullRequestAction implements PullRequestListener {
  private pulllRequesCallbacks: Map<string, Array<(pullRequest: PullRequestInfo) => Promise<void>>>;

  @inject(PullRequestInfoBuilder)
  private pullRequestInfoBuilder: PullRequestInfoBuilder;

  constructor() {
    this.pulllRequesCallbacks = new Map();
  }

  /**
   * Add the callback provided by given action name
   */
  registerCallback(actionName: string, callback: (pullRequest: PullRequestInfo) => Promise<void>): void {
    if (!this.pulllRequesCallbacks.has(actionName)) {
      this.pulllRequesCallbacks.set(actionName, []);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.pulllRequesCallbacks.get(actionName)!.push(callback);
  }

  async execute(payload: Webhooks.WebhookPayloadPullRequest): Promise<void> {
    const eventName = payload.action;

    const callbacks = this.pulllRequesCallbacks.get(eventName);
    if (callbacks) {
      const labels: string[] = payload.pull_request.labels.map((label) => label.name);
      const issue = this.pullRequestInfoBuilder
        .build()
        .withNumber(payload.pull_request.number)
        .withOwner(payload.repository.owner.login)
        .withRepo(payload.repository.name)
        .withAuthor(payload.pull_request.user.login)
        .withLabels(labels)
        .withHtmlLink(payload.pull_request.html_url)
        .withMergingBranch(payload.pull_request.base.ref)
        .withMergedState(payload.pull_request.merged);

      for await (const callback of callbacks) {
        callback(issue);
      }
    }
  }
}
