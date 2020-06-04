/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import { AddReactionCommentHelper, ReactionType } from '../../src/helpers/add-reaction-comment-helper';

import { Container } from 'inversify';
import { IssueCommentInfo } from '../../src/info/issue-comment-info';
import { Octokit } from '@octokit/rest';

describe('Test Helper AddReactionCommentHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(AddReactionCommentHelper).toSelf().inSingletonScope();
  });

  // check with label existing
  test('test call correct API', async () => {
    const octokit: any = { reactions: { createForIssueComment: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const addReactionCommentHelper = container.get(AddReactionCommentHelper);

    const issueCommentInfo: IssueCommentInfo = new IssueCommentInfo()
      .withNumber(123)
      .withOwner('my-owner')
      .withRepo('repository')
      .withNumber(1234);

    const reaction: ReactionType = 'heart';
    await addReactionCommentHelper.addReaction(reaction, issueCommentInfo);

    expect(octokit.reactions.createForIssueComment).toBeCalled();
    const params: Octokit.ReactionsCreateForIssueCommentParams = octokit.reactions.createForIssueComment.mock.calls[0][0];

    expect(params.content).toBe(reaction);
    expect(params.comment_id).toBe(issueCommentInfo.commentId);
    expect(params.owner).toBe(issueCommentInfo.owner);
    expect(params.repo).toBe(issueCommentInfo.repo);
  });
});
