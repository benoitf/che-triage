import { inject, injectable, postConstruct } from 'inversify';

import { AddMilestoneHelper } from '../helpers/add-milestone-helper';
import { CheVersionFetcher } from '../fetchers/che-version-fetcher';
import { Logic } from '../api/logic';
import { PullRequestAction } from '../actions/pull-request-action';
import { PullRequestInfo } from '../info/pull-request-info';

@injectable()
export class AddCheMilestoneOnMergedPRLogic implements Logic {
  public static readonly PR_EVENT: string = 'closed';

  @inject(PullRequestAction)
  private pullRequestAction: PullRequestAction;

  @inject(AddMilestoneHelper)
  private addMilestoneHelper: AddMilestoneHelper;

  @inject(CheVersionFetcher)
  private cheVersionFetcher: CheVersionFetcher;

  // Add the given milestone
  @postConstruct()
  public setup(): void {
    const callback = async (pullRequestInfo: PullRequestInfo): Promise<void> => {
      // skip if not merged
      if (!pullRequestInfo.merged) {
        return;
      }

      // skip if not for master branch
      if (!(pullRequestInfo.mergingBranch === 'master')) {
        return;
      }

      const version: undefined | string = await this.cheVersionFetcher.getVersion();
      if (version) {
        console.info(`Add milestone ${version} on pull request ${pullRequestInfo.htmlLink}`);
        await this.addMilestoneHelper.setMilestone(version, pullRequestInfo);
      }
    };

    this.pullRequestAction.registerCallback([AddCheMilestoneOnMergedPRLogic.PR_EVENT], callback);
  }
}
