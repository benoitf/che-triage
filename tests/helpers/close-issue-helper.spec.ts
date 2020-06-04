/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { CloseIssueHelper } from '../../src/helpers/close-issue-helper';
import { Container } from 'inversify';
import { Octokit } from '@octokit/rest';

describe('Test Helper CloseIssueHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(CloseIssueHelper).toSelf().inSingletonScope();
  });

  // check
  test('test call correct API', async () => {
    const octokit: any = { issues: { update: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const closeIssueHelper = container.get(CloseIssueHelper);

    const issueInfo: IssueInfo = new IssueInfoBuilder().build().withNumber(123).withOwner('my-owner').withRepo('repository');

    await closeIssueHelper.close(issueInfo);

    expect(octokit.issues.update).toBeCalled();
    const params: Octokit.IssuesUpdateParams = octokit.issues.update.mock.calls[0][0];

    expect(params.state).toEqual('closed');
    expect(params.owner).toBe(issueInfo.owner);
    expect(params.repo).toBe(issueInfo.repo);
    expect(params.issue_number).toBe(issueInfo.number);
  });
});
