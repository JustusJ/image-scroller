/*global $*/

let delaySecs = parseInt(localStorage.getItem("delaySecs"), 10) || 600;

const container = $(".container");
const settingsDelay = $("#delay");
settingsDelay.val(delaySecs);

const imageURLs = Object.values(window.allImages).reduce((v, acc) => v.concat(acc));
const images = imageURLs.map((url) => {
  const image = $(new Image());
  image.attr("src", url);
  image.addClass("mainImage");
  image.on("animationend", (e) => {
    if (image.hasClass("slide-out")) {
      image.removeClass("slide-out mainImage--shown");
    } else {
      image.removeClass("slide-in");
    }
  });
  return image;
});

container.append(images);

let currentIndex;
let currentIndexChangedAt;

function updateTimer() {
  const elapsedSeconds = (new Date() - currentIndexChangedAt) / 1000;
  const elapsedPercent = Math.min(1, elapsedSeconds / delaySecs);
  document.body.style.setProperty("--time-elapsed", elapsedPercent * 100 + "%");
}

function nextImage() {
  if (currentIndex != null) {
    images[currentIndex].addClass("slide-out");
  }

  currentIndex = choose(images.length, currentIndex);
  currentIndexChangedAt = new Date();
  images[currentIndex].addClass("slide-in mainImage--shown");
  setTimeout(nextImage, 1000 * delaySecs);
}

function choose(length, ignore) {
  if (length < 2) {
    return 0;
  }

  let choice;
  do {
    choice = Math.floor(Math.random() * length);
  } while (choice === ignore);

  return choice;
}

nextImage();
setInterval(updateTimer, 1000);

let settingsOpen = false;

function h(name, attrs, chld) {
  return $(`<${name}>`).attr(attrs).append(chld);
}

$("body").on("click", function (event) {
  if (event.originalEvent.ctrlKey) {
    event.preventDefault();
    settingsOpen = !settingsOpen;
    $("body").toggleClass("settings-open", settingsOpen);
    if (settingsOpen) {
      const names = Object.keys(window.allImages).sort();
      const renderImages = (name) => {
        const images = window.allImages[name].map((url) => h("a", { href: url, title: url }, [h("img", { class: "grid-image", src: url })]));
        $(".grid").empty().append(images);
      };
      const setSelect = $(".settings-set-select");
      setSelect.empty();
      names.forEach((k) => $("<button>").text(k).on("click", renderImages.bind(this, k)).appendTo(setSelect));
      $("#grid-size").on("input", (e) => $(".settings").css({ "--grid-size": $("#grid-size").val() }));
      renderImages(names[0]);
    } else {
      $(".grid").empty();
    }
  }
});

settingsDelay.on("input", function () {
  const delay = parseInt(settingsDelay.val(), 10);
  if (delay) {
    localStorage.setItem("delaySecs", delay);
    delaySecs = delay;
  }
});
