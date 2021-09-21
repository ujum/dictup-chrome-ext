const host = "dictup.com:8080"
const protocol = `http`;
const jsomHeaders = {
    'Content-type': 'application/json',
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementsByClassName("ico-login")[0].addEventListener("click", auth);
    document.getElementsByClassName("ico-login-google")[0].addEventListener("click", () => openNewTab(`${protocol}://${host}/auth/google`));
    getLangCont().addEventListener('click', languagesDropdown);
    getWgCont().addEventListener('click', wgDropdown);
});

function getLangCont() {
    return document.getElementById("langCont");
}

function getWgCont() {
    return document.getElementById("wgCont");
}

chrome.storage.local.get(null, settings => {
    let accessToken = settings.accessToken;
    if (accessToken) {
        document.getElementsByClassName('ico-login')[0].style.display = 'none';
    }
    console.log(settings)
    updateFlags();
    updateWordgroups();
});

openNewTab = url => chrome.tabs.create({url});
updateFlags = () => {
    chrome.storage.local.get(null, settings => {
        const sourceName = document.getElementById("sourceName");
        const sourceFlag = document.getElementById("sourceFlag");

        const targetName = document.getElementById("targetName");
        const targetFlag = document.getElementById("targetFlag");

        let activeLang = settings.user.lang_binding.find(lang => lang.active)
        let from_iso = activeLang.from_iso
        let to_iso = activeLang.to_iso

        sourceName.innerText = from_iso && languages.includes(from_iso) ? from_iso : '?';
        sourceFlag.classList = `language-flag flag-${languages.includes(from_iso) && from_iso ? from_iso : 'unknown'}`;
        targetName.innerText = to_iso;
        targetFlag.classList = `language-flag flag-${to_iso}`;
    });
}

updateWordgroups = () => {
    chrome.storage.local.get(null, settings => {
        const wgNameElem = document.getElementById("wgName");

        let defaultWg = settings.groups.find(wg => wg.default === true)
        let name = defaultWg.name

        wgNameElem.innerText = name ? name + ' ' + defaultWg.lang_binding.from_iso + '->' + defaultWg.lang_binding.to_iso : '?';
    });
}

languagesDropdown = () => {
    const dropdownElem = document.getElementsByClassName('languages-dropdown')[0];
    const target = getLangCont();
    wgDropdownClose(getWgCont());

    if (target.classList.contains('language-cont-activated')) {
        languagesDropdownClose(target);
    } else {
        target.classList.add('language-cont-activated');
        dropdownElem.classList.remove('display-none');

        chrome.storage.local.get(null, settings => {
            settings.user.lang_binding.forEach(lang => {
                const langElem = document.createElement('div');
                langElem.classList.add('languages-dropdown-button');
                langElem.onclick = () => {
                    languagesDropdownClose(target);
                    wgDropdownClose(getWgCont());
                    chrome.storage.local.get(null, settings => {
                        settings.user.lang_binding.forEach(l => {
                            l.active = l.from_iso === lang.from_iso && l.to_iso === lang.to_iso;
                        })
                        chrome.storage.local.set({
                            user: settings.user
                        }, () => {
                            chrome.runtime.sendMessage({
                                type: "UpdateWordgroups"
                            })
                        });
                    })
                };
                langElem.innerHTML += `${lang.from_iso.toUpperCase()} <div class="languages-dropdown-flag flag-${lang.from_iso}"></div> ${lang.to_iso.toUpperCase()} <div class="languages-dropdown-flag flag-${lang.to_iso}"></div>`;
                dropdownElem.appendChild(langElem);
            })
        });
    }
}


languagesDropdownClose = target => {
    const dropdownElem = document.getElementsByClassName('languages-dropdown')[0];
    target.classList.remove('language-cont-activated');
    dropdownElem.innerHTML = '';
    dropdownElem.classList.add('display-none');
}

wgDropdownClose = target => {
    const dropdownElem = document.getElementsByClassName('wg-dropdown')[0];
    target.classList.remove('wg-cont-activated');
    dropdownElem.innerHTML = '';
    dropdownElem.classList.add('display-none');
}

wgDropdown = () => {
    const dropdownElem = document.getElementsByClassName('wg-dropdown')[0];
    const target = getWgCont();
    languagesDropdownClose(getLangCont());

    if (target.classList.contains('wg-cont-activated')) {
        wgDropdownClose(target);
    } else {
        target.classList.add('wg-cont-activated');
        dropdownElem.classList.remove('display-none');

        chrome.storage.local.get(null, settings => {
            settings.groups.forEach(group => {
                const wgElem = document.createElement('div');
                wgElem.classList.add('wg-dropdown-button');
                wgElem.onclick = () => {
                    wgDropdownClose(target);
                    languagesDropdownClose(getLangCont());
                    chrome.storage.local.get(null, settings => {
                        settings.groups.forEach(gr => {
                            gr.default = gr.id === group.id;
                        })
                        console.log(settings.groups)
                        chrome.storage.local.set({
                            groups: settings.groups
                        });
                    })
                };
                wgElem.innerHTML += `<div>${group.name} ${group.lang_binding.from_iso.toUpperCase()} ${group.lang_binding.to_iso.toUpperCase()} </div>`;
                dropdownElem.appendChild(wgElem);
            })
        });
    }
}

function printError(err) {
    console.log('Error: ' + err.message);
    console.log(err.response);
}

auth = () => {
    // TODO add input fields for email pass
    const body = JSON.stringify({"email": "test1@dictup.com", "password": "test1"})

    fetch(`${protocol}://${host}/auth`, {method: 'POST', body, jsomHeaders}).then(res => res.json()).then(jsonRes => {
        chrome.storage.local.set({accessToken: jsonRes.access_token})
    }).catch(err => {
        printError(err);
    })
}
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
        if (key === 'groups') {
            updateWordgroups()
        } else if (key === 'user') {
            updateFlags()
        }
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
    }
});
