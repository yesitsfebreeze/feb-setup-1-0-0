import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5'
import { Colors, replace_colors } from './theme_builder';

export default function (context: vscode.ExtensionContext, colors: Colors) {
	let settings: { [key: string]: any } = {}

	let css = path.join(context.extensionPath, "data", "theme", "custom.css")

	const settings_path = path.join(context.extensionPath, "data", "settings")
	fs.readdirSync(settings_path).forEach(file => {
		file = path.join(settings_path, file)

		let content = fs.readFileSync(file, 'utf-8')
		content = replace_colors(content, colors)
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
		[`file://${css}`,],
		vscode.ConfigurationTarget.Global
	);

}