'use strict';

import * as MXAPI from 'minxing-devtools-core';
import * as vscode from 'vscode';
import {
    WifiInfo
} from './domain';
import * as path from 'path';
export function getTempPath(): string {
    const tempPath = path.resolve(path.dirname(__dirname), 'temp');
    return tempPath;
}
export function getRandomNum(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function getPathOrActive(uri): string {
    uri = uri && uri.fsPath ? uri.fsPath : uri;
    let filePath = uri;
    if (!filePath) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const resource = editor.document.uri;
            if (resource.scheme === 'file') {
                filePath = resource.fsPath;
            }
        }
    }
    return filePath;
}

export function getActivePathOrProject(uri): string {
    let filePath = getPathOrActive(uri);
    if (!filePath && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
        const project = vscode.workspace.workspaceFolders[0].uri;
        filePath = project.fsPath;
    }
    return filePath;
}