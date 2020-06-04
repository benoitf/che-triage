import { inject, injectable, named } from 'inversify';

import { IssueInfo } from '../info/issue-info';
import { Octokit } from '@octokit/rest';
import { PullRequestInfo } from '../info/pull-request-info';

@injectable()
export class CloseIssueHelper {
  @inject(Octokit)
  @named('WRITE_TOKEN')
  private octokit: Octokit;

  public async close(issueInfo: IssueInfo | PullRequestInfo): Promise<void> {
    const params: Octokit.IssuesUpdateParams = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueInfo.number,
      owner: issueInfo.owner,
      repo: issueInfo.repo,
      state: 'closed',
    };
    this.octokit.issues.update(params);
  }
}
