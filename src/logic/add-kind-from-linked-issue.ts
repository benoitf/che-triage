import { inject, injectable, postConstruct } from 'inversify';

import { AddLabelHelper } from '../helpers/add-label-helper';
import { IssueInfo } from '../info/issue-info';
import { Logic } from '../api/logic';
import { PullRequestAction } from '../actions/pull-request-action';
import { PullRequestInfo } from '../info/pull-request-info';

/**
 * Add labels extracted from linked issues found in the template
 */
@injectable()
export class AddKindFromLinkedIssuesLogic implements Logic {
  public static readonly PR_EVENTS: string[] = ['opened', 'edited'];

  @inject(PullRequestAction)
  private pullRequestAction: PullRequestAction;

  @inject(AddLabelHelper)
  private addLabelHelper: AddLabelHelper;

  // Add the given milestone
  @postConstruct()
  public setup(): void {
    const callback = async (pullRequestInfo: PullRequestInfo): Promise<void> => {
      // grab linked issues
      const linkedIssues: IssueInfo[] = pullRequestInfo.linkedIssues;

      // all kind labels on other issues
      const linkedKindLabels: string[] = [];
      linkedIssues.forEach(linkedIssue => {
        linkedIssue.labels.forEach(label => {
          if (!linkedKindLabels.includes(label) && label.startsWith('kind/')) {
            linkedKindLabels.push(label);
          }
        });
      });

      // get kind/ labels on the current pull request
      const existingKindLabels = pullRequestInfo.labels.filter(label => label.startsWith('kind/'));

      // labels to add are all kinds labels not existing on the current pull request
      const labelsToAdd: string[] = linkedKindLabels.filter(label => !existingKindLabels.includes(label));

      if (labelsToAdd.length > 0) {
        console.info(
          `Add labels ${labelsToAdd} on pull request ${pullRequestInfo.htmlLink} based on issues ${linkedIssues
            .map(issue => issue.htmlLink)
            .join(',')} `
        );
        await this.addLabelHelper.addLabel(labelsToAdd, pullRequestInfo);
      }
    };

    this.pullRequestAction.registerCallback(AddKindFromLinkedIssuesLogic.PR_EVENTS, callback);
  }
}
