import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5'

export default function (context: vscode.ExtensionContext) {
	let settings: { [key: string]: any } = {}

	let css = path.join(context.extensionPath, "cache", "custom.css")
	let cursor_js = path.join(context.extensionPath, "data", "theme", "cursor.js")

	const settings_path = path.join(context.extensionPath, "data", "settings")
	fs.readdirSync(settings_path).forEach(file => {
		file = path.join(settings_path, file)

		let content = fs.readFileSync(file, 'utf-8')
		let data = JSON5.parse(content)
		Object.entries(data).forEach(([key, value]) => {
			if (key == "$schema") return;
			settings[key] = value
		})
	})

	Object.entries(settings).forEach(el => {
		vscode.workspace.getConfiguration().update(el[0], el[1], vscode.ConfigurationTarget.Global);
	});


	vscode.workspace.getConfiguration().update(
		"vscode_custom_css.imports",
		[
			`file://${css}`,
			`file://${cursor_js}`,

		],
		vscode.ConfigurationTarget.Global
	);


}