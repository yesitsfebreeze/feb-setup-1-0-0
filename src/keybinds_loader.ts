import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import os from "os"
import JSON5 from 'json5'

export default function (context: vscode.ExtensionContext) {

	let kb_path = ""
	const pf = os.platform()
	const home = os.homedir()
	const file = "keybinds.json"
	if (pf == "darwin") {
		kb_path = path.join(home, "Library/Application Support/Code/User", file)
	} else if (pf == "linux") {
		kb_path = path.join(home, ".config/Code/User", file)
	} else if (pf == "win32") {
		kb_path = path.join(home, "AppData/Roaming/Code/User", file)
	}

	if (kb_path == "") return;

	let bindings: any[] = [];

	let keybinds: Array<any> = []
	const settings_path = path.join(context.extensionPath, "data", "keybinds")
	fs.readdirSync(settings_path).forEach(file => {
		file = path.join(settings_path, file)
		let data = JSON5.parse(fs.readFileSync(file, 'utf-8')) as Array<any>
		data.forEach(entry => keybinds.push(entry))
	})

	keybinds.forEach((binding: any) => {
		bindings.push(binding);
	});


	fs.writeFileSync(kb_path, JSON.stringify(bindings, null, 2));
}