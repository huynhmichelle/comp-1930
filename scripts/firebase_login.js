function firebaseLogin() {
    console.log('firebase login called');
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
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: 'main.html',
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
}