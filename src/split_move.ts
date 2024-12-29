import * as vscode from 'vscode'


export default function (context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('feb.split_move_right', async () => {
		let len = vscode.window.tabGroups.all.length;
		if (len === 1) {
			await vscode.commands.executeCommand('workbench.action.splitEditorRight');
			return;
		}
		await vscode.commands.executeCommand('workbench.action.focusRightGroupWithoutWrap');
	}))

	context.subscriptions.push(vscode.commands.registerCommand('feb.split_move_left', async () => {
		let len = vscode.window.tabGroups.all.length;
		if (len === 1) {
			await vscode.commands.executeCommand('workbench.action.splitEditorLeft');
			return;
		}
		await vscode.commands.executeCommand('workbench.action.focusLeftGroupWithoutWrap');
	}))

}
