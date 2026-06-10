document.querySelectorAll(".choice").forEach((button) => {
	button.addEventListener("click", () => {
		button.blur();
	});
});
