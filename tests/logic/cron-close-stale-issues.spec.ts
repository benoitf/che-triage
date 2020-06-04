/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { CloseIssueHelper } from '../../src/helpers/close-issue-helper';
import { Container } from 'inversify';
import { CronCloseStaleIssuesLogic } from '../../src/logic/cron-close-stale-issues';
import { Octokit } from '@octokit/rest';

describe('Test Logic CronAddStaleIssues', () => {
  let container: Container;

  let octokit: Octokit;
  let closeIssueHelper: CloseIssueHelper;

  beforeEach(() => {
    container = new Container();
    container.bind(CronCloseStaleIssuesLogic).toSelf().inSingletonScope();

    container.bind(IssueInfoBuilder).toSelf().inSingletonScope();

    octokit = {
      paginate: jest.fn(),

      search: {
        issuesAndPullRequests: {
          endpoint: {
            merge: jest.fn(),
          },
        },
      },
    } as any;

    container.bind(Octokit).toConstantValue(octokit);

    closeIssueHelper = {
      close: jest.fn(),
    } as any;
    container.bind(CloseIssueHelper).toConstantValue(closeIssueHelper);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test no matching issues', async () => {
    const cronCloseStaleIssuesLogic = container.get(CronCloseStaleIssuesLogic);

    const repo = {
      owner: 'foo',
      repo: 'bar',
    };

    const options: Octokit.RequestOptions = {};
    (octokit.search.issuesAndPullRequests.endpoint.merge as jest.Mock).mockReturnValue(options);
    (octokit.paginate as any).mockReturnValue([]);

    await cronCloseStaleIssuesLogic.execute(repo);

    // check
    expect(octokit.search.issuesAndPullRequests.endpoint.merge).toBeCalled();
    const endpointCall = (octokit as any).search.issuesAndPullRequests.endpoint.merge.mock.calls[0];

    expect(JSON.stringify(endpointCall[0])).toContain(`repo:${repo.owner}/${repo.repo}`);

    // no issue, not called
    expect(closeIssueHelper.close).toHaveBeenCalledTimes(0);
  });

  test('test matching issues', async () => {
    const cronCloseStaleIssuesLogic = container.get(CronCloseStaleIssuesLogic);

    const repo = {
      owner: 'foo',
      repo: 'bar',
    };

    const fakeIssue = {
      number: 123,
    };

    const options: Octokit.RequestOptions = {};
    (octokit.search.issuesAndPullRequests.endpoint.merge as jest.Mock).mockReturnValue(options);
    (octokit.paginate as any).mockReturnValue([fakeIssue]);

    await cronCloseStaleIssuesLogic.execute(repo);

    // check
    expect(octokit.search.issuesAndPullRequests.endpoint.merge).toBeCalled();
    const endpointCall = (octokit as any).search.issuesAndPullRequests.endpoint.merge.mock.calls[0];

    expect(JSON.stringify(endpointCall[0])).toContain(`repo:${repo.owner}/${repo.repo}`);

    // issue, got called
    expect(closeIssueHelper.close).toBeCalled();
    const closeIssueCall = (closeIssueHelper.close as jest.Mock).mock.calls[0];
    const issueInfo: IssueInfo = closeIssueCall[0];
    expect(issueInfo).toBeDefined();
    expect(issueInfo.number).toEqual(fakeIssue.number);
    expect(issueInfo.repo).toEqual(repo.repo);
    expect(issueInfo.owner).toEqual(repo.owner);
  });

  test('test lot of matchins issues', async () => {
    const cronCloseStaleIssuesLogic = container.get(CronCloseStaleIssuesLogic);

    const repo = {
      owner: 'foo',
      repo: 'bar',
    };

    const fakeIssues = [];
    for (let i = 0; i < 50; i++) {
      fakeIssues.push({ number: `123${i}` });
    }

    const options: Octokit.RequestOptions = {};
    (octokit.search.issuesAndPullRequests.endpoint.merge as jest.Mock).mockReturnValue(options);
    (octokit.paginate as any).mockReturnValue(fakeIssues);

    await cronCloseStaleIssuesLogic.execute(repo);

    // check
    expect(octokit.search.issuesAndPullRequests.endpoint.merge).toBeCalled();
    const endpointCall = (octokit as any).search.issuesAndPullRequests.endpoint.merge.mock.calls[0];

    expect(JSON.stringify(endpointCall[0])).toContain(`repo:${repo.owner}/${repo.repo}`);

    // issue, got limited number of calls
    expect(closeIssueHelper.close).toBeCalledTimes(CronCloseStaleIssuesLogic.MAX_CLOSE_AT_ONCE);
  });
});
