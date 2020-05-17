import * as Webhooks from '@octokit/webhooks';

import { IssueCommentInfo } from '../info/issue-comment-info';
import { IssueCommentListener } from '../api/issue-comment-listener';
import { injectable } from 'inversify';

@injectable()
export class IssueCommentAction implements IssueCommentListener {
  private issueCommands: Map<string, (issueCommentInfo: IssueCommentInfo) => Promise<void>>;

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

    console.log('executing payload', payload);
    // only handle create and edit
    if (payload.action !== 'created' && payload.action !== 'edited') {
      console.log('action not handled, was:', payload.action);
      return;
    }

    const commandName = commentBody.trim();

    const labels: string[] = payload.issue.labels.map((label) => label.name);

    const issueCommentInfo = new IssueCommentInfo(
      payload.issue.number,
      payload.repository.owner.login,
      payload.repository.name,
      labels
    );

    console.log(`the command name is "${commandName}"`);
    console.log(`the command name is "${commandName}"`);

    const command = this.issueCommands.get(commandName);
    if (command) {
      console.log('command is found in issueCommands, executing...', this.issueCommands);
      await command(issueCommentInfo);
    } else {
      console.log('command is not found in all issueCommands', this.issueCommands);
    }
  }
}
