if (typeof browser === 'undefined') {
    var browser = chrome;
}

const OPTIONS = [
    ['controls_button', 'middle'],
    ['controls_modifier', 'ctrl'],
    ['button_labels', [
        'Pas intéressé',
        'Not interested',
        'No me interesa'
    ]],
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
        let val = form.find(`[name="${name}"]`).val() || default_value;
        console.log(val);
        options[name] = name === 'button_labels' ? val.split('\n') : val;
    });


    browser.storage.sync.set(options);
    broadcastMessageToTabs('reloadConfig', () => window.close());
}

function restoreOption(name, default_value) {
    browser.storage.sync.get(name, (res) => {
        let val = res[name] || default_value;
        document.querySelector(`[name="${name}"]`).value = Array.isArray(val) ? val.join('\n') : val;
    });
}

function restoreOptions() {
    forEachOpt(restoreOption)
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);