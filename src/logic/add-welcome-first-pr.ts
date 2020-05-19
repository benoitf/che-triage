import { inject, injectable, postConstruct } from 'inversify';

import { AddCommentHelper } from '../helpers/add-comment-helper';
import { Logic } from '../api/logic';
import { PullRequestAction } from '../actions/pull-request-action';
import { PullRequestHelper } from '../helpers/pull-request-helper';
import { PullRequestInfo } from '../info/pull-request-info';

@injectable()
export class AddWelcomeFirstPRLogic implements Logic {
  public static readonly PR_EVENT: string = 'opened';

  @inject(PullRequestAction)
  private pullRequestAction: PullRequestAction;

  @inject(PullRequestHelper)
  private pullRequestHelper: PullRequestHelper;

  @inject(AddCommentHelper)
  private addCommentHelper: AddCommentHelper;

  // Add the given milestone
  @postConstruct()
  public setup(): void {
    this.pullRequestAction.registerCallback(
      AddWelcomeFirstPRLogic.PR_EVENT,
      async (pullRequestInfo: PullRequestInfo) => {
        // check if the author of this PR has already opened others
        const firstTimeContributor: boolean = await this.pullRequestHelper.isFirstTimeContributor(pullRequestInfo);
        /* if (!firstTimeContributor) {
          return;
        }*/

        // send the welcome message
        await this.addCommentHelper.addComment(`Is it first time PR ? ${firstTimeContributor}`, pullRequestInfo);
      }
    );
  }
}
