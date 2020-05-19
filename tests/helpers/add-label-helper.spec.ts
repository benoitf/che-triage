/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { AddLabelHelper } from '../../src/helpers/add-label-helper';
import { Container } from 'inversify';
import { Octokit } from '@octokit/rest';

describe('Test Helper AddCommentHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(AddLabelHelper).toSelf().inSingletonScope();
  });

  // check with label existing
  test('test call correct API', async () => {
    const octokit: any = { issues: { addLabels: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const addLabelHelper = container.get(AddLabelHelper);

    const labels = ['one', 'two', 'three'];

    const issueInfo: IssueInfo = new IssueInfoBuilder()
      .build()
      .withNumber(123)
      .withOwner('my-owner')
      .withRepo('repository')
      .withLabels(['three', 'four'])
      .withNumber(1234);

    await addLabelHelper.addLabel(labels, issueInfo);

    expect(octokit.issues.addLabels).toBeCalled();
    const params: Octokit.IssuesAddLabelsParams = octokit.issues.addLabels.mock.calls[0][0];

    expect(params.labels).toEqual(['one', 'two']);
    expect(params.owner).toBe(issueInfo.owner);
    expect(params.repo).toBe(issueInfo.repo);
    expect(params.issue_number).toBe(issueInfo.number);
  });

  test('test not call as labels already there', async () => {
    const octokit: any = { issues: { addLabels: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const addLabelHelper = container.get(AddLabelHelper);

    const labels = ['one', 'two', 'three'];

    const issueInfo: IssueInfo = new IssueInfoBuilder()
      .build()
      .withNumber(123)
      .withOwner('my-owner')
      .withRepo('repository')
      .withLabels(['one', 'two', 'three', 'four', 'five'])
      .withNumber(1234);

    await addLabelHelper.addLabel(labels, issueInfo);

    // should not be called as labels are already there
    expect(octokit.issues.addLabels).toBeCalledTimes(0);
  });
});
