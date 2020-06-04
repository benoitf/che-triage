import { IssueInfo, IssueInfoBuilder } from '../info/issue-info';
import { ScheduleListener, ScheduleListenerParam } from '../api/schedule-listener';
import { inject, injectable, named } from 'inversify';

import { CloseIssueHelper } from '../helpers/close-issue-helper';
import { CronAddStaleIssuesLogic } from './cron-add-stale-issues';
import { Endpoints } from '@octokit/types';
import { Logic } from '../api/logic';
import { Octokit } from '@octokit/rest';

type IssuesGetResponseData = Endpoints['GET /repos/:owner/:repo/issues/:issue_number']['response']['data'];

/**
 * Close issues with label lifecycle/stale
 */
@injectable()
export class CronCloseStaleIssuesLogic implements Logic, ScheduleListener {
  public static readonly MAX_CLOSE_AT_ONCE = 20;

  @inject(Octokit)
  @named('READ_TOKEN')
  private readOctokit: Octokit;

  @inject(IssueInfoBuilder)
  private issueInfoBuilder: IssueInfoBuilder;

  @inject(CloseIssueHelper)
  private closeIssueHelper: CloseIssueHelper;

  async execute(repo: ScheduleListenerParam): Promise<void> {
    // search all issues

    // compute ROT_AFTER_STALE_DAYS days from now in the past
    const inThePasteDate = new Date();
    inThePasteDate.setDate(inThePasteDate.getDate() - CronAddStaleIssuesLogic.ROT_AFTER_STALE_DAYS);
    const inThePasteDateSimple = inThePasteDate.toISOString().substring(0, 10);

    // get all issues not updated since this date and that are not in frozen state
    const options = this.readOctokit.search.issuesAndPullRequests.endpoint.merge({
      q: `repo:${repo.owner}/${repo.repo} state:open updated:<=${inThePasteDateSimple} label:lifecycle/stale`,
      sort: 'created',
      order: 'asc',
      // eslint-disable-next-line @typescript-eslint/camelcase
      per_page: 100,
    });

    const response = await this.readOctokit.paginate(options);
    await this.handleCloseStaleIssues(response, repo);
  }

  protected async handleCloseStaleIssues(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Array<any>,
    repoParam: ScheduleListenerParam
  ): Promise<void> {
    // ok so now for each issue, need to flag it as stale and add label on it

    // for now, only took first MAX_CLOSE_AT_ONCE issues
    const updatedData = data;
    if (updatedData.length > CronCloseStaleIssuesLogic.MAX_CLOSE_AT_ONCE) {
      updatedData.length = CronCloseStaleIssuesLogic.MAX_CLOSE_AT_ONCE;
    }

    // for each issue, grab details
    const issuesInfos: IssueInfo[] = data.map((issueData: IssuesGetResponseData) =>
      this.issueInfoBuilder.build().withRepo(repoParam.repo).withOwner(repoParam.owner).withNumber(issueData.number)
    );

    // close the issues
    for await (const issueInfo of issuesInfos) {
      this.closeIssueHelper.close(issueInfo);
    }
  }
}
