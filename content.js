const host = "dictup.com:8080"

function getAuthHeaders(settings) {
    return {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + settings.access_token,
    };
}

bodyClick = () => {
    const selection = document.getSelection();
    chrome.storage.local.get(null, settings => {
        addWord(selection.toString(), settings.groups[0].id)
    })
}
document.ondblclick = bodyClick;
addWord = (sel, groupID) => {
    chrome.storage.local.get(null, settings => {
        const body = JSON.stringify({group_id: groupID, name: sel})
        fetch(`http://${host}/api/v1/words`, {
            method: 'POST',
            body: body,
            headers: getAuthHeaders(settings)
        }).then(res => res.json()).then(jsonRes => {
            console.log(JSON.stringify(jsonRes));
        }).catch(err => {
            console.log('Error: ' + err);
            console.log(err.response);
        })
    })
}
