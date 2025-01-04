import * as vscode from 'vscode'


export default function (context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('feb.split', async () => {
		let has_split = vscode.window.tabGroups.all.length != 1;
		let is_left = vscode.window.activeTextEditor?.viewColumn === 1;

		if (has_split) {
			if (is_left) {
				await vscode.commands.executeCommand('workbench.action.focusRightGroupWithoutWrap');
			} else {
				await vscode.commands.executeCommand('workbench.action.focusLeftGroupWithoutWrap');
			}
			return;
		}
		await vscode.commands.executeCommand('workbench.action.splitEditorRight');

	}))
}
