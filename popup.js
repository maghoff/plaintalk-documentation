function extractAndRemoveTitle(element) {
	var title = element.getAttribute("title");
	element.removeAttribute("title");
	return title;
}

function createPopup(text) {
	var element = document.createElement("span");
	element.className = "popup";
	element.textContent = text;
	var arrow = document.createElement("span");
	arrow.className = "popup-arrow";
	element.appendChild(arrow);
	return element;
}

function calculateLeftRelativeToContent(element) {
	if (!element.offsetParent) return 0;
	console.log(element.offsetLeft, element);
	return calculateLeftRelativeToContent(element.offsetParent) + element.offsetLeft;
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
	var arrow = popup.querySelector(".popup-arrow");
	var pendingHideEventId = null;
	element.addEventListener("mouseover", function () {
		var x = calculateLeftRelativeToContent(popup);
		popup.style.display = "";

		setTimeout(function () {
			var boundingRect = popup.getBoundingClientRect();
			console.log(boundingRect);

			var diff = null;
			if (boundingRect.left < 20) {
				var diff = 20 - boundingRect.left;
			} else if (boundingRect.right > window.innerWidth - 20) {
				var diff = -20 + (window.innerWidth - boundingRect.right);
			}
			if (diff) {
				popup.style.left = "calc(50% + " + diff + "px)";
				arrow.style.left = 150 - diff + "px";
			}

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
			popup.style.left = "";
			arrow.style.left = "";
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
