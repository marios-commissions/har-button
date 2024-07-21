const style = document.createElement("style");

style.innerHTML = `.dislike-button {
	padding: 10px;
	border-radius: 5px;
	width: 100%;
	appearance: none;
	outline: none !important;
	border: none !important;
	transition: all 0.5s;
}

.dislike-button:hover {
	background-color: rgba(0, 0, 0, 0.2);
}

.dislike-button:active {
	background-color: rgba(0, 0, 0, 0.5);
}
`;

document.head.appendChild(style);

const container = document.getElementById("map-container");
const parser = new DOMParser();

const observer = new MutationObserver(async mutations => {
	for (const mutation of mutations) {
		try {
			const target = mutation.target;

			if (!target || !target.classList?.contains("mapboxgl-popup") || target.classList?.contains("dislike-added")) continue;

			const element = document.createElement("div");

			element.innerHTML = "<button class='dislike-button'>Dislike</button>";

			const font = target.querySelector('[class*="font_size"]');
			if (!font) continue;

			const { href } = font.querySelector('a[href*="homedetail"]') ?? {};
			if (!href) continue;

			const res = await fetch(href).then(i => i.text());
			const parsed = parser.parseFromString(res, "text/html");
			const ids = parsed.querySelector("[data-mls][data-lid]");
			if (!ids) continue;

			const mls = ids.getAttribute("data-mls");
			const lid = ids.getAttribute("data-lid");

			const csrf = parsed.querySelector('[name="csrf-token"]').getAttribute("content");

			element.addEventListener("click", async () => {
				const res = await fetch("https://www.har.com/api/myaccount/notinterest/add", {
					body: `lid=${lid}&mls=${mls}`,
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						"X-CSRF-Token": csrf
					}
				}).then(b => b.json()).catch(console.error);

				if (!res) return alert('Failed to dislike.');

				const markers = document.querySelectorAll(`.marker_${lid}`);

				for (const marker of markers) {
					marker.remove();
				}
			});

			font.appendChild(element);
			target.classList.add("dislike-added");
		} catch (t) {
			console.error("Fuck.", t);
		}
	}
});

observer.observe(container, { attributes: !0, childList: !0, subtree: !0 });
