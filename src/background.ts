import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export default function (context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('feb');

	const cache_file = path.join(context.extensionPath, "cache", "custom.css");

	let data = "";
	let opacity = config.bg_opacity;
	let blur = config.bg_blur;
	let brightness = config.bg_brightness;

	if (opacity < 0 || opacity > 1 || isNaN(opacity)) {
		vscode.workspace.getConfiguration().update(
			"feb.bg_opacity",
			1,
			vscode.ConfigurationTarget.Global
		);
		opacity = 1;
	}

	if (isNaN(blur)) {
		vscode.workspace.getConfiguration().update(
			"feb.bg_blur",
			0,
			vscode.ConfigurationTarget.Global
		);
		blur = 0;
	}

	if (brightness < 0 || brightness > 1 || isNaN(brightness)) {
		vscode.workspace.getConfiguration().update(
			"feb.bg_brightness",
			1,
			vscode.ConfigurationTarget.Global
		);
		brightness = 1;
	}

	if (config.bg_image !== '') {
		try {
			data = Buffer.from(fs.readFileSync(config.bg_image)).toString('base64');
		} catch (error: any) {
			vscode.window.showErrorMessage(`Failed to load the file: ${error.message}`);
			console.error('Error reading file:', error);
		}

		if (data === "") {
			vscode.workspace.getConfiguration().update(
				"feb.background",
				"none",
				vscode.ConfigurationTarget.Global
			);
		}
	}

	let css = path.join(context.extensionPath, "data", "theme", "custom.css");
	let content = fs.readFileSync(css, 'utf-8');
	content = content.replaceAll("___BACKGROUND___", data);
	content = content.replaceAll("___BACKGROUND_OPACITY___", opacity);
	content = content.replaceAll("___BACKGROUND_BLUR___", blur);
	content = content.replaceAll("___BACKGROUND_BRIGHTNESS___", brightness);
	fs.writeFileSync(cache_file, content);
}
