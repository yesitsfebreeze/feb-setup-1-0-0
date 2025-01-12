import * as vscode from 'vscode';


export default function (context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('feb.split', async () => {
		let has_split = vscode.window.tabGroups.all.length !== 1;
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
	}));


	context.subscriptions.push(vscode.commands.registerCommand('feb.split_hs', async () => {
		let has_split = vscode.window.tabGroups.all.length !== 1;
		let is_left = vscode.window.activeTextEditor?.viewColumn === 1;
		let is_header = false;
		let is_source = false;

		let file_to_open: string | undefined;
		let file_name: string | undefined
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			file_name = activeEditor.document.uri.fsPath;
			const fileExtension = file_name.split('.').pop() as string;


			if (['c', 'cc', 'cpp', 'cxx'].includes(fileExtension)) {
				file_to_open = file_name.replace(".c", ".h")
				is_source = true
			}

			if (['h', 'hh', 'hpp', 'hxx'].includes(fileExtension)) {
				file_to_open = file_name.replace(".h", ".c")
				is_header = true
			}
		}

		if (has_split) {
			if (is_left) {
				if (is_header && file_to_open) {
					await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_to_open));
				}
				await vscode.commands.executeCommand('workbench.action.focusRightGroupWithoutWrap');
				if (file_name) {
					await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_name));
				}
			} else {
				await vscode.commands.executeCommand('workbench.action.focusLeftGroupWithoutWrap');
				if (is_source && file_name) {
					await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_name));
				}
				await vscode.commands.executeCommand('workbench.action.focusRightGroupWithoutWrap');
				if (file_to_open) {
					await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_to_open));
				}
			}
			return;
		}

		if (is_header) {
			if (file_to_open) {
				await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_to_open));
			}
			await vscode.commands.executeCommand('workbench.action.splitEditorRight');
			if (file_name) {
				await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_name));
			}
			await vscode.commands.executeCommand('workbench.action.focusLeftGroupWithoutWrap');
		}

		if (is_source) {
			await vscode.commands.executeCommand('workbench.action.splitEditorRight');
			if (file_to_open) {
				await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file_to_open));
			}
		}

	}));
}
