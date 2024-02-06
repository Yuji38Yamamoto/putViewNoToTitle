
// タブのリスト
// tabIDが履歴順に入る
let allViewTabId = [];

// タブがアクティブになった時に発火する
chrome.tabs.onActivated.addListener(function (actibeInfo) {
    putViewNoToTitle(actibeInfo.tabId);
});

// タブのloadingが終わったタイミングで発火する(新規タブで発火)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        putViewNoToTitle(tabId);
    };
});

// タブが閉じられたら発火する
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    putViewNoToTitle(tabId);
});


// 拡張機能のアイコンがクリックされたら、タイトルをもとに戻す
chrome.action.onClicked.addListener(async (tab) => {
    allViewTabId.forEach((t, i) => {
        chrome.tabs.get(t, function(tab){
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: function(i){
                    const regex = /^\d+:/;
                    document.title = document.title.replace(regex,'');
                },
                args: [i],
            });
        });
    });
    allViewTabId = [];
});


async function putViewNoToTitle(tabId) {

    // tabIDからtabの取得ができたらurlを取得する
    await chrome.tabs.get(tabId, function (tab) {

        // chromeの設定画面の場合は更新しない
        if (chrome.runtime.lastError) {
            // console.log("chrome.runtime.lastError");

            // タブが削除された場合にallViewTabIdからidを削除する
            RemoveIdFromAllViewTabId(tabId);

            // allViewTabIdがもつtabのタイトルを変更する
            ChangeTitleFromAllViewTabId();

        }else{

            // allViewTabIdから渡ってきたtabIDを削除する
            RemoveIdFromAllViewTabId(tabId);

            // タブがchromeの設定画面でなければallViewTabIdの先頭にidを追加
            if (tab.url && tab.url.startsWith("http")) {
                allViewTabId.unshift(tabId);
            };

            // allViewTabIdがもつtabのタイトルを変更する
            ChangeTitleFromAllViewTabId();
        }
    });
    
};

function ChangeTitleFromAllViewTabId(params) {
    allViewTabId.forEach((t, i) => {
        chrome.tabs.get(t, function(tab){
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: function(i){
                    const regex = /^\d+:/;
                    if (document.title.search(regex) == -1) {
                        document.title = 1 + ":" + document.title;
                    } else {
                        let viewNomber = (i + 1) + ":";
                        document.title = document.title.replace(regex,viewNomber);
                    }
                },
                args: [i],
            });
        });
    });
}

function RemoveIdFromAllViewTabId(tabId) {
    allViewTabId = allViewTabId.filter(item => {
        return item !== tabId;
    });
}