import * as vscode from 'vscode';
import settings from './settings_loader';
import keybinds from './keybinds_loader';
import escape from './escape';
import theme from './theme';
import eol from './eol';
import { get_colors } from './theme_builder';
import background from './background';
import split from './split';

export function activate(context: vscode.ExtensionContext) {
	const colors = get_colors(context)
	background(context)
	escape(context)
	theme(context, colors, background)
	settings(context, colors)
	keybinds(context)
	split(context)

	eol(context, colors)
}
