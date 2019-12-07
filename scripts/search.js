// Initialize firebase and firestore
var db = firebase_init();

var checkmark = '<span style="color: green; font-size:1.8em;">&#10004;</span>'; // ✔
var xmark = '<span style="color: red; font-size:1.3em;">&#10006;</span>'; // ✖
var savedRentalData = [];
var savedUserData = [];
var showRentalTable = true;
var showUserTable = true;
var showLandlords = true;

function parseUrlVars() {
    var vars = {};
    // Use regular expression to parse url parameters
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getActiveTable() {
    let parentId = $('.nav-tabs .active').attr('href');
    if (parentId == '#rental-table-div' && showRentalTable ) {
        return '#rental-results';
    }
    else if (parentId == '#user-table-div' || !showRentalTable ) {
        return '#user-results';
    }
}

// Default display (without any url ?=) is to show both tables
let urlVars = parseUrlVars();
let urlHasVars = Boolean(Object.keys(urlVars).length);

if (urlHasVars) {
    if (!(urlVars['rental'] == 'true')) {
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

function populateRentalTable(dataSet) {
    // Process firestore data for display
    for (o of dataSet) {
        // If pets is True replace with ✔, else ✖
        o.pets = o.pets ? checkmark : xmark;
        o.student = o.student ? checkmark : xmark;
        o.rooms_available = `<span style="font-size: 2em;">${'&#128719;'.repeat(o.rooms_available)}</span>`;
        o.roommates = `<span style="font-size: 1.5em;">${'&#128578;'.repeat(o.roommates)}</span>`;
        o.smoking = o.smoking ? `<span style="font-size: 1.5em;">${'&#128684;'.repeat(o.smoking)}</span>` : xmark;
        o.price = '$' + o.price.toString();
        o.landlord = o.landlord ? `<a href="user_profile.html?id=${o.landlord}">View</a>` : '';
        o.children = o.children ? checkmark : xmark;
    }

    // save the processed data
    savedRentalData = dataSet;

    $('#rental-results').DataTable({
        dom: '<"#table-len"l>f<t>ip',
        autoWidth: false,
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

    updateBudgetUI(dataSet);

}


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


    for (var o of dataSet) {
        // If pets is True replace with ✔, else ✖
        o.pets = o.pets ? checkmark : xmark;
        o.student = o.student ? checkmark : xmark;
        o.looking_for_roommates = o.looking_for_roommates ? checkmark : xmark;
        o.looking_for_housing = o.looking_for_housing ? checkmark : xmark;
        o.userId = `<a href="user_profile.html?id=${o.userId}">View</a>`;
        o.children_ok = o.children_ok ? checkmark : xmark;
        console.log(o.price);
        o.price = '$' + o.price.toString();
    }

    savedUserData = dataSet;

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

function updateBudgetUI(dataSet) {
    // Update price filter with highest price in retrieved data
    let max_price = dataSet.reduce(function (a, b) {
        //console.log(a);
        //console.log(b);
        a.price = a.price.toString() || '$0';
        b.price = b.price.toString() || '$0';
        console.log(a.price);
        console.log(b.price);
        
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

function refilter(caller) {
    restoreData();
    let filterFunctions = [priceFilterChanged, petsFilterChanged, kidsFilterChanged];
    // filterFunctions.filter(f => f==caller);
    for (f of filterFunctions) {
        if (f != caller) {
            f(false);
            //console.log(f);
        }
    }
}

function restoreData() {
    // Restore saved table data
    let tableId = getActiveTable();
    console.log(tableId);
    let table = $(tableId).DataTable();
    table.clear().draw();
    if (tableId == '#rental-results') { table.rows.add(savedRentalData) }
    else { table.rows.add(savedUserData) }
    table.columns.adjust().draw();
}

function clearFilters() {
    restoreData();
    // Clear UI filter elements
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

function kidsFilterChanged(refilterFirst = true) {
    let checked = document.getElementById('kids-checkbox').checked;
    if (refilterFirst) { refilter(studentFilterChanged); }
    if (checked) {
        let table = $(getActiveTable()).DataTable(); // jquery.. getElementById doesn't work
        // if student doesn't have checkmark, remove row
        table.rows(function (idx, data, node) {
            return data['children_ok'] != checkmark;
        })
            .remove()
            .draw();
    }
}