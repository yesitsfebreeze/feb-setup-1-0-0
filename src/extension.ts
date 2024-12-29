import * as vscode from 'vscode';
import settings from './settings_loader';
import keybinds from './keybinds_loader';
import escape from './escape';
import theme from './theme';
import eol from './eol';
import split_move from './split_move';
import { get_colors } from './theme_builder';
import leadermode from './leader_mode/extension';

export async function activate(context: vscode.ExtensionContext) {
	const colors = get_colors(context)

	escape(context)
	theme(context, colors)
	settings(context, colors)
	keybinds(context)
	split_move(context)
	eol(context, colors)
	await leadermode(context)
}
