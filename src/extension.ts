'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import commandHandlers from './command_handlers';
import output from './output';
import wifi from './wifi';
import commandsConfig from './config';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    output.init();
    output.showChannel();
    wifi.start();
    wifi.log();
    initCommands(context);
}

function initCommands(context: vscode.ExtensionContext) {
    const subscriptions = commandsConfig.reduce((subscriptions, command) => {
        const curSub = vscode.commands.registerCommand(`${command.command}`, uri => {
            const namespace = 'Minxing';
            const c = command.command;
            if (!(new RegExp(`^${namespace}`)).test(c)) {
                return;
            }
            const method = c.split('.')[1];
            if (commandHandlers[method] instanceof Function) {
                commandHandlers[method](uri);
            }
        });
        return [...subscriptions, curSub]
    }, []);
    context.subscriptions.push(...subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {
}