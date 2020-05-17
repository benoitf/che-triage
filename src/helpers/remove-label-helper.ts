import { inject, injectable, named } from 'inversify';

import { IssueInfo } from '../info/issue-info';
import { Octokit } from '@octokit/rest';

@injectable()
export class RemoveLabelHelper {
  @inject(Octokit)
  @named('WRITE_TOKEN')
  private octokit: Octokit;

  public async removeLabel(labelToRemove: string, issueInfo: IssueInfo): Promise<void> {
    // if issue has not the label, do not trigger the removal
    if (!issueInfo.hasLabel(labelToRemove)) {
      return;
    }

    const params: Octokit.IssuesRemoveLabelParams = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueInfo.number,
      name: labelToRemove,
      owner: issueInfo.owner,
      repo: issueInfo.repo,
    };

    await this.octokit.issues.removeLabel(params);
  }
}
