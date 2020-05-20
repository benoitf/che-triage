import { ContainerModule, interfaces } from 'inversify';

import { TemplateReader } from './template-reader';

const templatesModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TemplateReader).toSelf().inSingletonScope();
});

export { templatesModule };
