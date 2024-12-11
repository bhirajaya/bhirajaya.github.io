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
const filePaths = ['./Data/nword_title_1000rows.json', './Data/nword_detail_1000rows.json', './Data/nword_highlight_1000rows.json',
  './Data/invid_title_1000rows_utf8.json', './Data/invid_detail_1000rows_utf8.json', './Data/invid_highlight_1000rows_utf8.json',
  './Data/inno_data_1000rows_formatted.json'
];
let nword_title = {}; 
let nword_detail = {};
let nword_highlight = {};
let invid_title = {};
let invid_detail = {};
let invid_highlight = {};
let inno_data = {}

// get data from json files
Promise.all(filePaths.map(filePath => fetch(filePath)))
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then(jsonDataArray => {
    // jsonDataArray contains the parsed JSON data from each file
    nword_title = jsonDataArray[0];
    nword_detail = jsonDataArray[1];
    nword_highlight = jsonDataArray[2];
    invid_title = jsonDataArray[3];
    invid_detail = jsonDataArray[4];
    invid_highlight = jsonDataArray[5];
    inno_data = jsonDataArray[6];
  })
  .catch(error => console.error('Error reading JSON files:', error));


// trigger when user click search
function click_search(element) {

  // get input value
  const cl = element.getAttribute('class');
  const input = document.querySelectorAll(`input.${cl}`)[0].value;

  // catch for null text search
  let output = "";
  if (input===null || input.trim() == "") {
      output = "Input some text please"
  } else {
      output = "Search for " + input
      // call actual search function
      search(input)  
  }
  document.querySelectorAll(`span.${cl}`)[0].innerHTML = output  
}

// seach function
function search(search_term) {
  //make lower case and split to list of different word
  slw = search_term.toLowerCase();
  words_l = slw.split(" ")

  // object to store total summation of score of each word
  multi_word_score = {}
  // perform search for each word
  for (let i=0; i < words_l.length; i++){
    word = words_l[i];
    let one_word_score = combine_score(word,invid_title,invid_detail,invid_highlight,nword_title,nword_detail,nword_highlight,10,2);
    // update score from each word to multiple word score object
    Object.keys(one_word_score).forEach((docid) => {
      let old_val = multi_word_score[docid];
      if (old_val === undefined) {
        old_val = 0;
      }
      multi_word_score[docid] = old_val + one_word_score[docid];
    });
  }
  
  // sort list of documents by the total score, high to low
  sort_obj = sortObj(multi_word_score)
  n_res = sort_obj.length

  // if found noting, show no table
  if (n_res==0) {
    divContainer.innerHTML = "";
    pageContainer.innerHTML = "found nothing";
  } else {
    //else add result document to a list, also add the score as another data columns
    res_l = []
    for (let i=0; i < n_res; i++){
      docid = sort_obj[i][0]
      cal_score = sort_obj[i][1]
      one_data = inno_data['inno_product'][docid]
      one_data['score'] = cal_score
      res_l.push(one_data)
    }
    res_d = {'search_result':res_l}

    // update pagination variable 
    items_n = n_res;
    totalPages = Math.ceil(items_n / perPage);
    currentPage = 1;
    start = 0;
    stop = start+perPage;
    // show results
    pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
    make_table(res_d, start, stop)
  }
  
}

// return list of documents that have exact word match with the query
function one_word_match(word, invid) {
  if (word in invid) {
    return invid[word]
  } else {
    return []
  }
}

// return list of documents that have a part of string containing query
function one_word_instr(word, invid) {
  let result = [];
  Object.keys(invid).forEach((key) => {
    if (key.includes(word)) {
      result.push(...invid[key])
    }
  });
  return result
}

// function to calculate similarity score of a query and a document
function score(result, nd, score) {
  let score_d = {}
  result.forEach((docid) => {
    score_d[docid] = score/Math.log(10+nd[docid])
  });
  return score_d
}

// function to calculation score of one word query
function combine_score(q, invid_t, invid_d, invid_h, nd_t, nd_d, nd_h, score_match, score_instr){
  // calculate score from query and word in Title, Detail, and Highlight by whole word match and substring match
  match_t = score(one_word_match(q, invid_t), nd_t, score_match)
  match_d = score(one_word_match(q, invid_d), nd_d, score_match)
  match_h = score(one_word_match(q, invid_h), nd_h, score_match)
  str_t = score(one_word_instr(q, invid_t), nd_t, score_instr)
  str_d = score(one_word_instr(q, invid_d), nd_d, score_instr)
  str_h = score(one_word_instr(q, invid_h), nd_h, score_instr)

  // combine score together to one object
  total_score = {}
  Object.keys(match_t).forEach((docid) => {
    let old_val = total_score[docid];
    if (old_val === undefined) {
      old_val = 0;
    }
    total_score[docid] = old_val + match_t[docid];
  });
  Object.keys(match_d).forEach((docid) => {
    let old_val = total_score[docid];
    if (old_val === undefined) {
      old_val = 0;
    }
    total_score[docid] = old_val + match_d[docid];
  });
  Object.keys(match_h).forEach((docid) => {
    let old_val = total_score[docid];
    if (old_val === undefined) {
      old_val = 0;
    }
    total_score[docid] = old_val + match_h[docid];
  });

  Object.keys(str_t).forEach((docid) => {
    let old_val = total_score[docid];
    if (old_val === undefined) {
      old_val = 0;
    }
    total_score[docid] = old_val + str_t[docid];
  });
  Object.keys(str_d).forEach((docid) => {
    let old_val = total_score[docid];
    if (old_val === undefined) {
      old_val = 0;
    }
    total_score[docid] = old_val + str_d[docid];
  });
  Object.keys(str_h).forEach((docid) => {
    let old_val = total_score[docid];
    if (old_val === undefined) {
      old_val = 0;
    }
    total_score[docid] = old_val + str_h[docid];
  });

  return total_score
}

// function to sort from values, descending order
function sortObj(obj) {
  // Sort object as list based on values
  sort_obj = Object.keys(obj).map(k => ([k, obj[k]])).sort((a, b) => (b[1] - a[1]))
  return sort_obj
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
      make_table(res_d, start, stop);
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    start += perPage
    stop += perPage
    pageContainer.innerHTML = `Page ${currentPage} from ${totalPages}. Records ${start+1} to ${stop} of ${items_n}.`;
    make_table(res_d, start, stop);
  }
});