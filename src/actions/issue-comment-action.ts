import * as Webhooks from '@octokit/webhooks';

import { IssueCommentInfo } from '../info/issue-comment-info';
import { IssueCommentListener } from '../api/issue-comment-listener';
import { injectable, inject } from 'inversify';
import { AddReactionCommentHelper } from '../helpers/add-reaction-comment-helper';

@injectable()
export class IssueCommentAction implements IssueCommentListener {
  private issueCommands: Map<string, (issueCommentInfo: IssueCommentInfo) => Promise<void>>;

@inject(AddReactionCommentHelper)
private addReactionCommentHelper: AddReactionCommentHelper;

  constructor() {
    this.issueCommands = new Map();
  }

  /**
   * Add the callback provided by given command name
   */
  registerIssueCommentCommand(
    commandName: string,
    issueCommandInfo: (issueCommentInfo: IssueCommentInfo) => Promise<void>
  ): void {
    this.issueCommands.set(commandName, issueCommandInfo);
  }

  async execute(payload: Webhooks.WebhookPayloadIssueComment): Promise<void> {
    // check if body is in one ot the commands
    const commentBody = payload.comment.body;

    // only handle create and edit
    if (payload.action !== 'created' && payload.action !== 'edited') {
      return;
    }

    const commandName = commentBody.trim();

    const labels: string[] = payload.issue.labels.map((label) => label.name);

    const issueCommentInfo = new IssueCommentInfo(
      payload.issue.number,
      payload.repository.owner.login,
      payload.repository.name,
      labels,
      payload.comment.id
    );

    const command = this.issueCommands.get(commandName);
    if (command) {
      this.addReactionCommentHelper.addReaction('+1', issueCommentInfo);
      await command(issueCommentInfo);
    }
  }
}
