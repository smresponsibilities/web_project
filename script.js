function showTab(clickedTab, tabName) {
    const tabs = clickedTab.parentElement.getElementsByClassName('tab');
    Array.from(tabs).forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');

}

function showResponseTab(clickedTab, tabName) {
    const tabs = clickedTab.parentElement.getElementsByClassName('tab');
    Array.from(tabs).forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');
    
}

function sendRequest() {

    setTimeout(() => {
        document.getElementById('status').textContent = 'Status: 200';
        document.getElementById('time').textContent = 'Time: 200 ms';
        document.getElementById('size').textContent = 'Size: 96B';
        document.getElementById('responseBody').textContent = '{\n    "Fertilizername": "20-20"\n}';
        updateLineNumbers('outputLineNumbers', 'responseBody');
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


    content.addEventListener('scroll', () => {
        lineNumbers.scrollTop = content.scrollTop;
    });
}

function setDefaultMethod() {
    document.getElementById('method').value = 'GET';
}



document.addEventListener('DOMContentLoaded', () => {
    updateLineNumbers('inputLineNumbers', 'bodyContent');
    updateLineNumbers('outputLineNumbers', 'responseBody');
    setDefaultMethod();

    document.getElementById('bodyContent').addEventListener('input', () => updateLineNumbers('inputLineNumbers', 'bodyContent'));
});