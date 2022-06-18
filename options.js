if (typeof browser === 'undefined') {
    var browser = chrome;
}

const OPTIONS = [
    ['controls_button', 1],
    ['controls_modifier', 0]
];

function broadcastMessageToTabs(msg, cb) {
    browser.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => browser.tabs.sendMessage(tab.id, msg));
        cb(tabs);
    });
}

function forEachOpt(fn) {
    OPTIONS.forEach((opt) => {
        let name = opt;
        let default_value = null;

        if (Array.isArray(opt)) {
            default_value = opt[1];
            name = opt[0];
        }

        fn(name, default_value);
    });
}

function saveOptions(e) {
    e.preventDefault();
    const form = $('form');
    const options = {};

    forEachOpt((name, default_value) => {
        options[name] = form.find(`[name="${name}"]`).val() || default_value;
    });

    browser.storage.sync.set(options);
    broadcastMessageToTabs('reloadConfig', () => window.close());
}

function restoreOption(name, default_value) {
    browser.storage.sync.get(name, (res) => {
        document.querySelector(`[name="${name}"]`).value = res[name] || default_value;
    });
}

function restoreOptions() {
    forEachOpt(restoreOption)
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);