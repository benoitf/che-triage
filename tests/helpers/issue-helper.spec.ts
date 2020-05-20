/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { Container } from 'inversify';
import { IssuesHelper } from '../../src/helpers/issue-helper';
import { Octokit } from '@octokit/rest';

describe('Test Helper IssueHelper', () => {
  let container: Container;
  let issueInfoBuilder: IssueInfoBuilder;

  beforeEach(() => {
    container = new Container();
    issueInfoBuilder = {} as any;
    container.bind(IssueInfoBuilder).toConstantValue(issueInfoBuilder);

    container.bind(IssuesHelper).toSelf().inSingletonScope();
  });

  test('test with firstTime true', async () => {
    const octokit: any = { issues: { listForRepo: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const issueHelper = container.get(IssuesHelper);

    const issueInfo: IssueInfo = new IssueInfoBuilder()
      .build()
      .withNumber(123)
      .withAuthor('author')
      .withOwner('my-owner')
      .withRepo('repository')
      .withNumber(1234);

    // empty response
    const response: any = { data: [] };

    (octokit.issues.listForRepo as jest.Mock).mockReturnValue(response);

    const isFirstTime: boolean = await issueHelper.isFirstTime(issueInfo);

    expect(octokit.issues.listForRepo).toBeCalled();
    const params: Octokit.IssuesListForRepoParams = octokit.issues.listForRepo.mock.calls[0][0];

    expect(params.creator).toBe(issueInfo.author);
    expect(params.state).toBe('all');
    expect(params.repo).toBe(issueInfo.repo);
    expect(params.owner).toBe(issueInfo.owner);

    expect(isFirstTime).toBeTruthy();
  });

  test('test with firstTime false', async () => {
    const octokit: any = { issues: { listForRepo: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const issueHelper = container.get(IssuesHelper);

    const issueInfo: IssueInfo = new IssueInfoBuilder()
      .build()
      .withNumber(123)
      .withAuthor('author')
      .withOwner('my-owner')
      .withRepo('repository')
      .withNumber(1234);

    // got some results in the response so firstTime = false
    const response: any = { data: ['something', 'another-thing'] };

    (octokit.issues.listForRepo as jest.Mock).mockReturnValue(response);

    const isFirstTime: boolean = await issueHelper.isFirstTime(issueInfo);

    expect(octokit.issues.listForRepo).toBeCalled();
    const params: Octokit.IssuesListForRepoParams = octokit.issues.listForRepo.mock.calls[0][0];

    expect(params.creator).toBe(issueInfo.author);
    expect(params.state).toBe('all');
    expect(params.repo).toBe(issueInfo.repo);
    expect(params.owner).toBe(issueInfo.owner);

    expect(isFirstTime).toBeFalsy();
  });
});
