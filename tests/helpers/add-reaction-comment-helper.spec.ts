import 'reflect-metadata';

import { Container } from 'inversify';
import { IssueInfo } from '../../src/info/issue-info';
import { Octokit } from '@octokit/rest';
import { AddReactionCommentHelper, ReactionType } from '../../src/helpers/add-reaction-comment-helper';
import { IssueCommentInfo } from '../../src/info/issue-comment-info';

describe('Test Helper AddReactionCommentHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(AddReactionCommentHelper).toSelf().inSingletonScope();
  });

  // check with label existing
  test('test call correct API', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const octokit: any = { reactions: { createForIssueComment: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const addReactionCommentHelper = container.get(AddReactionCommentHelper);

    const issueCommentInfo: IssueCommentInfo = new IssueCommentInfo(123, 'my-owner', 'repository', [], 1234);

    const reaction: ReactionType = 'heart';
    await addReactionCommentHelper.addReaction(reaction, issueCommentInfo);

    expect(octokit.reactions.createForIssueComment).toBeCalled();
    const params: Octokit.ReactionsCreateForIssueCommentParams = octokit.reactions.createForIssueComment.mock.calls[0][0];

    expect(params.content).toBe(reaction);
    expect(params.comment_id).toBe(issueCommentInfo.commentId);
    expect(params.owner).toBe(issueCommentInfo.owner);
    expect(params.repo).toBe(issueCommentInfo.repo);
    expect(params.repo).toBe(issueCommentInfo.repo);
  });

});
