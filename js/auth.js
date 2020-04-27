// Auth Changes
const loggedIn = document.querySelector('#logged-in');
const loginDiv = document.querySelector('#login-div');

var userDoc;
var message;
var weekString;
var weekTitle;
var downloadCount;
auth.onAuthStateChanged(async function (user) {
    if (user) {
        console.log("User logged in.")//:", user)

        // Hide Login box, show logged in message
        loggedIn.style.removeProperty("display");
        loginDiv.style.display = "none"
        document.querySelector('#li-message').innerText = "You are logged in as " + user["displayName"] + "."

            

        //Get weekString and message
        let metaPromise = await db.collection("meta").doc("info").get()
        weekString = metaPromise.data().weekString
        weekTitle = metaPromise.data().weekTitle
        message = metaPromise.data().message
        
        document.querySelector("#weekTitle").innerText = weekTitle;
        if(message){
        document.querySelector("#topMessage").innerText = message
        document.querySelector("#topMessage").parentElement.style.removeProperty("display")
        }

        // Setup userDoc = /users/UID/user/weekString
        userDoc = db.collection("users").doc(auth.getUid()).collection("user").doc(weekString)
        let userDocPromise = await userDoc.get()
        downloadCount = userDocPromise.data().downloadCount

        let serverDoc = db.collection("users").doc(auth.getUid()).collection("server").doc(weekString)
        let serverDocUnsub = serverDoc.onSnapshot(doc => serverDocSnapshot(doc));

        let scores = db.collection("users").doc(auth.getUid()).collection("scores").get().then(snap => onScoresSnapshot(snap))
        // db.collection('users').doc(auth.getUid()).collection('user').doc("random").set({ unlockedTime: "Success!"});

    } else {
        console.log("User logged out.")//:", user)

        // Show login box, hide logged in message
        loggedIn.style.display = "none";
        loginDiv.style.removeProperty("display");
    }

})

//Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut()
})


// Login
const loginForm = document.querySelector('#login-form')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
    }).catch(e => document.querySelector("#loginError").style.removeProperty("display"))

})