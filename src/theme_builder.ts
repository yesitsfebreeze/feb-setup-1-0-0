import * as vscode from "vscode";
import path from "path";
import fs from "fs"
import JSON5 from "json5"
import { colord, extend, Colord } from "colord";
import mixPlugin from "colord/plugins/mix";
extend([mixPlugin]);

export type Colors = { [key: string]: string }

const get_base_colors = () => {
	let ansi_colors = {
		"black": "#000000",
		"red": "#FF0000",
		"green": "#00FF00",
		"yellow": "#FFFF00",
		"blue": "#0000FF",
		"magenta": "#FF00FF",
		"cyan": "#00FFFF",
		"white": "#FFFFFF",
		"brightblack": "#000000",
		"brightred": "#FF0000",
		"brightgreen": "#00FF00",
		"brightyellow": "#FFFF00",
		"brightblue": "#0000FF",
		"brightmagenta": "#FF00FF",
		"brightcyan": "#00FFFF",
		"brightwhite": "#FFFFFF",
	}

	let syntax = {
		"syntax_bracket1": "$primary",
		"syntax_bracket2": "$primary",
		"syntax_bracket3": "$primary",
		"syntax_bracket4": "$primary",
		"syntax_bracket5": "$primary",
		"syntax_bracket6": "$primary",
		"syntax_text": "$white",
		"syntax_highlight": "$white",
		"syntax_keywords": "$white",
		"syntax_functions": "$white",
		"syntax_language_constants": "$white",
		"syntax_classes": "$white",
		"syntax_function_calls": "$white",
		"syntax_method_calls": "$white",
		"syntax_entities": "$white",
		"syntax_storage": "$white",
		"syntax_variables": "$white",
		"syntax_special_variables": "$white",
		"syntax_locals": "$white",
		"syntax_imports": "$white",
		"syntax_numbers": "$white",
		"syntax_strings": "$white",
		"syntax_regex": "$white",
		"syntax_links": "$white",
		"syntax_comments": "$muted",
		"syntax_operators": "$white",
		"syntax_punctuation": "$white",
		"syntax_properties": "$white",
		"syntax_parameters": "$white",
		"syntax_error": "$brightred",
	}

	let colors: Colors = {
		"primary": "#000000",
		"background": "#000000",
		"foreground": "#000000",
		"cursor": "#000000",
		...ansi_colors,
		...syntax
	}

	return colors
}

const create_colors = (context: vscode.ExtensionContext, colors: Colors) => {
	let file = vscode.workspace.getConfiguration("feb").theme_file
	if (file === "") {
		file = path.join(context.extensionPath, "data", "theme.ansi_colors")
	}
	let content = fs.readFileSync(file).toString()
	content.split("\n").forEach(line => {
		if (line.trim() === "") return
		if (line.startsWith("#")) return
		if (line.startsWith("//")) return
		let [name, color] = line.split("=")
		colors[name.trim()] = color.trim()
	})

	return colors
}

const build_variants = (colors: Colors) => {
	let cursor_color = colord(colors["cursor"] as string)
	let primary_color = colord(colors["primary"] as string)
	let background_color = colord(colors["background"] as string)
	let foreground_color = colord(colors["foreground"] as string)

	if (cursor_color.brightness() > background_color.brightness()) {
		colors["oncursor"] = colors["background"]
	} else {
		colors["oncursor"] = colors["foreground"]
	}

	if (primary_color.brightness() > background_color.brightness()) {
		colors["onprimary"] = colors["background"]
	} else {
		colors["onprimary"] = colors["foreground"]
	}

	let ansi_colors = [
		"red",
		"green",
		"yellow",
		"blue",
		"magenta",
		"cyan",
		"brightred",
		"brightgreen",
		"brightyellow",
		"brightblue",
		"brightmagenta",
		"brightcyan",
	]

	let mid: Colord = colord(colors["red"] as string);
	ansi_colors.forEach(name => {
		if (name === "red") return
		mid = mid.mix(colord(colors[name] as string), 0.5)
	});

	if (background_color.brightness() > foreground_color.brightness()) {
		colors["muted"] = background_color.darken(0.2).toHex()
		colors["subtle"] = background_color.darken(0.02).toHex()
		colors["selection"] = background_color.darken(0.2).toHex()
		colors["comments"] = background_color.darken(0.075).toHex()
	} else {
		colors["muted"] = background_color.lighten(0.12).toHex()
		colors["subtle"] = background_color.darken(0.02).toHex()
		colors["selection"] = background_color.lighten(0.05).toHex()
		colors["comments"] = background_color.lighten(0.25).toHex()
	}

	Object.entries(colors).forEach(([name, color]) => {
		colors[name] = resolve_color(colors, color)
	})

	return colors
}

const resolve_color = (colors: Colors, color: string) => {
	let c = color
	if (color.startsWith("$")) {
		c = color.slice(1)
		Object.entries(colors).forEach(([name, value]) => {
			if (c.startsWith(name)) {
				c = value
			}
		})
		if (c.startsWith("$")) {
			c = resolve_color(colors, c)
		}
	}

	return c
}

export const replace_colors = (content: string, colors: Colors) => {
	Object.entries(colors).forEach(([name, color]) => {
		content = content.replaceAll(`$${name}`, color)
	})
	return content
}


const build_colors = (context: vscode.ExtensionContext, theme: any, colors: Colors) => {
	const templates = path.join(context.extensionPath, "data", "theme", "definitions")

	theme.colors = {}

	fs.readdirSync(templates).forEach((file: string) => {
		const template_file = path.join(templates, file)
		let content = fs.readFileSync(template_file).toString()
		content = replace_colors(content, colors)
		const data = JSON5.parse(content).colors
		Object.entries(data).forEach(([key, value]) => {
			if (key == "$schema") return;
			theme.colors[key] = value
		})
	})

	return theme
}

const build_syntax = (context: vscode.ExtensionContext, theme: any, colors: Colors) => {
	const syntax_file = path.join(context.extensionPath, "data", "theme", "syntax_template.tmTheme")
	let content = fs.readFileSync(syntax_file).toString()

	const theme_file = path.join(context.extensionPath, "syntax.tmTheme")
	content = replace_colors(content, colors)
	fs.writeFileSync(theme_file, content);

	theme.tokenColors = "./syntax.tmTheme"

	theme.semanticHighlighting = true
	theme.semanticTokenColors = {
		"parameter": colors["syntax_parameters"],
	}


	return theme
}

export function get_colors(context: vscode.ExtensionContext) {
	let colors = get_base_colors()
	build_variants(create_colors(context, colors))
	return colors
}


export default function (context: vscode.ExtensionContext, colors: Colors) {
	let theme = {
		"$schema": "vscode://schemas/color-theme",
	}
	theme = build_colors(context, theme, colors)
	theme = build_syntax(context, theme, colors)

	let theme_file = path.join(context.extensionPath, "theme.json")
	fs.writeFileSync(theme_file, JSON.stringify(theme, null, 2));

	let colors_file = path.join(context.extensionPath, "colors.json")
	fs.writeFileSync(colors_file, JSON.stringify(colors, null, 2));
}
