import { inject, injectable, postConstruct } from 'inversify';

import { IssueCommentAction } from '../actions/issue-comment-action';
import { IssueCommentInfo } from '../info/issue-comment-info';
import { Logic } from '../api/logic';
import { RemoveLabelHelper } from '../helpers/remove-label-helper';

@injectable()
export class RemoveLifeCycleStaleLogic implements Logic {
  public static readonly REMOVE_LIFECYCLE_STALE_COMMAND: string = '/remove-lifecycle stale';
  public static readonly LABEL_TO_REMOVE: string = 'lifecycle/stale';

  @inject(IssueCommentAction)
  private issueCommentAction: IssueCommentAction;

  @inject(RemoveLabelHelper)
  private removeLabelHelper: RemoveLabelHelper;

  // Remove the label if specified inside the comment
  @postConstruct()
  public setup(): void {
    this.issueCommentAction.registerIssueCommentCommand(
      RemoveLifeCycleStaleLogic.REMOVE_LIFECYCLE_STALE_COMMAND,
      async (issueInfo: IssueCommentInfo) => {
        console.info(`Remove label ${RemoveLifeCycleStaleLogic.LABEL_TO_REMOVE} on issue ${issueInfo.htmlLink}`);
        await this.removeLabelHelper.removeLabel(RemoveLifeCycleStaleLogic.LABEL_TO_REMOVE, issueInfo);
      }
    );
  }
}
