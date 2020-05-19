import { inject, injectable, named } from 'inversify';

import { IssueInfo } from '../info/issue-info';
import { Octokit } from '@octokit/rest';
import { PullRequestInfo } from '../info/pull-request-info';

@injectable()
export class AddMilestoneHelper {
  @inject(Octokit)
  @named('WRITE_TOKEN')
  private octokitWrite: Octokit;

  @inject(Octokit)
  @named('READ_TOKEN')
  private octokitRead: Octokit;

  public async setMilestone(milestone: string, issueInfo: IssueInfo | PullRequestInfo): Promise<void> {
    // search milestone on the repo
    const issuesGetMilestonesParams: Octokit.IssuesListMilestonesForRepoParams = {
      owner: issueInfo.owner,
      repo: issueInfo.repo,
    };

    // search if milestone is already defined
    const response = await this.octokitRead.issues.listMilestonesForRepo(issuesGetMilestonesParams);
    let githubMilestone: Octokit.IssuesListMilestonesForRepoResponseItem | undefined = response.data.find(
      (milestoneResponse: Octokit.IssuesListMilestonesForRepoResponseItem) => {
        return milestoneResponse.title === milestone;
      }
    );

    // not defined, create it
    if (!githubMilestone) {
      const issuesCreateMilestoneParams: Octokit.IssuesCreateMilestoneParams = {
        owner: issueInfo.owner,
        repo: issueInfo.repo,
        title: milestone,
      };
      const response = await this.octokitWrite.issues.createMilestone(issuesCreateMilestoneParams);
      githubMilestone = response.data;
    }

    // Grab the number
    const milestoneNumber = githubMilestone.number;

    // sets the milestone from the number
    const issuesUpdateParams: Octokit.IssuesUpdateParams = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      owner: issueInfo.owner,
      repo: issueInfo.repo,
      milestone: milestoneNumber,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueInfo.number,
    };
    await this.octokitWrite.issues.update(issuesUpdateParams);
  }
}
