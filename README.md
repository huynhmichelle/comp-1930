# COMP-1930



## File Tree

```bash
├── 404.html
├── edit_profile2.html
├── edit_profile.html
├── images
│   ├── facebook.png
│   ├── house1.png
│   ├── instagram.png
│   ├── landing_background.jpg
│   ├── link.png
│   ├── twitter.png
│   ├── user-2.png
│   └── User default photo.png
├── index.html
├── main.html
├── map.html
├── my_profile.html
├── scripts
│   ├── firebase_login.js
│   ├── firebase_main.js
│   ├── map_and_geocoder.js
│   └── search.js
├── search.html
├── styles
│   ├── cover.css
│   ├── header.css
│   └── map.css
└── user_profile.html
```

## File Structure Overview
The following is an overview of our file structure:

### index.html
---
This is the first page that users come across when they visit our web application. Users can click "Explore" or "Home" to redirect to our **main.html** page to try our search function. 

### login.html
---
Users get redirected to this page when they click the "Login / Register" button or when they try to access another user's profile/more rental information without signing in. 

We used Google Firebase for the user authentication process.

### edit_profile.html
---
Page 1 of 2 for the user profile editing section. Users can add general information about themselves such as name, city of residence, their maximum budget, along with adding a bio/description.

### edit_profile2.html
---
Page 2 of 2 for the user profile editing section. Users can add links to any social media/email that they want to share for other users to get in touch with them. Users can also add search filter tags to help other users with finding their profile.

### my_profile.html
---
User’s own profile page showing their name, contact info / optional social media links and search filters. Users can click on an Edit Profile button to go to **edit_profile.html**

### user_profile.html
---
Profile page for other users. A url argument (*'?id='*) specifies which user profile to load. This page shows the same info as **my_profile.html** but without an edit profile button. It also displays rental information if the user is a landlord.

### main.html
---
Users can indicate on this page whether they are looking for a tenant, looking for a roommate, and/or looking for a place to live. They will be redirected to the search results page upon clicking the “Search” button. 

### search.html
---
Displays user and rental info in two table tabs depending on what checkboxes the user selected on the previous page (**main.html**). Lets users sort and filter table results by quantity, value 

### styles
---
**cover.css** is for styling the landing page (**index.html**)
**header.css** is for styling the page headers found on most of the webpages

### scripts
---
**firebase_login.js** is used for the login authentication in **login.html**

**firebase_main.js** includes the initializing of Google Firebase and Firestore and includes a logout function for logging out signed-in users. It also has a function for changing certain page elements based on whether the user is signed-in or not.

**search.js** processes firestore data and creates the user and rental datatables. It contains the custom search filter functions.
