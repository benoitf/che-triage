import { inject, injectable, named } from 'inversify';

import { Octokit } from '@octokit/rest';
import { PullRequestInfo } from '../info/pull-request-info';

@injectable()
export class PullRequestHelper {
  @inject(Octokit)
  @named('READ_TOKEN')
  private octokit: Octokit;

  /**
   * First time contributor = 0 Pull Request but can have issues
   */
  public async isFirstTimeContributor(pullRequestInfo: PullRequestInfo): Promise<boolean> {
    const searchIssueParams: Octokit.SearchIssuesAndPullRequestsParams = {
      q: `repo:${pullRequestInfo.owner}/${pullRequestInfo.repo} type:pr author:${pullRequestInfo.author}`,
      // eslint-disable-next-line @typescript-eslint/camelcase
      per_page: 1,
    };

    const response: Octokit.Response<Octokit.SearchIssuesAndPullRequestsResponse> = await this.octokit.search.issuesAndPullRequests(
      searchIssueParams
    );
    return response.data.total_count === 0;
  }
}
