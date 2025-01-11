import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5';



function add_file(file: string) {
	const f = `file://${file}`
	const conf = vscode.workspace.getConfiguration()
	if (conf.vscode_custom_css.imports.includes(f)) return

	conf.vscode_custom_css.imports.push(f)

	conf.update(
		"vscode_custom_css.imports",
		conf.vscode_custom_css.imports,
		vscode.ConfigurationTarget.Global
	)
}


export default function (context: vscode.ExtensionContext) {
	let settings: { [key: string]: any } = {};



	const settings_path = path.join(context.extensionPath, "data", "settings");
	fs.readdirSync(settings_path).forEach(file => {
		file = path.join(settings_path, file);

		let content = fs.readFileSync(file, 'utf-8');
		let data = JSON5.parse(content);
		Object.entries(data).forEach(([key, value]) => {
			if (key === "$schema") {
				return;
			}
			settings[key] = value;
		});
	});

	Object.entries(settings).forEach(el => {
		vscode.workspace.getConfiguration().update(el[0], el[1], vscode.ConfigurationTarget.Global);
	});

	add_file(path.join(context.extensionPath, "cache", "custom.css"))
	add_file(path.join(context.extensionPath, "data", "theme", "blur.js"))
}