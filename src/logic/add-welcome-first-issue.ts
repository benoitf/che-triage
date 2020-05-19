import { inject, injectable, postConstruct } from 'inversify';

import { AddCommentHelper } from '../helpers/add-comment-helper';
import { IssueAction } from '../actions/issue-action';
import { IssueInfo } from '../info/issue-info';
import { IssuesHelper } from '../helpers/issue-helper';
import { Logic } from '../api/logic';

@injectable()
export class AddWelcomeFirstIssueLogic implements Logic {
  public static readonly ISSUE_EVENT: string = 'opened';

  @inject(IssueAction)
  private issueAction: IssueAction;

  @inject(IssuesHelper)
  private issueHelper: IssuesHelper;

  @inject(AddCommentHelper)
  private addCommentHelper: AddCommentHelper;

  // Add the given milestone
  @postConstruct()
  public setup(): void {
    this.issueAction.registerCallback(AddWelcomeFirstIssueLogic.ISSUE_EVENT, async (issueInfo: IssueInfo) => {
      // check if the author of this issue has already reported issues (including PRs)
      const firstTime: boolean = await this.issueHelper.isFirstTime(issueInfo);
      /*if (!firstTime) {
          return;
        }*/

      // send the welcome message
      await this.addCommentHelper.addComment(`Is it first time issue ? ${firstTime}`, issueInfo);
    });
  }
}
