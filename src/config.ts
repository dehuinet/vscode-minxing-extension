const config = require('../package.json');
const commands = config.contributes.commands;
const extensionName = config.displayName;
export default {
    commands,
    extensionName,
};