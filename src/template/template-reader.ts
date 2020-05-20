import * as fs from 'fs-extra';
import * as handlerbars from 'handlebars';
import * as path from 'path';

import { injectable } from 'inversify';

@injectable()
export class TemplateReader {
  private templates: Map<string, string>;

  async initTemplates(): Promise<void> {
    const templates = new Map<string, string>();

    // search all md files
    const files = (await fs.readdir(__dirname)).filter((file) => file.endsWith('.md'));

    for await (const file of files) {
      const content = (await fs.readFile(path.join(__dirname, file))).toString();
      templates.set(file.substring(0, file.length - '.md'.length), content);
    }
    this.templates = templates;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async render(key: string, env?: any): Promise<string> {
    if (!this.templates) {
      await this.initTemplates();
    }

    if (!this.templates.has(key)) {
      return '';
    }
    const source = this.templates.get(key);
    const template: HandlebarsTemplateDelegate = handlerbars.compile(source);
    return template(env);
  }
}
