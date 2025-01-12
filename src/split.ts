import * as vscode from 'vscode';
import * as fs from 'fs';

enum SplitType {
	LEFT = 0,
	RIGHT = 1,
}

function exists(filePath: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		fs.access(filePath, fs.constants.F_OK, (err) => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

async function open(path: string, split: SplitType) {
	if (split === SplitType.LEFT) {
		await vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
	} else {
		await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup');
	}

	await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path));
}

export default function (context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('feb.split', async () => {
		let has_split = vscode.window.tabGroups.all.length !== 1;
		let is_left = vscode.window.activeTextEditor?.viewColumn === 1;

		if (has_split) {
			if (is_left) {
				await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup');
			} else {
				await vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
			}
			return;
		}
		await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup');
	}));


	context.subscriptions.push(vscode.commands.registerCommand('feb.split_hs', async () => {
		let is_header = false;
		let is_source = false;

		let header_file: string | undefined;
		let source_file: string | undefined

		let file_name: string | undefined
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			file_name = activeEditor.document.uri.fsPath;
			const ext = file_name.split('.').pop() as string;

			if (['c', 'cc', 'cpp', 'cxx'].includes(ext)) {
				header_file = file_name.replace(`.${ext}`, `.${ext.replaceAll("c", "h")}`)
				source_file = file_name
				is_source = true
			}

			if (['h', 'hh', 'hpp', 'hxx'].includes(ext)) {
				header_file = file_name
				source_file = file_name.replace(`.${ext}`, `.${ext.replaceAll("h", "c")}`)
				is_header = true
			}
		}

		if (!source_file && !header_file) return

		if (!(await exists(source_file!) && await exists(header_file!))) {
			return
		}

		if (file_name === source_file) {
			open(source_file!, SplitType.LEFT);
			open(header_file!, SplitType.RIGHT);
		}

		if (file_name === header_file) {
			open(header_file!, SplitType.RIGHT);
			open(source_file!, SplitType.LEFT);
		}
	}));
}
