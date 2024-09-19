function showTab(clickedTab, tabName) {
    const tabs = clickedTab.parentElement.getElementsByClassName('tab');
    Array.from(tabs).forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');

    const tabContents = clickedTab.closest('.request-panel').getElementsByClassName('tab-content');
    Array.from(tabContents).forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'flex';

    if (tabName === 'request-body') {
        updateLineNumbers('inputLineNumbers', 'bodyContent');
    }
}

function showResponseTab(clickedTab, tabName) {
    if (!clickedTab) {
        console.error('Clicked tab is null');
        return;
    }
    const tabs = clickedTab.closest('.tabs').getElementsByClassName('tab');
    Array.from(tabs).forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');
    
    const tabContents = clickedTab.closest('.response-panel').getElementsByClassName('tab-content');
    Array.from(tabContents).forEach(content => content.style.display = 'none');
    const selectedContent = document.getElementById(tabName);
    if (selectedContent) {
        selectedContent.style.display = 'flex';
    } else {
        console.error(`Tab content with id '${tabName}' not found`);
    }
}

function sendRequest() {
    const method = document.querySelector('.select-selected').textContent;
    const url = document.getElementById('url').value;
    const queryParams = getKeyValuePairs('query-params');
    const headers = getKeyValuePairs('headers');
    let body = document.getElementById('bodyContent').textContent.trim();

    const urlWithParams = new URL(url);
    Object.keys(queryParams).forEach(key => 
        urlWithParams.searchParams.append(key, queryParams[key])
    );

    console.log('Method:', method);
    console.log('URL:', urlWithParams.toString());
    console.log('Headers:', headers);
    if (method !== 'GET' && method !== 'DELETE') {
        console.log('Body:', body);
    }

  
    document.getElementById('status').textContent = 'Status: Loading...';
    document.getElementById('time').textContent = 'Time: Calculating...';
    document.getElementById('size').textContent = 'Size: Calculating...';
    document.getElementById('responseBodyContent').textContent = 'Loading...';
    document.getElementById('responseHeaderContent').textContent = 'Loading...';

    const startTime = Date.now();

    const requestOptions = {
        method: method,
        headers: {
            ...headers
        }
    };

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        requestOptions.headers['Content-Type'] = 'application/json';

        try {
            body = JSON.parse(body);
        } catch (e) {
           
            try {
                
                body = body.replace(/'/g, '"');
   
                body = body.replace(/(\w+):/g, '"$1":');
                body = JSON.parse(body);
            } catch (e) {
                console.error('Invalid JSON in request body');
                alert('Invalid JSON in request body. Please check your input.');
                return;
            }
        }
        requestOptions.body = JSON.stringify(body);
    }

    console.log('Sending request:', method, url, requestOptions);

    fetch(urlWithParams.toString(), requestOptions)
    .then(response => {
        const endTime = Date.now();
        const timeElapsed = endTime - startTime;

        const statusElement = document.getElementById('status');
        statusElement.textContent = `Status: ${response.status} ${response.statusText}`;
        
        statusElement.className = '';
        if (response.status >= 200 && response.status < 300) {
            statusElement.classList.add('status-2xx');
        } else if (response.status >= 300 && response.status < 400) {
            statusElement.classList.add('status-3xx');
        } else if (response.status >= 400 && response.status < 600) {
            statusElement.classList.add(response.status < 500 ? 'status-4xx' : 'status-5xx');
        }

        document.getElementById('time').textContent = `Time: ${timeElapsed} ms`;


        const responseHeaders = Array.from(response.headers.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        document.getElementById('responseHeaderContent').textContent = responseHeaders;

        return response.text().then(text => ({ text, response }));
    })
    .then(({ text, response }) => {
        document.getElementById('size').textContent = `Size: ${text.length} B`;
        
        try {
            const jsonResponse = JSON.parse(text);
            document.getElementById('responseBodyContent').textContent = JSON.stringify(jsonResponse, null, 2);
        } catch (e) {
            document.getElementById('responseBodyContent').textContent = text;
        }

        const responseBodyTab = document.querySelector('.response-panel .tab[onclick*="response-body"]');
        if (responseBodyTab) {
            showResponseTab(responseBodyTab, 'response-body');
        } else {
            console.error('Response body tab not found');
        }

        
        if (response.ok) {
            saveToHistory(
                method,
                urlWithParams.toString(),
                requestOptions.body || '',
                text,
                response.status,
                document.getElementById('time').textContent.split(': ')[1]
            );
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const statusElement = document.getElementById('status');
        statusElement.textContent = 'Status: Error';
        statusElement.className = 'status-5xx'; 
        document.getElementById('responseBodyContent').textContent = `Error: ${error.message}`;
    });

   
}

function showHistory() {
    window.location.href = 'history.html';
}

function updateLineNumbers(lineNumbersId, contentId) {
    const content = document.getElementById(contentId);
    const lineNumbers = document.getElementById(lineNumbersId);
    const lines = content.innerText.split('\n');
    lineNumbers.innerHTML = lines.map((_, index) => `<div>${index + 1}</div>`).join('');


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

    showTab(document.querySelector('.tab'), 'query-params');

    addKeyValuePair('query-params');
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

function saveToHistory(method, url, requestBody, responseBody, status, time) {
    let history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    history.unshift({
        method,
        url,
        requestBody,
        responseBody,
        status,
        time,
        timestamp: new Date().toISOString()
    });
 
    history = history.slice(0, 50);
    localStorage.setItem('requestHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <h3>${item.method} ${item.url}</h3>
            <p>Status: ${item.status}</p>
            <p>Time: ${item.time}</p>
            <p>Date: ${new Date(item.timestamp).toLocaleString()}</p>
            <button onclick="showHistoryDetails(${index})">Show Details</button>
        `;
        historyContainer.appendChild(historyItem);
    });
}

function showHistoryDetails(index) {
    const history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    const item = history[index];
    const detailsContainer = document.getElementById('historyDetails');
    detailsContainer.innerHTML = `
        <h2>Request Details</h2>
        <p><strong>Method:</strong> ${item.method}</p>
        <p><strong>URL:</strong> ${item.url}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Time:</strong> ${item.time}</p>
        <p><strong>Date:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
        <h3>Request Body:</h3>
        <pre>${item.requestBody}</pre>
        <h3>Response Body:</h3>
        <pre>${item.responseBody}</pre>
        <div class="button-container">
            <button onclick="hideHistoryDetails()" class="glow">Hide Details</button>
        </div>
    `;
    detailsContainer.style.display = 'block';
}