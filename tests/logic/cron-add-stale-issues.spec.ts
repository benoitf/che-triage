/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { AddCommentHelper } from '../../src/helpers/add-comment-helper';
import { AddLabelHelper } from '../../src/helpers/add-label-helper';
import { Container } from 'inversify';
import { CronAddStaleIssuesLogic } from '../../src/logic/cron-add-stale-issues';
import { Octokit } from '@octokit/rest';
import { TemplateReader } from '../../src/template/template-reader';

describe('Test Logic CronAddStaleIssues', () => {
  let container: Container;

  let octokit: Octokit;
  let addCommentHelper: AddCommentHelper;
  let addLabelHelper: AddLabelHelper;
  let templateReader: TemplateReader;

  beforeEach(() => {
    container = new Container();
    container.bind(CronAddStaleIssuesLogic).toSelf().inSingletonScope();

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

    addCommentHelper = {
      addComment: jest.fn(),
    } as any;
    container.bind(AddCommentHelper).toConstantValue(addCommentHelper);

    addLabelHelper = {
      addLabel: jest.fn(),
    } as any;
    container.bind(AddLabelHelper).toConstantValue(addLabelHelper);

    templateReader = {
      render: jest.fn(),
    } as any;
    container.bind(TemplateReader).toConstantValue(templateReader);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test no matching issues', async () => {
    const cronAddStaleIssuesLogic = container.get(CronAddStaleIssuesLogic);

    const repo = {
      owner: 'foo',
      repo: 'bar',
    };

    const options: Octokit.RequestOptions = {};
    (octokit.search.issuesAndPullRequests.endpoint.merge as jest.Mock).mockReturnValue(options);
    (octokit.paginate as any).mockReturnValue([]);

    await cronAddStaleIssuesLogic.execute(repo);

    // check
    expect(octokit.search.issuesAndPullRequests.endpoint.merge).toBeCalled();
    const endpointCall = (octokit as any).search.issuesAndPullRequests.endpoint.merge.mock.calls[0];

    expect(JSON.stringify(endpointCall[0])).toContain(`repo:${repo.owner}/${repo.repo}`);

    // no issue, not called
    expect(addCommentHelper.addComment).toHaveBeenCalledTimes(0);
    expect(addLabelHelper.addLabel).toHaveBeenCalledTimes(0);
  });

  test('test matching issues', async () => {
    const cronAddStaleIssuesLogic = container.get(CronAddStaleIssuesLogic);

    const repo = {
      owner: 'foo',
      repo: 'bar',
    };

    const fakeIssue = {
      number: 123,
      labels: [],
    };

    const options: Octokit.RequestOptions = {};
    (octokit.search.issuesAndPullRequests.endpoint.merge as jest.Mock).mockReturnValue(options);
    (octokit.paginate as any).mockReturnValue([fakeIssue]);

    const templateResult = 'hello world';
    (templateReader.render as jest.Mock).mockReturnValue(templateResult);

    await cronAddStaleIssuesLogic.execute(repo);

    // check
    expect(octokit.search.issuesAndPullRequests.endpoint.merge).toBeCalled();
    const endpointCall = (octokit as any).search.issuesAndPullRequests.endpoint.merge.mock.calls[0];

    expect(JSON.stringify(endpointCall[0])).toContain(`repo:${repo.owner}/${repo.repo}`);

    // issue, got called
    expect(addCommentHelper.addComment).toBeCalled();
    const addCommentCall = (addCommentHelper.addComment as jest.Mock).mock.calls[0];
    expect(addCommentCall[0]).toEqual(templateResult);
    const issueInfo: IssueInfo = addCommentCall[1];
    expect(issueInfo).toBeDefined();
    expect(issueInfo.number).toEqual(fakeIssue.number);
    expect(issueInfo.repo).toEqual(repo.repo);
    expect(issueInfo.owner).toEqual(repo.owner);

    expect(addLabelHelper.addLabel).toBeCalled();
    const addLabelCall = (addLabelHelper.addLabel as jest.Mock).mock.calls[0];
    expect(addLabelCall[0]).toEqual(['lifecycle/stale']);
    const issueAddLabel: IssueInfo = addLabelCall[1];
    expect(issueAddLabel).toBeDefined();
    expect(issueAddLabel.number).toEqual(fakeIssue.number);
    expect(issueAddLabel.repo).toEqual(repo.repo);
    expect(issueAddLabel.owner).toEqual(repo.owner);
  });

  test('test lot of matchins issues', async () => {
    const cronAddStaleIssuesLogic = container.get(CronAddStaleIssuesLogic);

    const repo = {
      owner: 'foo',
      repo: 'bar',
    };

    const fakeIssues = [];
    for (let i = 0; i < 50; i++) {
      fakeIssues.push({ number: `123${i}`, labels: [{ name: 'hello' }] });
    }

    const options: Octokit.RequestOptions = {};
    (octokit.search.issuesAndPullRequests.endpoint.merge as jest.Mock).mockReturnValue(options);
    (octokit.paginate as any).mockReturnValue(fakeIssues);

    const templateResult = 'hello world';
    (templateReader.render as jest.Mock).mockReturnValue(templateResult);

    await cronAddStaleIssuesLogic.execute(repo);

    // check
    expect(octokit.search.issuesAndPullRequests.endpoint.merge).toBeCalled();
    const endpointCall = (octokit as any).search.issuesAndPullRequests.endpoint.merge.mock.calls[0];

    expect(JSON.stringify(endpointCall[0])).toContain(`repo:${repo.owner}/${repo.repo}`);

    // issue, got limited number of calls
    expect(addCommentHelper.addComment).toBeCalledTimes(CronAddStaleIssuesLogic.MAX_FLAG_AT_ONCE);

    expect(addLabelHelper.addLabel).toBeCalledTimes(CronAddStaleIssuesLogic.MAX_FLAG_AT_ONCE);
  });
});
