/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AddCommentHelper } from '../../src/helpers/add-comment-helper';
import { AddWelcomeFirstPRLogic } from '../../src/logic/add-welcome-first-pr';
import { Container } from 'inversify';
import { PullRequestAction } from '../../src/actions/pull-request-action';
import { PullRequestHelper } from '../../src/helpers/pull-request-helper';
import { PullRequestInfo } from '../../src/info/pull-request-info';
import { TemplateReader } from '../../src/template/template-reader';

describe('Test Logic AddWelcomeFirstPr', () => {
  let container: Container;
  let pullRequestAction: PullRequestAction;
  let pullRequestHelper: PullRequestHelper;
  let addCommentHelper: AddCommentHelper;
  let templateReader: TemplateReader;

  beforeEach(() => {
    container = new Container();
    container.bind(AddWelcomeFirstPRLogic).toSelf().inSingletonScope();

    pullRequestAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(PullRequestAction).toConstantValue(pullRequestAction);

    pullRequestHelper = {
      isFirstTimeContributor: jest.fn(),
    } as any;
    container.bind(PullRequestHelper).toConstantValue(pullRequestHelper);

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
    const addWelcomeFirstPRLogic = container.get(AddWelcomeFirstPRLogic);

    // will return true
    (pullRequestHelper.isFirstTimeContributor as jest.Mock).mockReturnValue(true);

    // template
    const templateResult = 'foo';
    (templateReader.render as jest.Mock).mockReturnValue(Promise.resolve(templateResult));

    addWelcomeFirstPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();
    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual([AddWelcomeFirstPRLogic.PR_EVENT]);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;

    // call the callback
    await callback(pullRequestInfo);

    expect(pullRequestHelper.isFirstTimeContributor).toBeCalled();
    const isFirstTimeContributorCall = (pullRequestHelper as any).isFirstTimeContributor.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

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
    const addWelcomeFirstPRLogic = container.get(AddWelcomeFirstPRLogic);

    // will return true
    (pullRequestHelper.isFirstTimeContributor as jest.Mock).mockReturnValue(false);

    addWelcomeFirstPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();
    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual([AddWelcomeFirstPRLogic.PR_EVENT]);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;
    pullRequestInfo.hasLabel = jest.fn();

    // call the callback
    await callback(pullRequestInfo);

    expect(pullRequestHelper.isFirstTimeContributor).toBeCalled();
    const isFirstTimeContributorCall = (pullRequestHelper as any).isFirstTimeContributor.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

    expect(addCommentHelper.addComment).toBeCalledTimes(0);
    expect(templateReader.render).toBeCalledTimes(0);
  });

  test('test not First Time but has label', async () => {
    const addWelcomeFirstPRLogic = container.get(AddWelcomeFirstPRLogic);

    // will return true
    (pullRequestHelper.isFirstTimeContributor as jest.Mock).mockReturnValue(false);

    // template
    const templateResult = 'foo';
    (templateReader.render as jest.Mock).mockReturnValue(Promise.resolve(templateResult));

    addWelcomeFirstPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();
    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual([AddWelcomeFirstPRLogic.PR_EVENT]);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;
    pullRequestInfo.hasLabel = jest.fn();
    (pullRequestInfo.hasLabel as jest.Mock).mockReturnValue(true);

    // call the callback
    await callback(pullRequestInfo);

    expect(pullRequestInfo.hasLabel).toBeCalled();
    const hasLabelCall = (pullRequestInfo as any).hasLabel.mock.calls[0];
    expect(hasLabelCall[0]).toBe(AddWelcomeFirstPRLogic.TEST_LABEL);

    expect(pullRequestHelper.isFirstTimeContributor).toBeCalled();
    const isFirstTimeContributorCall = (pullRequestHelper as any).isFirstTimeContributor.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

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
