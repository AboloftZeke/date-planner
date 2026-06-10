const card = document.querySelector(".card");
const noButton = document.querySelector(".choice.no");
let noButtonHasMoved = false;
let noButtonEscapeCount = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
	window.addEventListener("load", () => {
		noButton.style.setProperty("--no-x", "0px");
		noButton.style.setProperty("--no-y", "0px");
		noButton.style.setProperty("--no-rotate", "0deg");
	});
	window.addEventListener("resize", placeNoButton);
}
