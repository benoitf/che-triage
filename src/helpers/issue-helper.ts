import { inject, injectable, named } from 'inversify';

import { IssueInfo } from '../info/issue-info';
import { Octokit } from '@octokit/rest';

@injectable()
export class IssuesHelper {
  @inject(Octokit)
  @named('READ_TOKEN')
  private octokit: Octokit;

  public async isFirstTime(issueInfo: IssueInfo): Promise<boolean> {
    const issuesListParams: Octokit.IssuesListForRepoParams = {
      creator: issueInfo.author,
      state: 'all',
      owner: issueInfo.owner,
      repo: issueInfo.repo,
    };

    const response = await this.octokit.issues.listForRepo(issuesListParams);
    return response.data.length === 0;
  }
}
