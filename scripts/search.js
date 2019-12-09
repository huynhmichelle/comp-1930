// Initialize firebase and firestore
var db = firebase_init();

var checkmark = '<span style="color: green; font-size:1.8em;">&#10004;</span>';     // ✔
var xmark = '<span style="color: red; font-size:1.3em;">&#10006;</span>';           // ✖
var savedRentalData = [];
var savedUserData = [];
var showRentalTable = true;
var showUserTable = true;
var showLandlords = true;


// Use regular expression to parse url parameters
// Returns object with string keys and values
function parseUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

// Get the current active datatable
// Returns id of table as string
function getActiveTable() {
    let parentId = $('.nav-tabs .active').attr('href');
    if (parentId == '#rental-table-div' && showRentalTable ) {
        return '#rental-results';
    }
    else if (parentId == '#user-table-div' || !showRentalTable ) {
        return '#user-results';
    }
}

// Determine which tables to render depending on url params
// Default display (without any url ?=...) is to show both tables
let urlVars = parseUrlVars();
let urlHasVars = Boolean(Object.keys(urlVars).length);
if (urlHasVars) {
    if (urlVars['rental'] == 'false') {
        document.getElementById('rental-table-div').style.display = 'none';
        document.getElementById('rental-tab').style.display = 'none';
        $('#user-tab').addClass('active');
        $('#user-table-div').tab('show');
        showRentalTable = false;
    }

    if ((urlVars['tenant'] == 'false') && (urlVars['roommate'] == 'false')) {
        document.getElementById('user-table-div').style.display = 'none';
        document.getElementById('user-tab').style.display = 'none';
        showUserTable = false;
    }

    if ((urlVars['tenant'] == 'true') || (urlVars['roommate'] == 'true')) {
        showLandlords = false;
    }
}

