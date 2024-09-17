function showTab(clickedTab, tabName) {
    const tabs = clickedTab.parentElement.getElementsByClassName('tab');
    Array.from(tabs).forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');

    const tabContents = clickedTab.closest('.opaque-bg').getElementsByClassName('tab-content');
    Array.from(tabContents).forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'flex';

    if (tabName === 'body') {
        updateLineNumbers('inputLineNumbers', 'bodyContent');
    }
}

function showResponseTab(clickedTab, tabName) {
    const tabs = clickedTab.parentElement.getElementsByClassName('tab');
    Array.from(tabs).forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');
    
    const tabContents = clickedTab.closest('.opaque-bg').getElementsByClassName('tab-content');
    Array.from(tabContents).forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'flex'; // Remove the extra parenthesis
}

function sendRequest() {
    const method = document.querySelector('.select-selected').textContent;
    const url = document.getElementById('url').value;
    const queryParams = getKeyValuePairs('queryParams');
    const headers = getKeyValuePairs('headers');
    const body = document.getElementById('bodyContent').textContent;

    const urlWithParams = new URL(url);
    Object.keys(queryParams).forEach(key => 
        urlWithParams.searchParams.append(key, queryParams[key])
    );

    console.log('Method:', method);
    console.log('URL:', urlWithParams.toString());
    console.log('Headers:', headers);
    console.log('Body:', body);

    setTimeout(() => {
        document.getElementById('status').textContent = 'Status: 200';
        document.getElementById('time').textContent = 'Time: 200 ms';
        document.getElementById('size').textContent = 'Size: 96B';
        document.getElementById('responseBodyContent').textContent = '{\n    "Fertilizername": "20-20"\n}';
        
        const responseHeaders = {
            'Content-Type': 'application/json',
            'Server': 'Postie/1.0',
            'Date': new Date().toUTCString()
        };
        document.getElementById('responseHeaderContent').textContent = 
            Object.entries(responseHeaders)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');

        showResponseTab(document.querySelector('.tab[onclick*="responseBody"]'), 'responseBody');
    }, 500);
}

function showHistory() {
    window.location.href = 'history.html';
}

function updateLineNumbers(lineNumbersId, contentId) {
    const content = document.getElementById(contentId);
    const lineNumbers = document.getElementById(lineNumbersId);
    const lines = content.innerText.split('\n');
    lineNumbers.innerHTML = lines.map((_, index) => `<div>${index + 1}</div>`).join('');

    // Synchronize scrolling
    content.onscroll = () => {
        lineNumbers.scrollTop = content.scrollTop;
    };
}

function addKeyValuePair(tabId) {
    const container = document.querySelector(`#${tabId} .key-value-pairs`);
    const newPair = document.createElement('div');
    newPair.className = 'key-value-pair';
    newPair.innerHTML = `
        <input type="text" class="key glow" placeholder="Key">
        <input type="text" class="value glow" placeholder="Value">
        <button class="delete-btn glow" onclick="deleteKeyValuePair(this)">Delete</button>
    `;
    container.appendChild(newPair);
}

function deleteKeyValuePair(button) {
    button.closest('.key-value-pair').remove();
}

function getKeyValuePairs(tabId) {
    const container = document.querySelector(`#${tabId} .key-value-pairs`);
    const pairs = container.querySelectorAll('.key-value-pair');
    const result = {};
    pairs.forEach(pair => {
        const key = pair.querySelector('.key').value.trim();
        const value = pair.querySelector('.value').value.trim();
        if (key && value) {
            result[key] = value;
        }
    });
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    const bodyContent = document.getElementById('bodyContent');
    bodyContent.addEventListener('input', () => {
        updateLineNumbers('inputLineNumbers', 'bodyContent');
    });

    updateLineNumbers('inputLineNumbers', 'bodyContent');


    document.getElementById('bodyContent').addEventListener('input', () => updateLineNumbers('inputLineNumbers', 'bodyContent'));

    showTab(document.querySelector('.tab'), 'queryParams');

    addKeyValuePair('queryParams');
    addKeyValuePair('headers');
});

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeCustomSelect, 100);  
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeCustomSelect, 1);
}

function initializeCustomSelect() {
    const customSelect = document.querySelector(".custom-select");
    const selectSelected = customSelect.querySelector(".select-selected");
    const selectItems = customSelect.querySelector(".select-items");

    selectSelected.addEventListener("click", function(e) {
        e.stopPropagation();
        selectItems.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });

    const selectOptions = selectItems.getElementsByTagName("div");
    for (let i = 0; i < selectOptions.length; i++) {
        selectOptions[i].addEventListener("click", function(e) {
            const selectedValue = this.textContent;
            selectSelected.textContent = selectedValue;
            selectItems.classList.add("select-hide");
            selectSelected.classList.remove("select-arrow-active");
        });
    }

    document.addEventListener("click", function(e) {
        if (!customSelect.contains(e.target)) {
            selectItems.classList.add("select-hide");
            selectSelected.classList.remove("select-arrow-active");
        }
    });
}