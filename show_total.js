
// variables to help navigate each subset of info
const perPage = 10;
let currentPage = 1;
let start = 0;
let stop = start+perPage;
var items_n = 0;
var totalPages = 0;

// html element 
var pageContainer = document.getElementById("showPage");
var divContainer = document.getElementById("showDataJSON");

// json file path and variable to store data in file
const filePaths = ['./Data/inno_data_1000rows_formatted.json'];
let inno_data = {}

// get data from json file
Promise.all(filePaths.map(filePath => fetch(filePath)))
.then(responses => Promise.all(responses.map(response => response.json())))
.then(jsonDataArray => {
    // jsonDataArray contains the parsed JSON data from each file
    inno_data = jsonDataArray[0];
    init()

})
.catch(error => console.error('Error reading JSON files:', error));

//call function as web initilize
function init() {
    items_n = inno_data['inno_product'].length;
    totalPages = Math.ceil(items_n / perPage);
    pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
    make_table(inno_data, start, stop)
}  

// function to add data to html table format
function make_table(data, start, stop) {
        /*
        This section creates the base table and finds the root json node.
        */
        var jsonTable = document.createElement("table");
        var tr = jsonTable.insertRow(-1);   
        let root;
        for (let prop in data) {
            root = prop;
        }

        /*
        This section selects the headers for the table
        */
        let headers = Object.keys(data[root][0]);
        headers.forEach(header => {
            var th = document.createElement("th");      
            th.innerHTML = header;
            tr.appendChild(th);
        })    

        /*
        This section adds the data into each row of the list
        */
        let items = Object.keys(data[root]);
        window.items_n = items.length

        // slice items to show only a subset in each page
        items_s = items.slice(start, stop);

        items_s.forEach(item => {
            tr = jsonTable.insertRow(-1);
            for (let key in data[root][item]) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = data[root][item][key];                
            }
        })

        /*
        This section adds the table to the HTML
        */
        divContainer.innerHTML = "";
        divContainer.appendChild(jsonTable);
}

// Add event listeners for pagination buttons
document.getElementById('prev-btn').addEventListener('click', () => {
if (currentPage > 1) {
    currentPage--;
    start -= perPage;
    stop -= perPage;
    pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
    make_table(inno_data, start, stop);
}
});

document.getElementById('next-btn').addEventListener('click', () => {
if (currentPage < totalPages) {
    currentPage++;
    start += perPage
    stop += perPage
    pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
    make_table(inno_data, start, stop);
}
});