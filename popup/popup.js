const host = "dictup.com:8080"
const protocol = `http`;
const jsomHeaders = {
    'Content-type': 'application/json',
}

function getAuthHeaders(settings) {
    return {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + settings.access_token,
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("auth").addEventListener("click", sendAuth);
    updateUserInfo()
});

sendAuth = () => {
    // TODO add input fields for email pass
    const body = JSON.stringify({"email": "test1@dictup.com", "password": "test1"})

    fetch(`${protocol}://${host}/auth`, {method: 'POST', body, jsomHeaders}).then(res => res.json()).then(jsonRes => {
        chrome.storage.local.set({access_token: jsonRes.access_token})
    }).catch(err => {
        console.log('Error: ' + err.message);
        console.log(err.response);
    })
}


updateUserInfo = () => {
    chrome.storage.local.get(null, settings => {
        let jsomAuthHeaders = getAuthHeaders(settings);
        fetch(`${protocol}://${host}/api/v1/users/current`, {
            method: 'GET',
            headers: jsomAuthHeaders
        }).then(res => res.json()).then(jsonRes => {
            chrome.storage.local.set({
                jsonRes
            })
            let activeLang = jsonRes.lang_binding.find(lang => lang.active = true)
            let from_iso = activeLang.from_iso
            let to_iso = activeLang.to_iso
            fetch(`${protocol}://${host}/api/v1/wordgroups/langs/${from_iso}/${to_iso}`, {
                method: 'GET',
                headers: jsomAuthHeaders
            }).then(res => res.json()).then(groups => {
                chrome.storage.local.set({
                    groups: groups
                })
            }).catch(err => {
                console.log('Error: ' + err);
                console.log(err.response);
            })

        }).catch(err => {
            console.log('Error: ' + err);
            console.log(err.response);
        })
    })
}
