import * as vscode from 'vscode';

export default function (context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('feb.escape', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;
		const selections = editor.selections;
		vscode.commands.executeCommand('cancelSelection');
		if (selections.length === 1) return;
		let last = selections[selections.length - 1];
		editor.selections = [last];
		vscode.commands.executeCommand('cancelSelection');
	});

	context.subscriptions.push(disposable);
}
