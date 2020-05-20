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
  registerCallback(events: string[], callback: (pullRequest: PullRequestInfo) => Promise<void>): void {
    events.forEach((eventName) => {
      if (!this.pulllRequesCallbacks.has(eventName)) {
        this.pulllRequesCallbacks.set(eventName, []);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.pulllRequesCallbacks.get(eventName)!.push(callback);
    });
  }

  async execute(payload: Webhooks.WebhookPayloadPullRequest): Promise<void> {
    const eventName = payload.action;

    const callbacks = this.pulllRequesCallbacks.get(eventName);
    if (callbacks) {
      const labels: string[] = payload.pull_request.labels.map((label) => label.name);

      const pullRequestInfo = this.pullRequestInfoBuilder
        .build()
        .withBody(payload.pull_request.body)
        .withNumber(payload.pull_request.number)
        .withOwner(payload.repository.owner.login)
        .withRepo(payload.repository.name)
        .withAuthor(payload.pull_request.user.login)
        .withLabels(labels)
        .withHtmlLink(payload.pull_request.html_url)
        .withMergingBranch(payload.pull_request.base.ref)
        .withMergedState(payload.pull_request.merged);

      await this.pullRequestInfoBuilder.resolve(pullRequestInfo);

      for await (const callback of callbacks) {
        callback(pullRequestInfo);
      }
    }
  }
}
