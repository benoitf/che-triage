/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AddCommentHelper } from '../../src/helpers/add-comment-helper';
import { AddWelcomeFirstIssueLogic } from '../../src/logic/add-welcome-first-issue';
import { Container } from 'inversify';
import { IssueAction } from '../../src/actions/issue-action';
import { IssuesHelper } from '../../src/helpers/issue-helper';
import { TemplateReader } from '../../src/template/template-reader';
import { IssueInfo } from '../../src/info/issue-info';

describe('Test Logic AddWelcomeFirstIssue', () => {
  let container: Container;
  let issueAction: IssueAction;
  let issueHelper: IssuesHelper;
  let addCommentHelper: AddCommentHelper;
  let templateReader: TemplateReader;

  beforeEach(() => {
    container = new Container();
    container.bind(AddWelcomeFirstIssueLogic).toSelf().inSingletonScope();

    issueAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(IssueAction).toConstantValue(issueAction);

    issueHelper = {
      isFirstTime: jest.fn(),
    } as any;
    container.bind(IssuesHelper).toConstantValue(issueHelper);

    addCommentHelper = {
      addComment: jest.fn(),
    } as any;
    container.bind(AddCommentHelper).toConstantValue(addCommentHelper);

    templateReader = {
      render: jest.fn(),
    } as any;
    container.bind(TemplateReader).toConstantValue(templateReader);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test Is First Time', async () => {
    const addWelcomeFirstIssueLogic = container.get(AddWelcomeFirstIssueLogic);

    // will return true
    (issueHelper.isFirstTime as jest.Mock).mockReturnValue(true);

    // template
    const templateResult = 'foo';
    (templateReader.render as jest.Mock).mockReturnValue(Promise.resolve(templateResult));

    addWelcomeFirstIssueLogic.setup();

    // check
    expect(issueAction.registerCallback).toBeCalled();
    const registerCallbackCall = (issueAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstIssueLogic.ISSUE_EVENT);
    const callback = registerCallbackCall[1];

    const issueInfo: IssueInfo = jest.fn() as any;

    // call the callback
    await callback(issueInfo);

    expect(issueHelper.isFirstTime).toBeCalled();
    const isFirstTimeContributorCall = (issueHelper as any).isFirstTime.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(issueInfo);

    expect(addCommentHelper.addComment).toBeCalled();
    const addCommentCall = (addCommentHelper as any).addComment.mock.calls[0];
    expect(addCommentCall[0]).toBe(templateResult);

    expect(templateReader.render).toBeCalled();

    // check that the template requested exists
    const templateReaderCall = (templateReader as any).render.mock.calls[0];
    const askedTemplate = templateReaderCall[0];
    const txt = await new TemplateReader().render(askedTemplate);
    expect(txt).toBeDefined();
    expect(txt.length).toBeGreaterThan(0);
  });

  test('test Is Not First Time', async () => {
    const addWelcomeFirstIssueLogic = container.get(AddWelcomeFirstIssueLogic);

    // will return true
    (issueHelper.isFirstTime as jest.Mock).mockReturnValue(false);

    addWelcomeFirstIssueLogic.setup();

    // check
    expect(issueAction.registerCallback).toBeCalled();
    const registerCallbackCall = (issueAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstIssueLogic.ISSUE_EVENT);
    const callback = registerCallbackCall[1];

    const issueInfo: IssueInfo = jest.fn() as any;
    issueInfo.hasLabel = jest.fn();

    // call the callback
    await callback(issueInfo);

    expect(issueHelper.isFirstTime).toBeCalled();
    const isFirstTimeContributorCall = (issueHelper as any).isFirstTime.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(issueInfo);

    expect(addCommentHelper.addComment).toBeCalledTimes(0);
    expect(templateReader.render).toBeCalledTimes(0);
  });


  test('test not First Time but has label to test', async () => {
    const addWelcomeFirstIssueLogic = container.get(AddWelcomeFirstIssueLogic);

    // will return true
    (issueHelper.isFirstTime as jest.Mock).mockReturnValue(false);

    // template
    const templateResult = 'foo';
    (templateReader.render as jest.Mock).mockReturnValue(Promise.resolve(templateResult));

    addWelcomeFirstIssueLogic.setup();

    // check
    expect(issueAction.registerCallback).toBeCalled();
    const registerCallbackCall = (issueAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstIssueLogic.ISSUE_EVENT);
    const callback = registerCallbackCall[1];

    const issueInfo: IssueInfo = jest.fn() as any;
    issueInfo.hasLabel = jest.fn();
    (issueInfo.hasLabel as jest.Mock).mockReturnValue(true);

    // call the callback
    await callback(issueInfo);

    expect(issueInfo.hasLabel).toBeCalled();
    const hasLabelCall = (issueInfo as any).hasLabel.mock.calls[0];
    expect(hasLabelCall[0]).toBe(AddWelcomeFirstIssueLogic.TEST_LABEL);

    expect(issueHelper.isFirstTime).toBeCalled();
    const isFirstTimeContributorCall = (issueHelper as any).isFirstTime.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(issueInfo);

    expect(addCommentHelper.addComment).toBeCalled();
    const addCommentCall = (addCommentHelper as any).addComment.mock.calls[0];
    expect(addCommentCall[0]).toBe(templateResult);

    expect(templateReader.render).toBeCalled();

    // check that the template requested exists
    const templateReaderCall = (templateReader as any).render.mock.calls[0];
    const askedTemplate = templateReaderCall[0];
    const txt = await new TemplateReader().render(askedTemplate);
    expect(txt).toBeDefined();
    expect(txt.length).toBeGreaterThan(0);
  });
});
