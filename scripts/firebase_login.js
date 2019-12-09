function firebaseLogin() {
    
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
    // Initialize Firestore
    var db = firebase.firestore();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    // If user was trying to view a profile not logged in then get url from localStorage
    // Else redirect them to the main page
    var redirect_page = window.localStorage.getItem('login_redirect') || 'main.html';
    
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                var user = authResult.user;
                if (authResult.additionalUserInfo.isNewUser) {
                    db.collection('users').doc(user.uid).set({
                        email: user.email,
                        displayID: randInt(1, 10e6) // for MVP, not checking if uniqe for now
                    })
                        .then(function () {
                            // If new user, redirect to edit profile
                            window.location.assign('edit_user_profile.html');
                            return true;
                        })
                        .catch(function (error) {
                            console.log('Error in new user handler' + error);
                        });

                } else {
                    console.log('existing user');
                    return true;
                }
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                // document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'redirect', //popup
        signInSuccessUrl: redirect_page,
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

    // Generate a random integer for displayIds
    // Not checking if they are unique right now
    function randInt(min, max){
        return(Math.floor(Math.random() * (+max - +min)) + +min); 
    }

}