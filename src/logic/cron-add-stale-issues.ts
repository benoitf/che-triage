import { IssueInfo, IssueInfoBuilder } from '../info/issue-info';
import { ScheduleListener, ScheduleListenerParam } from '../api/schedule-listener';
import { inject, injectable, named } from 'inversify';

import { AddCommentHelper } from '../helpers/add-comment-helper';
import { AddLabelHelper } from '../helpers/add-label-helper';
import { Endpoints } from '@octokit/types';
import { Logic } from '../api/logic';
import { Octokit } from '@octokit/rest';
import { TemplateReader } from '../template/template-reader';

type IssuesGetResponseData = Endpoints['GET /repos/:owner/:repo/issues/:issue_number']['response']['data'];

/**
 * Add label lifecycle/frozen on very old issues
 */
@injectable()
export class CronAddStaleIssuesLogic implements Logic, ScheduleListener {
  public static readonly CHECK_STALE_DAYS = 180;
  public static readonly ROT_AFTER_STALE_DAYS = 7;
  public static readonly MAX_FLAG_AT_ONCE = 20;

  @inject(AddCommentHelper)
  private addCommentHelper: AddCommentHelper;

  @inject(AddLabelHelper)
  private addLabelHelper: AddLabelHelper;

  @inject(Octokit)
  @named('READ_TOKEN')
  private readOctokit: Octokit;

  @inject(IssueInfoBuilder)
  private issueInfoBuilder: IssueInfoBuilder;

  @inject(TemplateReader)
  private templateReader: TemplateReader;

  async execute(repo: ScheduleListenerParam): Promise<void> {
    // search all issues

    // compute 180 days from now in the past
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - CronAddStaleIssuesLogic.CHECK_STALE_DAYS);
    const simpleDate = beforeDate.toISOString().substring(0, 10);

    // get all issues not updated since this date and that are not in frozen state
    const options = this.readOctokit.search.issuesAndPullRequests.endpoint.merge({
      q: `repo:${repo.owner}/${repo.repo} state:open updated:<=${simpleDate} -label:lifecycle/frozen`,
      sort: 'created',
      order: 'asc',
      // eslint-disable-next-line @typescript-eslint/camelcase
      per_page: 100,
    });

    const response = await this.readOctokit.paginate(options);
    await this.handleStaleIssues(response, repo);
  }

  protected async handleStaleIssues(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Array<any>,
    repoParam: ScheduleListenerParam
  ): Promise<void> {
    // ok so now for each issue, need to flag it as stale and add label on it

    // for now, only took first MAX_CLOSE_AT_ONCE issues
    const updatedData = data;
    if (updatedData.length > CronAddStaleIssuesLogic.MAX_FLAG_AT_ONCE) {
      updatedData.length = CronAddStaleIssuesLogic.MAX_FLAG_AT_ONCE;
    }

    // for each issue, grab details
    const issuesInfos: IssueInfo[] = data.map((issueData: IssuesGetResponseData) => {
      const labels: string[] = issueData.labels.map(label => label.name);
      return this.issueInfoBuilder
        .build()
        .withRepo(repoParam.repo)
        .withOwner(repoParam.owner)
        .withNumber(issueData.number)
        .withLabels(labels);
    });

    const env = {
      inactivityDays: CronAddStaleIssuesLogic.CHECK_STALE_DAYS,
      rotDays: CronAddStaleIssuesLogic.ROT_AFTER_STALE_DAYS,
    };

    const comment = await this.templateReader.render('add-lifecycle-stale', env);

    // comment the
    for await (const issueInfo of issuesInfos) {
      this.addCommentHelper.addComment(comment, issueInfo);
      this.addLabelHelper.addLabel(['lifecycle/stale'], issueInfo);
    }
  }
}
