import * as vscode from 'vscode';

export default function (context: vscode.ExtensionContext) {
	const nullDecoration = vscode.window.createTextEditorDecorationType({});

	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) { updateDecorations(); }

	vscode.window.onDidChangeActiveTextEditor(
		(editor) => {
			activeEditor = editor;
			if (editor) {
				updateDecorations();
			}
		},
		null,
		context.subscriptions
	);

	vscode.workspace.onDidChangeTextDocument(
		() => {
			updateDecorations();
		},
		null,
		context.subscriptions
	);

	function updateDecorations() {
		if (!activeEditor) { return; }
		const regEx = /(\r(?!\n))|(\r?\n)/g;
		const text = activeEditor.document.getText();
		const newLines: vscode.DecorationOptions[] = [];
		let match;
		while ((match = regEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index);
			const decoration: vscode.DecorationOptions = {
				range: new vscode.Range(startPos, endPos),
				renderOptions: {
					after: {
						contentText: '¬',
						color: new vscode.ThemeColor('editorWhitespace.foreground')
					}
				}
			};
			newLines.push(decoration);
		}
		activeEditor.setDecorations(nullDecoration, newLines);
	}
}
