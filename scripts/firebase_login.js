function firebaseLogin() {
    console.log('firebase login called');
    
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
    // Initialize Firestore
    var db = firebase.firestore();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                console.log('LOGGED IN');
                var user = authResult.user;
                if (authResult.additionalUserInfo.isNewUser) {
                    db.collection('users').doc(user.uid).set({
                        email: user.email,
                        // not checking if uniqe for noww
                        displayID: randInt(1, 10e6)
                    })
                        .then(function () {
                            console.log("new user added to firestore");
                            window.location.assign('edit_user_profile.html');
                            return true;
                        })
                        .catch(function (error) {
                            console.log('Error happened' + error);
                        });

                } else {
                    console.log('existing user');
                    return true;
                }
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

    function randInt(min, max){
        return(Math.floor(Math.random() * (+max - +min)) + +min); 
    }

}