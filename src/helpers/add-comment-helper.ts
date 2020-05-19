import { inject, injectable, named } from 'inversify';

import { IssueInfo } from '../info/issue-info';
import { Octokit } from '@octokit/rest';
import { PullRequestInfo } from '../info/pull-request-info';

@injectable()
export class AddCommentHelper {
  @inject(Octokit)
  @named('READ_TOKEN')
  private octokit: Octokit;

  public async addComment(comment: string, issueCommentInfo: IssueInfo | PullRequestInfo): Promise<void> {
    const createCommentParams: Octokit.IssuesCreateCommentParams = {
      body: comment,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueCommentInfo.number,
      owner: issueCommentInfo.owner,
      repo: issueCommentInfo.repo,
    };

    this.octokit.issues.createComment(createCommentParams);
  }
}
