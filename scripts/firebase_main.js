
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
            // Make profile elements visisble when user is logged in
            const profileElements = document.querySelectorAll('.user-profile-elements');
            profileElements.forEach(elem => {
                elem.style.visibility = 'visible';
            });
            // Hide login button
            document.getElementById('login-button').style.visibility = 'hidden';

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
        window.location.assign('login.html');
    
    }).catch(function(error) {
        // An error occurred.
        console.log("Error logging out")
    });
 }

