let config = null;
if (typeof browser === 'undefined') {
  var browser = chrome;
}

function loadConfig() {
  browser.storage.sync.get(null, (res) => {
    config = res;
  });
}

loadConfig();

browser.runtime.onMessage.addListener((request) => {
  if (request === 'reloadConfig') {
    loadConfig();
  }
});

/**
 * Disable pointer-events for `delay` ms.
 * This is needed to disable the default behavior, as events get bubbled up no matter how we stop their propagation.
 * 
 * @param {jQuery} elem to apply changes to
 * @param {Number} delay in ms 
 */
function setPointerEvents(elem, value='') {
  elem.css('pointer-events', value);
}

function stopAllPropagation(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function filterMiddleClick(fn) {
  return function (event) {
    if (
        event.button === parseInt(config.controls_button || '1') && (
           config.controls_modifier === '0' && !event.ctrlKey && !event.altKey
        || config.controls_modifier === '1' && event.ctrlKey && !event.altKey
        || config.controls_modifier === '2' && !event.ctrlKey && event.altKey
        || config.controls_modifier === '3' && event.ctrlKey && event.altKey
      )
    ) {
      fn.bind(this)(event);
      stopAllPropagation(event);
    }
  };
}

function buildButtonSelector() {
  return [
    "Pas intéressé",
    "Not interested",
    "No me interesa"
  ].map(label => `.ytd-menu-popup-renderer:contains("${label}")`).join(',');
}

function clickNotInterestedButton(elem) {
  const menuButton = elem.find('button.yt-icon-button');

  if (menuButton.length) menuButton.click();

  setTimeout(function () {
    const notInterestedButton = $(buildButtonSelector());
    if (notInterestedButton.length) notInterestedButton.click();
    setPointerEvents(elem.add('#video-preview-container'));
  }, 100);
}

$('body').on('mousedown', '#video-preview-container *', filterMiddleClick(function() {
  const container = $('#video-preview-container');
  setPointerEvents(container, 'none');
  clickNotInterestedButton(container);
}));

$('body').on('mousedown', 'div.ytd-rich-item-renderer *', filterMiddleClick(function() {
  const container = $(this).parents('div.ytd-rich-item-renderer');
  setPointerEvents(container.add('#video-preview-container'), 'none');
  clickNotInterestedButton(container);
}));