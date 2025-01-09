{
	const anim = requestAnimationFrame || (callback => setTimeout(callback, 1000 / 60))
	async function run() {
		let editor
		let video

		function step(stamp) {
			editor = document.querySelector(".part.editor")
			if (editor === null) return anim(step)

			if (video === undefined) {
				const container = document.createElement("div")
				container.id = "video-container"
				video = document.createElement("video")

				video.autoplay = true
				video.loop = true
				video.muted = true
				video.id = "video"

				const source = document.createElement("source")

				source.src = "bg.mp4"
				source.type = "video/mp4"
				video.appendChild(source)

				container.appendChild(video)
				editor.appendChild(container)

				video.addEventListener('canplaythrough', video.play)
			}

			anim(step)
		}

		anim(step)
	}

	run()
}