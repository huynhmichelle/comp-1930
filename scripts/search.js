// Initialize firebase and firestore
var db = firebase_init();

var checkmark = '&#10004;'; // ✔
var xmark = '&#10006;'; // ✖
var savedRentalData = [];
var savedUserData = [];

var showRentalTable = true;
var showUserTable = true;

// Only process url options if at least one is false and needs to be hidden (they should never both be false)
// Default display (without any ? url params) is to show both tables
let params = decodeURIComponent(window.location.search);
if( params && params.split('?')[1].search('false') != -1 ){
    let rentalDisplay = params.split('?')[1].split('&')[0];
    let peopleDisplay = params.split('?')[1].split('&')[1];
    // If rentals=false then hide rental table from display and make people the default
    if( rentalDisplay.split('=')[1] == 'false' ) {
        document.getElementById('rental-table-div').style.display = 'none';
        document.getElementById('rental-tab').style.display = 'none';
        $('#user-tab').addClass('active');
        $('#user-table-div').tab('show');
        showRentalTable = false;
    }
    // If people=false then hide use table from display
    if( peopleDisplay.split('=')[1] == 'false' ) {
        document.getElementById('user-table-div').style.display = 'none';
        document.getElementById('user-tab').style.display = 'none';
        showUserTable = false;
    }
}


//if (profileId.search('id=') != -1) {
  //  var idValue = parseInt(profileId.split('=')[1]);


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
if( showRentalTable ){ 
    getRentalData();
}

function populateRentalTable(dataSet) {
    // Process firestore data for display
    for (o of dataSet) {
        // If pets is True replace with ✔, else ✖
        o.pets = o.pets ? checkmark : xmark;
        o.student = o.student ? checkmark : xmark;
        o.price = '$' + o.price.toString();
        o.landlord = o.landlord ? `<a href="profile_other_user.html?id=${o.landlord}">View</a>` : '';
    }

    // save the processed data
    savedRentalData = dataSet;

    $('#rental-results').DataTable({
        dom: '<"#table-len"l>f<t>ip',
        autoWidth: true,
        data: dataSet,
        columns: [
            { title: 'Picture', data: 'pic' },
            { title: 'Listing', data: 'landlord' },
            { title: 'Price', data: 'price' },
            { title: 'Pets', data: 'pets' },
            { title: 'Students', data: 'student' },
            { title: 'Rooms', data: 'rooms_available' },
            { title: 'Roommates', data: 'roommates' },
            { title: 'Starting', data: 'date' },
        ]
    });

    // Update price filter with highest price in retrieved data
    let max_price = dataSet.reduce(function (a, b) {
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



function getUserData() {
    db.collection('users')
        .get()
        .then(function (querySnapshot) {
            let dataSet = [];
            querySnapshot.forEach(function (doc) {
                //console.log(doc.id, " => ", doc.data());
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
                    'unemployed': doc.data().user_data.unemployed
                });
            });
            // Add data to user table
            populateUserTable(dataSet);
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

// Get rental data
if( showUserTable ){ 
    getUserData();
}

function populateUserTable(dataSet) {
    // Process firestore data for display
    for (var o of dataSet) {
        // If pets is True replace with ✔, else ✖
        o.pets = o.pets ? checkmark : xmark;
        o.student = o.student ? checkmark : xmark;
        o.userId = `<a href="profile_other_user.html?id=${o.userId}">View</a>`;
        for (var attr in o) {
            if( !o.attr ) { 
                o.attr = '';
            }
        }
    }
    savedUserData = dataSet;

    $('#user-results').DataTable({
        dom: '<"#table-len"l>f<t>ip',
        autoWidth: true,
        data: dataSet,
        columns: [
            { title: 'Picture', data: 'pic' },
            { title: 'Profile', data: 'userId' },
            { title: 'Name', data: 'name' },
            { title: 'Pets', data: 'pets' },
            { title: 'Student', data: 'student' },
            { title: 'City', data: 'city' },
            { title: 'Unemployed', data: 'unemployed' },
        ]
    });
}

function refilter(caller) {
    restoreData();
    let filterFunctions = [priceFilterChanged, petsFilterChanged];
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
    var table = $('#rental-results').DataTable();
    table.clear().draw();
    table.rows.add(savedRentalData);
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
    //maxPrice.innerHTML = `$${max_price}`;
    priceRangeInput.value = max_price;
    petsCheckbox.checked = false;
    studentCheckbox.checked = false;
}

function priceFilterChanged(refilterFirst = true) {
    let val = document.getElementById('price-range-input').value;
    document.getElementById('price-range-text').value = '$' + val;
    if (refilterFirst) { refilter(priceFilterChanged); }
    let table = $('#rental-results').DataTable(); // jquery.. getElementById doesn't work
    // if price isn't <= budget, remove row
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
    if (refilterFirst) { refilter(petsFilterChanged); }
    if (checked) {
        let table = $('#rental-results').DataTable(); // jquery.. getElementById doesn't work
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
        let table = $('#rental-results').DataTable(); // jquery.. getElementById doesn't work
        // if student doesn't have checkmark, remove row
        table.rows(function (idx, data, node) {
            return data['student'] != checkmark;
        })
            .remove()
            .draw();
    }
}