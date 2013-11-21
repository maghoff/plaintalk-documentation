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

function installPopups() {
	var elements = document.querySelectorAll("span[title]");
	for (var i = 0; i < elements.length; ++i) {
		var title = extractAndRemoveTitle(elements[i]);
		var popup = createPopup(title);
		elements[i].classList.add("has-popup");

		var wrapper = document.createElement("span");
		wrapper.className = "popup-wrapper";

		elements[i].parentNode.replaceChild(wrapper, elements[i]);
		wrapper.appendChild(elements[i]);
		wrapper.appendChild(popup);
	}
}


if (document.readyState == "complete" || document.readyState == "loaded") {
	installPopups();
} else {
	document.addEventListener("DOMContentLoaded", installPopups);
}
