/*
* RENDERING THE JSON TABLE
* Get JSON data from file
* Get headers from retrieved data
* Set headers for table
* Add data to table
* Add table to DOM
*/

const perPage = 5;
let currentPage = 1;
let start = 0;
let stop = start+perPage;
var items_n = 100
var totalPages = Math.ceil(items_n / perPage);

let globalData = {}; // Declare the global variable


fetch('./inno_data_1000rows_formatted.json')
  .then(response => response.json())
  .then(data => {
    globalData = data; // Set the global variable
    // console.log(globalData); // Use the data
    init()
  })
  .catch(error => console.error('Error:', error));

function init() {
    console.log(globalData);
    make_table(globalData, start, stop)
}  


var pageContainer = document.getElementById("showPage");
pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
// pageContainer.appendChild(currentPage,start,stop);

  // Add event listeners for pagination buttons
  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        start -= perPage;
        stop -= perPage;
        console.log("click prev", currentPage)
        pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
        make_table(globalData, start, stop);
    //   displayPage(items, currentPage, perPage);    
    }
  });
  
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      start += perPage
      stop += perPage
      console.log("click next", currentPage)
      pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
      make_table(globalData, start, stop);
    //   displayPage(items, currentPage, perPage);
    }
  });


function make_table(data, start, stop) {
        
            /*
        This section creates the base table and finds the root json node.
        */
        var jsonTable = document.createElement("table");
        var tr = jsonTable.insertRow(-1);   
        // jsonTable.style.width = "75%";
        let root;
        for (let prop in data) {
            root = prop;
        }

        console.log(root)
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
        // slice item
        items_s = items.slice(start, stop);

        items_s.forEach(item => {
            tr = jsonTable.insertRow(-1);
            for (let key in data[root][item]) {
                var tabCell = tr.insertCell(-1);
                if (key == "Pic") {
                var img = document.createElement("IMG");
                img.src = data[root][item][key];
                tabCell.appendChild(img);
                }else{
                tabCell.innerHTML = data[root][item][key];
                }                       
            }
        })
        /*
        This section adds the table to the HTML
        */
        var divContainer = document.getElementById("showDataJSON");
        divContainer.innerHTML = "";
        divContainer.appendChild(jsonTable);
}









//   fetch('./inno_data_1000rows_formatted.json')
//   .then(response => response.json())
//   .then(data => {

//       /*
//       This section creates the base table and finds the root json node.
//       */
//       var jsonTable = document.createElement("table");
//       var tr = jsonTable.insertRow(-1);   
//       // jsonTable.style.width = "75%";
//       let root;
//       for (let prop in data) {
//           root = prop;
//       }

//       /*
//       This section selects the headers for the table
//       */
//       let headers = Object.keys(data[root][0]);
//       headers.forEach(header => {
//           var th = document.createElement("th");      
//           th.innerHTML = header;
//           tr.appendChild(th);
//       })              
//       /*
//       This section adds the data into each row of the list
//       */
//       let items = Object.keys(data[root]);
//       window.items_n = items.length
//       // slice item
//       items_s = items.slice(start, stop);

//       items_s.forEach(item => {
//           tr = jsonTable.insertRow(-1);
//           for (let key in data[root][item]) {
//               var tabCell = tr.insertCell(-1);
//               if (key == "Pic") {
//               var img = document.createElement("IMG");
//               img.src = data[root][item][key];
//               tabCell.appendChild(img);
//               }else{
//               tabCell.innerHTML = data[root][item][key];
//               }                       
//           }
//       })
//       /*
//       This section adds the table to the HTML
//       */
//       var divContainer = document.getElementById("showDataJSON");
//       divContainer.innerHTML = "";
//       divContainer.appendChild(jsonTable);

//   });