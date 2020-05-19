/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { AddCommentHelper } from '../../src/helpers/add-comment-helper';
import { Container } from 'inversify';
import { Octokit } from '@octokit/rest';

describe('Test Helper AddCommentHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(AddCommentHelper).toSelf().inSingletonScope();
  });

  // check with label existing
  test('test call correct API', async () => {
    const octokit: any = { issues: { createComment: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const addCommentHelper = container.get(AddCommentHelper);

    const issueInfo: IssueInfo = new IssueInfoBuilder()
      .build()
      .withNumber(123)
      .withOwner('my-owner')
      .withRepo('repository')
      .withNumber(1234);

    const comment = 'my-comment';

    await addCommentHelper.addComment(comment, issueInfo);

    expect(octokit.issues.createComment).toBeCalled();
    const params: Octokit.IssuesCreateCommentParams = octokit.issues.createComment.mock.calls[0][0];

    expect(params.body).toBe(comment);
    expect(params.owner).toBe(issueInfo.owner);
    expect(params.repo).toBe(issueInfo.repo);
    expect(params.issue_number).toBe(issueInfo.number);
  });
});
