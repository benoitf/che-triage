import * as Webhooks from '@octokit/webhooks';

import { IssueCommentInfo, IssueCommentInfoBuilder } from '../info/issue-comment-info';
import { inject, injectable } from 'inversify';

import { AddReactionCommentHelper } from '../helpers/add-reaction-comment-helper';
import { IssueCommentListener } from '../api/issue-comment-listener';

@injectable()
export class IssueCommentAction implements IssueCommentListener {
  private issueCommands: Map<string, (issueCommentInfo: IssueCommentInfo) => Promise<void>>;

  @inject(IssueCommentInfoBuilder)
  private issueCommentInfoBuilder: IssueCommentInfoBuilder;

  @inject(AddReactionCommentHelper)
  private addReactionCommentHelper: AddReactionCommentHelper;

  constructor() {
    this.issueCommands = new Map();
  }

  /**
   * Add the callback provided by given command name
   */
  registerIssueCommentCommand(commandName: string, issueCommandInfo: (issueCommentInfo: IssueCommentInfo) => Promise<void>): void {
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

    const command = this.issueCommands.get(commandName);
    if (command) {
      const issueCommentInfo = this.issueCommentInfoBuilder.build().withPayLoadIssues(payload).withCommentId(payload.comment.id);

      this.addReactionCommentHelper.addReaction('+1', issueCommentInfo);
      await command(issueCommentInfo);
    }
  }
}
