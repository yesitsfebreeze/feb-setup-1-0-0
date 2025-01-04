import * as vscode from 'vscode'
import theme_builder, { Colors, get_colors } from './theme_builder';

export default function (context: vscode.ExtensionContext, colors: Colors, background: Function) {
	theme_builder(context, colors)

	let disposable1 = vscode.commands.registerCommand('feb.pick_theme', async () => {
		const fileUri = await vscode.window.showOpenDialog({
			canSelectMany: false,
			openLabel: 'Select a file',
			filters: {
				'Text files': ['ansi'],
			}
		});

		if (fileUri && fileUri[0]) {
			const selectedFile = fileUri[0].fsPath;
			const config = vscode.workspace.getConfiguration('feb');
			config.update('theme_file', selectedFile, vscode.ConfigurationTarget.Global);
			theme_builder(context, colors)
		}
	});


	let disposable2 = vscode.commands.registerCommand('feb.build_theme', async () => {
		let _colors = get_colors(context)
		theme_builder(context, _colors)
		vscode.commands.executeCommand('workbench.action.reloadWindow');
	});

	let disposable3 = vscode.commands.registerCommand('feb.update_background', async () => {
		background(context)
		vscode.commands.executeCommand("extension.updateCustomCSS")
		setTimeout(function () {
			vscode.commands.executeCommand('workbench.action.reloadWindow');
		}, 2000);
	});

	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
}