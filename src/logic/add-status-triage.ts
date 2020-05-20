import { inject, injectable, postConstruct } from 'inversify';

import { AddLabelHelper } from '../helpers/add-label-helper';
import { IssueAction } from '../actions/issue-action';
import { IssueInfo } from '../info/issue-info';
import { Logic } from '../api/logic';

@injectable()
export class AddStatusTriageLogic implements Logic {
  public static readonly LABEL_TO_ADD: string = 'status/need-triage';

  @inject(IssueAction)
  private issueAction: IssueAction;

  @inject(AddLabelHelper)
  private addLabelHelper: AddLabelHelper;

  // Remove the label if specified inside the comment
  @postConstruct()
  public setup(): void {
    this.issueAction.registerCallback(['opened'], async (issueInfo: IssueInfo) => {
      await this.addLabelHelper.addLabel([AddStatusTriageLogic.LABEL_TO_ADD], issueInfo);
      console.info(`Add label ${AddStatusTriageLogic.LABEL_TO_ADD} on issue ${issueInfo.htmlLink}`);
    });
  }
}
