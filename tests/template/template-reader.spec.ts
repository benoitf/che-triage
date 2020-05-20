import 'reflect-metadata';

import { Container } from 'inversify';
import { TemplateReader } from '../../src/template/template-reader';

describe('Test TemplateReader', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(TemplateReader).toSelf().inSingletonScope();
  });

  test('test template', async () => {
    const templateReader = container.get(TemplateReader);

    const env = {
      AUTHOR: 'authorName',
    };
    jest.spyOn(templateReader, 'initTemplates');
    const result = await templateReader.render('test-template', env);
    expect(templateReader.initTemplates).toBeCalled();
    expect(result).toBe(`hello ${env.AUTHOR}`);
  });

  test('test template not found', async () => {
    const templateReader = container.get(TemplateReader);
    jest.spyOn(templateReader, 'initTemplates');

    const result = await templateReader.render('N/A', {});
    expect(result).toBe('');
    expect(templateReader.initTemplates).toBeCalled();

    // render again to check if we don't read again templates
    await templateReader.render('N/A', {});
    expect(templateReader.initTemplates).toBeCalledTimes(1);
  });
});
