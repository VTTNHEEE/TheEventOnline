const loggedIn = document.querySelector('#logged-in');
const loginDiv = document.querySelector('#login-div');
const pwd_div = document.querySelector('#pwd-div');



var numberOfSecrets;
auth.onAuthStateChanged(async function (user) {
    if (user) {
        console.log("User logged in.")//:", user)

        // Hide Login box, show logged in message
        loggedIn.style.removeProperty("display");
        pwd_div.style.removeProperty("display");
        loginDiv.style.display = "none"
        document.querySelector('#li-message').innerText = "You are logged in as " + user["displayName"] + "."
            



    } else {
        console.log("User logged out.")//:", user)

        // Show login box, hide logged in message
        loggedIn.style.display = "none";
        loginDiv.style.removeProperty("display");
    }

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


// Submit password
const pwdForm = document.querySelector('#pwd-form')
pwdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = pwdForm['pwd-input'].value.toUpperCase();
    console.log("Entering...", code)
    db.collection("log").doc("inputs").collection(auth.currentUser["displayName"]).doc(Date.now().toString()).set({"time": firebase.firestore.Timestamp.now(), "input": code })

    storage.refFromURL('gs://theeventonline-4809b.appspot.com/password').child(code).child('image.jpg').getDownloadURL().then(

    url => {document.querySelector("#image_response").src = url ;
    document.querySelector("#pwdError").style["display"] = "none";}
    ).catch(e=>  {document.querySelector("#pwdError").innerText = "Incorrect Password: " + pwdForm['pwd-input'].value.toString() ; document.querySelector("#pwdError").style.removeProperty("display")})
    

})

