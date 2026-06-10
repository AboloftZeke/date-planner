const card = document.querySelector(".card");
const yesButton = document.querySelector(".choice.yes");
const noButton = document.querySelector(".choice.no");
const plannerPanel = document.querySelector(".planner");
const destinationSelect = document.querySelector("#destination-select");
const destinationInput = document.querySelector("#destination-input");
const plannerSubmit = document.querySelector(".planner-submit");
let noButtonHasMoved = false;
let noButtonEscapeCount = 0;

const stickerSources = [
	"Stickers/Chippy.png",
	"Stickers/cookies.png",
	"Stickers/donut.png",
	"Stickers/drink.png",
	"Stickers/fast-food.png",
	"Stickers/movie.png",
	"Stickers/noodle.png",
	"Stickers/output-smallpngtools.png",
	"Stickers/output-smallpngtools (1).png",
	"Stickers/output-smallpngtools (2).png",
	"Stickers/output-smallpngtools (3).png",
	"Stickers/output-smallpngtools (4).png",
	"Stickers/output-smallpngtools (5).png",
	"Stickers/output-smallpngtools (6).png",
	"Stickers/waffles.png",
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let stickerLayer = null;
let stickerQueue = [];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const randomBetween = (min, max) => min + Math.random() * (max - min);

const shuffleStickerQueue = () => {
	stickerQueue = [...stickerSources];
	for (let index = stickerQueue.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[stickerQueue[index], stickerQueue[swapIndex]] = [stickerQueue[swapIndex], stickerQueue[index]];
	}
};

const nextStickerSource = () => {
	if (!stickerQueue.length) {
		shuffleStickerQueue();
	}

	return stickerQueue.shift();
};

const ensureStickerLayer = () => {
	if (!card || stickerLayer) {
		return;
	}

	stickerLayer = card.querySelector(".sticker-layer");
	if (!stickerLayer) {
		stickerLayer = document.createElement("div");
		stickerLayer.className = "sticker-layer";
		stickerLayer.setAttribute("aria-hidden", "true");
		card.prepend(stickerLayer);
	}
};

const spawnSticker = () => {
	if (!card || !stickerLayer || prefersReducedMotion.matches) {
		return;
	}

	const cardWidth = card.clientWidth;
	const sticker = document.createElement("span");
	const image = document.createElement("img");
	const size = randomBetween(46, 90);
	const maxLeft = Math.max(12, cardWidth - size - 12);
	const left = randomBetween(12, maxLeft);
	const duration = randomBetween(8.5, 13.5);
	const sway = randomBetween(20, 72) * (Math.random() < 0.5 ? -1 : 1);
	const rotation = randomBetween(-18, 18);
	const source = nextStickerSource();

	sticker.className = "sticker";
	sticker.style.setProperty("--sticker-left", `${left}px`);
	sticker.style.setProperty("--sticker-size", `${size}px`);
	sticker.style.setProperty("--sticker-duration", `${duration}s`);
	sticker.style.setProperty("--sticker-sway", `${sway}px`);
	sticker.style.setProperty("--sticker-rotate-start", `${rotation}deg`);

	image.src = source;
	image.alt = "";
	sticker.appendChild(image);
	stickerLayer.appendChild(sticker);

	sticker.addEventListener("animationend", () => {
		sticker.remove();
	});
};

window.datePlannerSpawnSticker = spawnSticker;

const scheduleSticker = () => {
	if (prefersReducedMotion.matches) {
		return;
	}

	const delay = randomBetween(2500, 6000);
	window.setTimeout(() => {
		if (Math.random() < 0.9) {
			spawnSticker();
		}
		scheduleSticker();
	}, delay);
};

const placeNoButton = () => {
	if (!card || !noButton) {
		return;
	}

	if (!noButtonHasMoved) {
		return;
	}

	const cardRect = card.getBoundingClientRect();
	const buttonRect = noButton.getBoundingClientRect();
	const safePadding = 24;
	const maxLeft = cardRect.width - buttonRect.width - safePadding;
	const maxTop = cardRect.height - buttonRect.height - safePadding;
	const currentLeft = buttonRect.left - cardRect.left;
	const currentTop = buttonRect.top - cardRect.top;
	const stepX = Math.min(cardRect.width * 0.16, 120);
	const stepY = Math.min(cardRect.height * 0.12, 72);
	const nextLeft = clamp(currentLeft + (Math.random() * 2 - 1) * stepX, safePadding, maxLeft);
	const nextTop = clamp(currentTop + (Math.random() * 2 - 1) * stepY, safePadding, maxTop);
	const offsetX = nextLeft - currentLeft;
	const offsetY = nextTop - currentTop;

	noButton.style.setProperty("--no-x", `${offsetX}px`);
	noButton.style.setProperty("--no-y", `${offsetY}px`);
	noButton.style.setProperty("--no-rotate", `0deg`);
};

if (noButton && card) {
	const dodgeNoButton = () => {
		noButtonHasMoved = true;
		noButtonEscapeCount += 1;
		placeNoButton();
		noButton.blur();
	};

	noButton.addEventListener("pointerdown", (event) => {
		event.preventDefault();
		dodgeNoButton();
	});
	noButton.style.setProperty("--no-x", "0px");
	noButton.style.setProperty("--no-y", "0px");
	noButton.style.setProperty("--no-rotate", "0deg");
	ensureStickerLayer();
	shuffleStickerQueue();
	scheduleSticker();
	window.addEventListener("load", () => {
		noButton.style.setProperty("--no-x", "0px");
		noButton.style.setProperty("--no-y", "0px");
		noButton.style.setProperty("--no-rotate", "0deg");
	});
	window.addEventListener("resize", placeNoButton);
}

// Ensure sticker layer and scheduling on all pages (planner.html may not have the No button)
ensureStickerLayer();
shuffleStickerQueue();
scheduleSticker();

// If this is the planner page, focus the input when loaded
window.addEventListener("load", () => {
    destinationInput?.focus();
	// If planner exists as the main view (standalone page), reveal it
	try {
		const plannerExists = document.querySelector('.planner');
		if (plannerExists && card && !card.classList.contains('is-planning')) {
			card.classList.add('is-planning');
		}
	} catch (e) {
		// ignore
	}
	// Defensive init: Confirm starts disabled until user acts
	try {
		if (plannerSubmit) {
			plannerSubmit.disabled = true;
			plannerSubmit.setAttribute('aria-disabled', 'true');
		}
	} catch (e) {
		// ignore
	}
});

if (yesButton && card) {
    yesButton.addEventListener("click", () => {
        // Navigate to the dedicated planner page
        window.location.href = "planner.html";
    });
}

if (destinationSelect && destinationInput) {
	destinationSelect.addEventListener("change", () => {
		if (!destinationSelect.value) {
			return;
		}

		destinationInput.value = destinationSelect.value;
		// enable confirm when a value is chosen
		if (plannerSubmit) {
			plannerSubmit.disabled = false;
			plannerSubmit.setAttribute('aria-disabled', 'false');
		}
	});
}

// enable/disable confirm based on input content
const toggleConfirmEnabled = () => {
	if (!plannerSubmit || !destinationInput) return;
	const val = destinationInput.value?.trim();
	const enabled = Boolean(val);
	plannerSubmit.disabled = !enabled;
	plannerSubmit.setAttribute('aria-disabled', String(!enabled));
};

if (destinationInput) {
	destinationInput.addEventListener('input', toggleConfirmEnabled);
	// initial toggle on load
	toggleConfirmEnabled();
}

if (plannerSubmit && destinationInput) {
	plannerSubmit.addEventListener('click', () => {
		const val = destinationInput.value?.trim();
		if (!val) {
			destinationInput.focus();
			destinationInput.classList.add('invalid');
			setTimeout(() => destinationInput.classList.remove('invalid'), 600);
			return;
		}

		try {
			localStorage.setItem('plannedDestination', val);
		} catch (e) {
			// ignore storage errors
		}

		window.location.href = 'date-scheduler.html';
	});
}
