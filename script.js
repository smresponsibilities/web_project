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
    document.getElementById(tabName).style.display = 'flex';

    if (tabName === 'responseBody') {
        document.getElementById('outputLineNumbers').style.display = 'block';
        updateLineNumbers('outputLineNumbers', 'responseBodyContent');
    } else {
        document.getElementById('outputLineNumbers').style.display = 'none';
    }
}

function sendRequest() {
    const method = document.getElementById('method').value;
    const url = document.getElementById('url').value;
    const queryParams = getKeyValuePairs('queryParams');
    const headers = getKeyValuePairs('headers');
    const body = document.getElementById('bodyContent').textContent;

    // Build URL with query parameters
    const urlWithParams = new URL(url);
    Object.keys(queryParams).forEach(key => 
        urlWithParams.searchParams.append(key, queryParams[key])
    );

    console.log('Method:', method);
    console.log('URL:', urlWithParams.toString());
    console.log('Headers:', headers);
    console.log('Body:', body);

    // Simulate API call
    setTimeout(() => {
        document.getElementById('status').textContent = 'Status: 200';
        document.getElementById('time').textContent = 'Time: 200 ms';
        document.getElementById('size').textContent = 'Size: 96B';
        document.getElementById('responseBodyContent').textContent = '{\n    "Fertilizername": "20-20"\n}';
        
        // Update response headers
        const responseHeaders = {
            'Content-Type': 'application/json',
            'Server': 'Postie/1.0',
            'Date': new Date().toUTCString()
        };
        document.getElementById('responseHeaderContent').textContent = 
            Object.entries(responseHeaders)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');

        updateLineNumbers('outputLineNumbers', 'responseBodyContent');
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
    lineNumbers.innerHTML = lines.map((_, index) => index + 1).join('<br>');

    content.onscroll = () => {
        lineNumbers.scrollTop = content.scrollTop;
    };
}

function setDefaultMethod() {
    document.getElementById('method').value = 'GET';
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
    updateLineNumbers('inputLineNumbers', 'bodyContent');
    updateLineNumbers('outputLineNumbers', 'responseBodyContent');
    setDefaultMethod();

    document.getElementById('bodyContent').addEventListener('input', () => updateLineNumbers('inputLineNumbers', 'bodyContent'));

    // Show the queryParams tab by default
    showTab(document.querySelector('.tab'), 'queryParams');

    // Add initial key-value pair to Query Params and Headers
    addKeyValuePair('queryParams');
    addKeyValuePair('headers');
});