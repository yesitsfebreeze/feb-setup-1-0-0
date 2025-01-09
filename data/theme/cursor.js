{
	const ANIMATION_TIME = 382 // ms
	const SHRINK = 0.6
	const MAX_LENGTH = 100

	const cursor_list = []

	const ANIMATION_EASING = function (x) {
		return -(Math.cos(Math.PI * x) - 1) / 2
	}

	function overlaps(a, b) {
		return a.left < b.right
			&& a.right > b.left
			&& a.top < b.bottom
			&& a.bottom > b.top
	}

	function validate(cursor) {
		const visible = cursor.checkVisibility({
			visibilityProperty: true,
			contentVisibilityAuto: true,
		})
		if (!visible) return false
		const bbox = cursor.getBoundingClientRect()
		let view = cursor.closest(".monaco-editor")
		let view_bbox = view.getBoundingClientRect()
		if (!view) return false
		if (!overlaps(bbox, view_bbox)) return false

		let minimap = view.querySelector(".minimap")
		if (minimap) {
			let minimap_bbox = minimap.getBoundingClientRect()
			if (overlaps(bbox, minimap_bbox)) return false
		}

		return true
	}

	function create_canvas(container, cls) {
		let canvas = container.querySelector(`.${cls}`)
		if (!canvas) {
			const c = document.createElement('canvas')
			c.className = cls
			c.style.position = "fixed"
			c.style.pointerEvents = "none"
			c.style.top = 0
			c.style.left = 0
			c.style.zIndex = 1
			container.insertBefore(c, container.firstChild)
			canvas = c
		}

		return canvas
	}

	function order_points(points) {
		const centroid = points.reduce(
			(acc, point) => ({
				x: acc.x + point.x / points.length,
				y: acc.y + point.y / points.length,
			}),
			{ x: 0, y: 0 }
		)

		return points.sort((a, b) => {
			const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x)
			const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x)
			return angleA - angleB
		})
	}

	function farthest_points(center, points) {
		const distances = points.map(point => ({
			point,
			distance: Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
		}))

		distances.sort((a, b) => b.distance - a.distance)
		return [distances[0].point, distances[1].point]
	}

	function get_points(a, b) {
		const centerA = { x: (a.tl.x + a.br.x) / 2, y: (a.tl.y + a.br.y) / 2 }
		const centerB = { x: (b.tl.x + b.br.x) / 2, y: (b.tl.y + b.br.y) / 2 }

		const pointsA = [a.tl, a.tr, a.br, a.bl]
		const pointsB = [b.tl, b.tr, b.br, b.bl]

		const _a = farthest_points(centerA, pointsB)
		const _b = farthest_points(centerB, pointsA)

		return order_points([..._a, ..._b])
	}


	function lerp(a, b, t) {
		return a + (b - a) * t
	}

	function draw(c, ctnr, ctx, delta) {
		let opacity = 1
		c.els.forEach(el => {
			if (el.parentNode) {
				opacity = Math.min(opacity, get_float_value(el.parentNode, "opacity"))
			}
		})
		c.time -= delta
		c.time = Math.max(c.time, 0)
		const percent = c.time / ANIMATION_TIME

		const w = c.size.x
		const h = c.size.y
		const dx = c.smear.x - c.pos.x
		const dy = c.smear.y - c.pos.y
		const distance = Math.sqrt(dx * dx + dy * dy) || 1

		let points = [
			{ x: c.pos.x, y: c.pos.y },
			{ x: c.pos.x + w, y: c.pos.y },
			{ x: c.pos.x + w, y: c.pos.y + h },
			{ x: c.pos.x, y: c.pos.y + h },
		]

		if (distance > 1) {
			const t = ANIMATION_EASING(1 - percent)

			const clamped_x = Math.min(MAX_LENGTH, distance) * dx / distance
			const clamped_y = Math.min(MAX_LENGTH, distance) * dy / distance
			c.smear.x = c.pos.x + clamped_x
			c.smear.y = c.pos.y + clamped_y


			c.smear.x = lerp(c.smear.x, c.pos.x, t)
			c.smear.y = lerp(c.smear.y, c.pos.y, t)

			let x_inset = lerp(w / 2 - w / 2 * SHRINK, 0, t)
			let y_inset = lerp(h / 2 - h / 2 * SHRINK, 0, t)

			const t_rect = {
				tl: { x: c.pos.x + x_inset * 0.75, y: c.pos.y + y_inset * 0.75 },
				tr: { x: c.pos.x + w - x_inset * 0.75, y: c.pos.y + y_inset * 0.75 },
				br: { x: c.pos.x + w - x_inset * 0.75, y: c.pos.y + h - y_inset * 0.75 },
				bl: { x: c.pos.x + x_inset * 0.75, y: c.pos.y + h - y_inset * 0.75 },
			}

			const s_rect = {
				tl: { x: c.smear.x + x_inset, y: c.smear.y + y_inset },
				tr: { x: c.smear.x + w - x_inset, y: c.smear.y + y_inset },
				br: { x: c.smear.x + w - x_inset, y: c.smear.y + h - y_inset },
				bl: { x: c.smear.x + x_inset, y: c.smear.y + h - y_inset },
			}

			points = get_points(t_rect, s_rect)
		}

		ctx.save()
		ctx.fillStyle = c.background
		ctx.globalAlpha = opacity

		ctx.beginPath()
		ctx.moveTo(points[0].x, points[0].y)

		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y)
		}

		ctx.closePath()
		ctx.fill()
		ctx.restore()

		c.els.forEach(el => {
			if (!el.parentNode) return
			if (!el.parentNode.classList.contains("cursor-block-style")) return
			const clone = el.cloneNode(true)
			clone.style.left = c.pos.x + "px"
			clone.style.top = c.pos.y + "px"
			clone.style.position = "fixed"
			clone.style.zIndex = 2
			clone.style.color = c.color
			clone.style.opacity = opacity
			ctnr.appendChild(clone)
		})
	}

	function get_float_value(el, property) {
		return parseFloat(getComputedStyle(el).getPropertyValue(property).replace("px", ""))
	}

	function assign(cursor, idx) {
		cursor.style.backgroundColor = "transparent"

		if (!validate(cursor)) return

		const c = cursor_list[idx] || {}
		const cp = cursor.getBoundingClientRect()

		c.pos = { x: cp.left, y: cp.top }
		c.size = { x: cursor.offsetWidth, y: cursor.offsetHeight }
		c.background = getComputedStyle(
			document.querySelector("body>.monaco-workbench"))
			.getPropertyValue("--vscode-editorCursor-foreground")
			.trim()
		c.color = getComputedStyle(
			document.querySelector("body>.monaco-workbench"))
			.getPropertyValue("--vscode-editorCursor-background")
			.trim()
		c.last_pos = c.last_pos || c.pos
		c.smear = c.smear || c.pos
		c.time = c.time || 0
		c.els = c.els || []
		if (!c.els.includes(cursor)) {
			c.els.push(cursor)
		}

		if (c.last_pos.x !== cp.left || c.last_pos.y !== cp.top) {
			c.time = ANIMATION_TIME
			c.smear = c.last_pos
			c.last_pos = c.pos
		}
		cursor_list[idx] = c
	}

	const anim = requestAnimationFrame || (callback => setTimeout(callback, 1000 / 60))
	async function run() {
		let editor
		let last
		let delta

		function rr(stamp) {
			last = stamp
			anim(step)
		}

		function step(stamp) {
			try {
				delta = (stamp - last)
				editor = document.querySelector(".part.editor")
				if (editor === null) return rr(stamp)
				const container = document.querySelector(".monaco-grid-view")
				const container_bbox = container.getBoundingClientRect()
				const canvas = create_canvas(container, 'cursor-trails')
				canvas.width = container_bbox.width
				canvas.height = container_bbox.height
				const ctx = canvas.getContext('2d')
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				const cursors = Array.from(editor.getElementsByClassName("cursor"))

				let cursor_container = document.querySelector(".cursor-container")
				if (!cursor_container) {
					cursor_container = document.createElement("div")
					cursor_container.className = "cursor-container"
					cursor_container.style.position = "fixed"
					cursor_container.style.pointerEvents = "none"
					cursor_container.style.top = 0
					cursor_container.style.left = 0
					cursor_container.style.zIndex = 2

					document.body.appendChild(cursor_container)
				}

				cursor_container.innerHTML = ""


				if (cursors.length === 0) return rr(stamp)
				let idx = 0

				cursors.forEach(cursor => {
					if (cursor.classList.contains("cursor-secondary")) idx++
					assign(cursor, idx)
				})

				if (cursor_list.length > idx + 1) {
					cursor_list.splice(cursors.length, cursor_list.length - cursors.length)
				}

				cursor_list.forEach(cursor => {
					draw(cursor, cursor_container, ctx, delta)
				})

				rr(stamp)
			} catch (e) {
				console.log("DBG: ERR: ", e)
				rr(stamp)
			}
		}

		anim(step)
	}

	run()
}