const loggedIn = document.querySelector('#logged-in');
const loginDiv = document.querySelector('#login-div');


var numberOfSecrets;
auth.onAuthStateChanged(async function (user) {
    if (user) {
        console.log("User logged in.")//:", user)

        // Hide Login box, show logged in message
        loggedIn.style.removeProperty("display");
        loginDiv.style.display = "none"
        document.querySelector('#li-message').innerText = "You are logged in as " + user["displayName"] + "."
            
        //Get numOfSecrets
        let metaPromise = await db.collection("meta").doc("info").get()
        numberOfSecrets = await metaPromise.data().numberOfSecrets
        document.querySelector("#numberOfSecrets").innerText = numberOfSecrets.toString()
        document.querySelector("#topContainter").style.removeProperty("display")
        //Get secrets
        let secretsPromise = await db.collection("meta").doc("secrets").get()
        console.log("secrets", secretsPromise)
        generateSecrets(secretsPromise.data())



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


function generateSecrets(data){

    function dataSort(x1,y1){
        let x = data[x1].length
        let y = data[y1].length
        console.log(x,y)
        if(x>y){return -1}
        else if(x<y){return 1}
        return 0
    }

    let orderedTeamNames = Object.keys(data).sort(dataSort)

    let template = `<div class="container">
    <div class="box" id="secretsBox">
      <h1>{teamName}</h1>
      <h1>{secrets}</h1>
</div>
</div>`

    for(let team of orderedTeamNames){
        
        value = data[team]
        console.log(team, ": ", value)
        let inner = template.replace("{teamName}",team)
        inner = inner.replace("{secrets}",value)
        let d = document.createElement("div")
        d.innerHTML = inner
        document.getElementById("secretsDiv").appendChild(d)

    }


}