var logging_out = false;

function firebase_init() {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCOl7zfOtE5H75WPViBv-jNxn9nZLhHNFo",
        authDomain: "fire1-2c085.firebaseapp.com",
        databaseURL: "https://fire1-2c085.firebaseio.com",
        projectId: "fire1-2c085",
        storageBucket: "fire1-2c085.appspot.com",
        messagingSenderId: "228703666474",
        appId: "1:228703666474:web:3bacd2b08daf85a79cde53",
        measurementId: "G-8V89TB50QY"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('initialized firebase');

    // Initialize Firestore
    var db = firebase.firestore();

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            console.log('Logged in');
            console.log(user.uid);
            userId = user.uid;
            // Make profile elements visisble when user is logged in
            const profileElements = document.querySelectorAll('.user-profile-elements');
            console.log(profileElements);
            profileElements.forEach(elem => {
                // elem.style.visibility = 'visible';
                elem.setAttribute('style', 'display:block !important');
            });
            // Hide login buttons
            document.getElementById('login-button').style.display = 'none';
            document.getElementById('login-sidebar').style.display = 'none';
        } else {
            console.log('User not logged in');
            // No user is signed in.
        }
    });
    return db;
}


function firebase_logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        console.log('User logged out');
        logging_out = true;
        localStorage.removeItem('login_redirect');
        window.location.assign('index.html');
    
    }).catch(function(error) {
        // An error occurred.
        console.log("Error logging out")
    });
 }

