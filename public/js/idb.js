let db;
const request = indexedDB.open('budget', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_deal', {autoIncrement: true})
}
// checks if app is online, if yes, runs the upload transaction method to send local db data to api
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadDeal()
    }
}
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode)
}

function saveRecord(record) {
    const transaction = db.transaction( ['new_deal'], 'readwrite')
    const dealObjectStore = transaction.objectStore('new_deal');
    dealObjectStore.add(record)
}

function uploadDeal() {
    const transaction = db.transaction(['new_deal'], 'readwrite')
    const dealObjectStore = transaction.objectStore('new_deal')
    const getAll = dealObjectStore.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_deal'], 'readwrite')
                const dealObjectStore = transaction.objectStore('new_deal');
                dealObjectStore.clear();

                alert('All saved deals have been submitted to the servers')
            })
            .catch (err => {
                console.log(err)
            })
        }
    }
}

window.addEventListener('online', uploadDeal)