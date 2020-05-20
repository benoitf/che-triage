import { inject, injectable, postConstruct } from 'inversify';

import { AddCommentHelper } from '../helpers/add-comment-helper';
import { IssueAction } from '../actions/issue-action';
import { IssueInfo } from '../info/issue-info';
import { IssuesHelper } from '../helpers/issue-helper';
import { Logic } from '../api/logic';
import { TemplateReader } from '../template/template-reader';

@injectable()
export class AddWelcomeFirstIssueLogic implements Logic {
  public static readonly ISSUE_EVENT: string = 'opened';
  public static readonly TEST_LABEL: string = 'first-time-contributor';

  @inject(IssueAction)
  private issueAction: IssueAction;

  @inject(IssuesHelper)
  private issueHelper: IssuesHelper;

  @inject(AddCommentHelper)
  private addCommentHelper: AddCommentHelper;

  @inject(TemplateReader)
  private templateReader: TemplateReader;

  // Add the given milestone
  @postConstruct()
  public setup(): void {
    this.issueAction.registerCallback(AddWelcomeFirstIssueLogic.ISSUE_EVENT, async (issueInfo: IssueInfo) => {
      // check if the author of this issue has already reported issues (including PRs)
      const firstTime: boolean = await this.issueHelper.isFirstTime(issueInfo);
      if (!firstTime && !issueInfo.hasLabel(AddWelcomeFirstIssueLogic.TEST_LABEL)) {
        return;
      }

      const vars = {
        AUTHOR: issueInfo.author,
        FIRST_TIME: firstTime,
      };

      const text = await this.templateReader.render('welcome-first-issue', vars);

      // send the welcome message
      await this.addCommentHelper.addComment(text, issueInfo);
    });
  }
}