// Get rental data from firestore
// Doesn't return data but passes it to populateRentalTable
function getRentalData() {
    db.collection('rentals')
        .get()
        .then(function (querySnapshot) {
            let dataSet = [];
            querySnapshot.forEach(function (doc) {
                //console.log(doc.id, " => ", doc.data());
                dataSet.push({
                    'pic': '<img src="images/house1.png" width="50px;">',
                    'id': doc.data().rental_id,
                    'price': doc.data().rent_price,
                    'pets': doc.data().pets_ok,
                    'student': doc.data().student_tenant,
                    'roommates': doc.data().roommates,
                    'rooms_available': doc.data().rooms_available,
                    'date': doc.data().date_available,
                    'landlord': doc.data().landlordId,
                    'smoking': doc.data().smoking,
                    'children': doc.data().children_ok,
                });
            });
            // Add data to rental table
            populateRentalTable(dataSet);
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

// Get rental data
if (showRentalTable) {
    getRentalData();
}

// Process firestore data for display
function populateRentalTable(dataSet) {
    for (o of dataSet) {
        // If pets or students is True replace with ✔, else ✖
        o.pets = o.pets ? checkmark : xmark;
        o.student = o.student ? checkmark : xmark;
        o.rooms_available = `<span style="font-size: 2em;">${'&#128719;'.repeat(o.rooms_available)}</span>`;            // 🛏 (sleeping accommodation)
        o.roommates = `<span style="font-size: 1.5em;">${'&#128578;'.repeat(o.roommates)}</span>`;                      // 🙂 (slightly smiling face)
        o.smoking = o.smoking ? `<span style="font-size: 1.5em;">${'&#128684;'.repeat(o.smoking)}</span>` : xmark;      // 🚬 (smoking smybol)
        o.price = '$' + o.price.toString();
        o.landlord = o.landlord ? `<a href="user_profile.html?id=${o.landlord}">View</a>` : '';                         // Insert link to landlord
        o.children = o.children ? checkmark : xmark;
    }

    // save the processed data to use with filter clear functions
    savedRentalData = dataSet;

    // Create the rental datatable
    $('#rental-results').DataTable({
        dom: '<"#table-len"l>f<t>ip',
        autoWidth: false,   // Doesn't fill parent div when True
        data: dataSet,
        responsive: true,
        columns: [
            { title: 'Picture', data: 'pic' },
            { title: 'Listing', data: 'landlord' },
            { title: 'Rent', data: 'price' },
            { title: 'Kids', data: 'children' },
            { title: 'Pets', data: 'pets' },
            { title: 'Students', data: 'student' },
            { title: 'Smoking', data: 'smoking' },
            { title: 'Rooms Available', data: 'rooms_available' },
            { title: 'Roommates', data: 'roommates' },
            { title: 'Starting', data: 'date' },
        ]
    });

    // Update budget selector with retrieved data
    updateBudgetUI(dataSet);

}

// Get user data from firestore
// Doesn't return data but passes it to populateUserTable
function getUserData() {
    db.collection('users')
        .get()
        .then(function (querySnapshot) {
            let dataSet = [];
            querySnapshot.forEach(function (doc) {
                dataSet.push({
                    'userId': doc.data().displayId,
                    'pic': '<img src="images/User%20default%20photo.png" width="50px;">',
                    'name': doc.data().user_data.first_name + ' ' + doc.data().user_data.last_name,
                    'looking_for_housing': doc.data().user_data.looking_for_housing,
                    'looking_for_roommates': doc.data().user_data.looking_for_roommates,
                    'looking_for_tenants': doc.data().user_data.looking_for_tenants,
                    'children_ok': doc.data().user_data.children_ok,
                    'pets': doc.data().user_data.pets_ok,
                    'student': doc.data().user_data.post_secondary,
                    'city': doc.data().user_data.city,
                    'unemployed': doc.data().user_data.unemployed,
                    'price': doc.data().user_data.budget || '0',
                });
            });
            // Add data to user table
            populateUserTable(dataSet);

            // Update budget selector if rental table data isn't displayed first
            if( !showRentalTable ) {
                updateBudgetUI(dataSet);
            }
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

// Get rental data
if (showUserTable) {
    getUserData();
}

function populateUserTable(dataSet) {
    if (urlHasVars) {
        // Hide landlords if user has housing and is only looking for rooommates OR if the user is also a landlord
        if (showLandlords) {
            dataSet = dataSet.filter(o => { return o.looking_for_tenants });
        } else {
            dataSet = dataSet.filter(o => { return !o.looking_for_tenants });
        }
        // Hide all users who already have housing if user is a landlord looking for tenants
        if (urlVars['tenant'] == 'true') {
            dataSet = dataSet.filter(o => { return o.looking_for_housing });
        }
    }

    // Process user data for display
    for (var o of dataSet) {
        // If pets or children_ok is true replace with ✔, else ✖
        o.pets = o.pets ? checkmark : xmark;
        o.student = o.student ? checkmark : xmark;
        o.looking_for_roommates = o.looking_for_roommates ? checkmark : xmark;
        o.looking_for_housing = o.looking_for_housing ? checkmark : xmark;
        o.userId = `<a href="user_profile.html?id=${o.userId}">View</a>`;   // Add link to user profile
        o.children_ok = o.children_ok ? checkmark : xmark;
        o.price = '$' + o.price.toString();
    }

    // save the processed data to use with filter clear functions
    savedUserData = dataSet;

    // Create user datatable
    $('#user-results').DataTable({
        dom: '<"#table-len"l>f<t>ip',
        autoWidth: false,
        responsive: true,
        data: dataSet,
        columns: [
            { title: 'Picture', data: 'pic' },
            { title: 'Profile', data: 'userId' },
            { title: 'Name', data: 'name' },
            { title: 'Budget', data: 'price' },
            { title: 'Looking for roommates', data: 'looking_for_roommates' },
            { title: 'Looking for housing', data: 'looking_for_housing' },
            { title: 'Student', data: 'student' },
            { title: 'Kids OK', data: 'children_ok' },
            { title: 'Pets OK', data: 'pets' },
            { title: 'City', data: 'city' },
        ]
    });
}

// Update price filter with highest price in retrieved datas
function updateBudgetUI(dataSet) {
    let max_price = dataSet.reduce(function (a, b) {
        a.price = a.price.toString() || '$0';
        b.price = b.price.toString() || '$0';
        let price1 = parseInt(a.price.replace('$', ''));
        let price2 = parseInt(b.price.replace('$', ''));
        return (price1 > price2) ? a : b
    });
    max_price = parseInt(max_price.price.replace('$', ''));
    let range_input = document.getElementById("price-range-input");
    range_input.max = max_price;
    range_input.value = max_price;
    document.getElementById('price-range-text').value = `$${max_price}`;
    document.getElementById("price-range-max-text").innerHTML = `$${max_price}`;
}


// This function is called by every filter function
/* In order to stack multiple filters and have them all clearable without altering the retrieved data or 
   using another database query, we first clear all filters then reapply every filter functon except the caller. 
   The default parameter refilterFirst must be set to false here or there's infinite recursion. */
function refilter(caller) {
    restoreData();
    let filterFunctions = [priceFilterChanged, petsFilterChanged, kidsFilterChanged];
    for (filter of filterFunctions) {
        if (filter != caller) {
            filter(refilterFirst=false);
        }
    }
}

// Restore saved table data
// Used when Clear button is pressed or refilter is called.
function restoreData() {
    let tableId = getActiveTable();
    let table = $(tableId).DataTable(); // jquery.. getElementById doesn't work
    table.clear().draw();
    if (tableId == '#rental-results') table.rows.add(savedRentalData);
    else table.rows.add(savedUserData);
    table.columns.adjust().draw();
}

// Reset filter UI elements and restore data
// Used when Clear button is pressed
function clearFilters() {
    restoreData();
    let priceRangeInput = document.getElementById('price-range-input');
    let petsCheckbox = document.getElementById('pets-checkbox');
    let studentCheckbox = document.getElementById('student-checkbox');
    let currentPrice = document.getElementById('price-range-text');
    let max_price = priceRangeInput.max;
    currentPrice.value = `$${max_price}`;
    priceRangeInput.value = max_price;
    petsCheckbox.checked = false;
    studentCheckbox.checked = false;
}


// Price Slider Filter
function priceFilterChanged(refilterFirst = true) {
    let val = document.getElementById('price-range-input').value;
    document.getElementById('price-range-text').value = '$' + val;
    if (refilterFirst) { refilter(priceFilterChanged); }
    let table = $(getActiveTable()).DataTable(); // jquery.. getElementById doesn't work
    // if price > budget, remove row
    table.rows(function (idx, data, node) {
        let price = parseInt(data['price'].replace('$', ''));
        return price > val;
    })
        .remove()
        .draw();
}

// Pets checkbox filter
function petsFilterChanged(refilterFirst = true) {
    console.log('petsFilterChanged called');
    let checked = document.getElementById('pets-checkbox').checked;
    if (refilterFirst) { refilter(petsFilterChanged) }
    if (checked) {
        let table = $(getActiveTable()).DataTable(); // jquery.. getElementById doesn't work
        // if pets doesn't have checkmark, remove row
        table.rows(function (idx, data, node) {
            return data['pets'] != checkmark;
        })
            .remove()
            .draw();
    }
}

// Student checkbox filter
function studentFilterChanged(refilterFirst = true) {
    let checked = document.getElementById('student-checkbox').checked;
    if (refilterFirst) { refilter(studentFilterChanged); }
    if (checked) {
        let table = $(getActiveTable()).DataTable(); // jquery.. getElementById doesn't work
        // if student doesn't have checkmark, remove row
        table.rows(function (idx, data, node) {
            return data['student'] != checkmark;
        })
            .remove()
            .draw();
    }
}

// Kids checkbox filter
function kidsFilterChanged(refilterFirst = true) {
    let checked = document.getElementById('kids-checkbox').checked;
    if (refilterFirst) { refilter(studentFilterChanged); }
    if (checked) {
        let table = $(getActiveTable()).DataTable(); // jquery.. getElementById doesn't work
        // if kids doesn't have checkmark, remove row
        table.rows(function (idx, data, node) {
            return data['children_ok'] != checkmark;
        })
            .remove()
            .draw();
    }
}