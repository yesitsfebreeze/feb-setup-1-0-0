import * as vscode from 'vscode';
import settings from './settings_loader';
import keybinds from './keybinds_loader';
import escape from './escape';
import eol from './eol';
import background from './background';
import split from './split';

export function activate(context: vscode.ExtensionContext) {
	background(context);
	escape(context);
	settings(context);
	keybinds(context);
	split(context);
	eol(context);

	let disp = vscode.commands.registerCommand('feb.reload', async () => {
		background(context);
		settings(context);
		keybinds(context);
		vscode.commands.executeCommand("extension.updateCustomCSS");
		setTimeout(function () {
			vscode.commands.executeCommand('workbench.action.reloadWindow');
		}, 2000);
	});

	context.subscriptions.push(disp);
}
