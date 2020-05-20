import { inject, injectable, postConstruct } from 'inversify';

import { AddCommentHelper } from '../helpers/add-comment-helper';
import { Logic } from '../api/logic';
import { PullRequestAction } from '../actions/pull-request-action';
import { PullRequestHelper } from '../helpers/pull-request-helper';
import { PullRequestInfo } from '../info/pull-request-info';
import { TemplateReader } from '../template/template-reader';

@injectable()
export class AddWelcomeFirstPRLogic implements Logic {
  public static readonly PR_EVENT: string = 'opened';
  public static readonly TEST_LABEL: string = 'first-time-contributor';

  @inject(PullRequestAction)
  private pullRequestAction: PullRequestAction;

  @inject(PullRequestHelper)
  private pullRequestHelper: PullRequestHelper;

  @inject(AddCommentHelper)
  private addCommentHelper: AddCommentHelper;

  @inject(TemplateReader)
  private templateReader: TemplateReader;

  // Add the given milestone
  @postConstruct()
  public setup(): void {
    const callback = async (pullRequestInfo: PullRequestInfo): Promise<void> => {
      // check if the author of this PR has already opened others
      const firstTimeContributor: boolean = await this.pullRequestHelper.isFirstTimeContributor(pullRequestInfo);

      // check also if label 'first-time' is applied to be able to quickly test without being really a contributor
      if (!firstTimeContributor && !pullRequestInfo.hasLabel(AddWelcomeFirstPRLogic.TEST_LABEL)) {
        return;
      }

      const vars = {
        AUTHOR: pullRequestInfo.author,
        FIRST_TIME: firstTimeContributor,
      };

      const text = await this.templateReader.render('welcome-first-pr', vars);

      // send the welcome message
      await this.addCommentHelper.addComment(text, pullRequestInfo);
    };

    this.pullRequestAction.registerCallback([AddWelcomeFirstPRLogic.PR_EVENT], callback);
  }
}
