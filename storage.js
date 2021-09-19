const host = "dictup.com:8080"
const protocol = `http`;

function getAuthHeaders(settings) {
    return {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + settings.access_token,
    };
}

function updateWordGroups() {
    chrome.storage.local.get(null, settings => {
        let activeLang = settings.user.lang_binding.find(lang => lang.active === true)
        let from_iso = activeLang.from_iso
        let to_iso = activeLang.to_iso
        fetch(`${protocol}://${host}/api/v1/wordgroups/langs/${from_iso}/${to_iso}`, {
            method: 'GET',
            headers: getAuthHeaders(settings)
        }).then(res => res.json()).then(groups => {
            chrome.storage.local.set({
                groups: groups
            })
        }).catch(err => {
            printError(err);
        })
    })
}

updateUserProfile = () => {
    chrome.storage.local.get(null, settings => {
        let jsomAuthHeaders = getAuthHeaders(settings);
        fetch(`${protocol}://${host}/api/v1/users/current`, {
            method: 'GET',
            headers: jsomAuthHeaders
        }).then(res => res.json()).then(jsonRes => {
            chrome.storage.local.set({
                user: jsonRes
            }, () => {
                updateWordGroups();
            })
        }).catch(err => {
            printError(err);
        })
    })

}
updateUserProfile()


function printError(err) {
    console.log('Error: ' + err);
    console.log(err.response);
}


handleMessage = (request, sender, sendResponse) => {
    const {type} = request;
    if (type === "UpdateWordgroups") {
        updateWordGroups()
        sendResponse({response: "ok"});
    }
    return true;
}
chrome.runtime.onMessage.addListener(handleMessage);
