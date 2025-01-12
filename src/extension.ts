import * as vscode from 'vscode';
import settings from './settings_loader';
import keybinds from './keybinds_loader';
import escape from './escape';
import eol from './eol';
import background from './background';
import split from './split';

import { activate as leadermode } from './leadermode/extension';

export function activate(context: vscode.ExtensionContext) {
	background(context);
	escape(context);
	settings(context);
	keybinds(context);
	split(context);
	eol(context);
	leadermode(context)

	context.subscriptions.push(vscode.commands.registerCommand('feb.reload', async () => {
		background(context);
		settings(context);
		keybinds(context);
		vscode.commands.executeCommand("smearcursor.enable");
		vscode.commands.executeCommand("extension.updateCustomCSS");
		setTimeout(function () {
			vscode.commands.executeCommand('workbench.action.reloadWindow');
		}, 2000);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('feb.leadermode', async () => {
		const editorGroups = vscode.window.visibleTextEditors;
		if (editorGroups.length === 0) {
			await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
		} else {
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor?.document) {
				await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
				await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
			}
		}
		await vscode.commands.executeCommand('leadermode.enter');
	}));
}
