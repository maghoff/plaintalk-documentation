function extractAndRemoveTitle(element) {
	var title = element.getAttribute("title");
	element.removeAttribute("title");
	return title;
}

function createPopup(text) {
	var element = document.createElement("span");
	element.className = "popup";
	element.textContent = text;
	return element;
}

function installPopup(element) {
	var title = extractAndRemoveTitle(element);
	var popup = createPopup(title);
	element.classList.add("has-popup");

	var wrapper = document.createElement("span");
	wrapper.className = "popup-wrapper";

	element.parentNode.replaceChild(wrapper, element);
	wrapper.appendChild(element);
	wrapper.appendChild(popup);


	popup.style.display = "none";
	popup.classList.add("suppress-popup");
	var pendingHideEventId = null;
	element.addEventListener("mouseover", function () {
		popup.style.display = "";
		setTimeout(function () {
			popup.classList.remove("suppress-popup");
		}, 0);
		if (pendingHideEventId !== null) {
			clearTimeout(pendingHideEventId);
			pendingHideEventId = null;
		}
	});
	element.addEventListener("mouseout", function () {
		popup.classList.add("suppress-popup");
		pendingHideEventId = setTimeout(function () {
			popup.style.display = "none";
			pendingHideEventId = null;
		}, 120);
	});
}

function installPopups() {
	var elements = document.querySelectorAll("span[title]");
	for (var i = 0; i < elements.length; ++i) {
		installPopup(elements[i]);
	}
}


if (document.readyState == "complete" || document.readyState == "loaded") {
	installPopups();
} else {
	document.addEventListener("DOMContentLoaded", installPopups);
}
