import { ContainerModule, interfaces } from 'inversify';

import { CheVersionFetcher } from './che-version-fetcher';

const fetchersModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(CheVersionFetcher).toSelf().inSingletonScope();
});

export { fetchersModule };
