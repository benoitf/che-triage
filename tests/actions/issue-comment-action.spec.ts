import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as path from 'path';

import { Container } from 'inversify';
import { IssueCommentAction } from '../../src/actions/issue-comment-action';
import { IssueCommentInfo } from '../../src/info/issue-comment-info';
import { AddReactionCommentHelper } from '../../src/helpers/add-reaction-comment-helper';

describe('Test Action IssueCommentAction', () => {
  let container: Container;

  const addReactionCommentHelper: AddReactionCommentHelper = {
    addReaction: jest.fn(),
  } as any;


  beforeEach(() => {
    container = new Container();
    container.bind(AddReactionCommentHelper).toConstantValue(addReactionCommentHelper);
    container.bind(IssueCommentAction).toSelf().inSingletonScope();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test not execute', async () => {
    const issueCommentAction = container.get(IssueCommentAction);

    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue_comment', 'created', 'new-comment.json'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fooMock: any = { dummyCall: jest.fn() };
    issueCommentAction.registerIssueCommentCommand('/foo', async () => {
      fooMock.dummyCall();
    });

    await issueCommentAction.execute(json);
    expect(fooMock.dummyCall).toBeCalledTimes(0);
    expect(addReactionCommentHelper.addReaction).toBeCalledTimes(0);
    
  });

  // created comment should trigger action
  test('test single created execute', async () => {
    const issueCommentAction = container.get(IssueCommentAction);

    const json = await fs.readJSON(
      path.join(__dirname, '..', '_data', 'issue_comment', 'created', 'remove-lifecycle-stale.json')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fooMock: any = { dummyCall: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let issueCommentInfo: IssueCommentInfo = jest.fn() as any;
    issueCommentAction.registerIssueCommentCommand('/remove-lifecycle stale', async (issueInfo: IssueCommentInfo) => {
      fooMock.dummyCall();
      issueCommentInfo = issueInfo;
    });

    await issueCommentAction.execute(json);
    expect(fooMock.dummyCall).toHaveBeenCalled();
    expect(issueCommentInfo).toBeDefined();
    expect(issueCommentInfo.repo).toEqual('demo-gh-event');
    expect(issueCommentInfo.number).toEqual(1);
    expect(issueCommentInfo.owner).toEqual('benoitf');
    expect(issueCommentInfo.commentId).toEqual(628762120);

    expect(addReactionCommentHelper.addReaction).toHaveBeenCalled();
    const call = (addReactionCommentHelper.addReaction as jest.Mock).mock.calls[0];
    expect(call[0]).toEqual('+1');
    expect(call[1]).toEqual(issueCommentInfo);

  });

  // edited comment should trigger action
  test('test single edited execute', async () => {
    const issueCommentAction = container.get(IssueCommentAction);

    const json = await fs.readJSON(
      path.join(__dirname, '..', '_data', 'issue_comment', 'edited', 'remove-lifecycle-stale.json')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fooMock: any = { dummyCall: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let issueCommentInfo: IssueCommentInfo = jest.fn() as any;
    issueCommentAction.registerIssueCommentCommand('/remove-lifecycle stale', async (issueInfo: IssueCommentInfo) => {
      fooMock.dummyCall();
      issueCommentInfo = issueInfo;
    });

    await issueCommentAction.execute(json);
    expect(fooMock.dummyCall).toHaveBeenCalled();
    expect(issueCommentInfo).toBeDefined();
    expect(issueCommentInfo.repo).toEqual('demo-gh-event');
    expect(issueCommentInfo.number).toEqual(1);
    expect(issueCommentInfo.owner).toEqual('benoitf');
    expect(issueCommentInfo.commentId).toEqual(628762120);

    expect(addReactionCommentHelper.addReaction).toHaveBeenCalled();
    const call = (addReactionCommentHelper.addReaction as jest.Mock).mock.calls[0];
    expect(call[0]).toEqual('+1');
    expect(call[1]).toEqual(issueCommentInfo);


  });

  // deleted comment should not trigger action
  test('test single deleted execute', async () => {
    const issueCommentAction = container.get(IssueCommentAction);

    const json = await fs.readJSON(
      path.join(__dirname, '..', '_data', 'issue_comment', 'deleted', 'remove-lifecycle-stale.json')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fooMock: any = { dummyCall: jest.fn() };
    let issueCommentInfo: IssueCommentInfo | undefined = undefined;
    issueCommentAction.registerIssueCommentCommand('/remove-lifecycle stale', async (issueInfo: IssueCommentInfo) => {
      fooMock.dummyCall();
      issueCommentInfo = issueInfo;
    });

    await issueCommentAction.execute(json);
    expect(fooMock.dummyCall).toHaveBeenCalledTimes(0);
    expect(issueCommentInfo).toBeUndefined();

    expect(addReactionCommentHelper.addReaction).toBeCalledTimes(0);

  });
});
