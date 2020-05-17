const core: any = jest.genMockFromModule('@actions/core');

const inputs: Map<string, any> = new Map();

function __setInput(inputName: string, inputValue: any): void {
  inputs.set(inputName, inputValue);
}

function getInput(paramName: string): any {
  return inputs.get(paramName);
}

core.getInput = getInput;
core.__setInput = __setInput;

module.exports = core;
