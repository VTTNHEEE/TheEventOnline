// Upload Files DOM -------------------
const answerUpload = document.querySelector('#UploadAnswers input');
const answerSpan = document.querySelector('#UploadAnswers span');
const photoUpload = document.querySelector('#UploadPhoto input');
const photoSpan = document.querySelector('#UploadPhoto span');

function initUpload(uploadEle, spanEle) {

    uploadEle.addEventListener('change', function () {
        if (uploadEle.files.length < 1) {
            spanEle.innerText = "";
            spanEle.classList.remove("fileSpanOn")
            return
        }
        spanEle.innerText = shortenFilename(uploadEle.files[0].name)
        spanEle.classList.add("fileSpanOn")
    });
}

initUpload(answerUpload, answerSpan)
initUpload(photoUpload, photoSpan)


function shortenFilename(fn) {
    if (fn.indexOf(".") > -1 && fn.length > 15) {
        let fnSpl = fn.split(".")
        return fnSpl[0].substr(0, 12) + "..." + fnSpl[fnSpl.length - 1];
    }
    return fn.substr(0, 15)
}

// DOM -------------------
const unlockBtn = document.querySelector('#unlockBtn');
unlockBtn.onclick = onUnlock

const downloadBtn = document.querySelector('#downloadBtn');
downloadBtn.onclick = onDownload

const submitBtn = document.querySelector('#submitBtn');
submitBtn.onclick = onSubmit;

const uploadBtns = document.getElementsByClassName("upload")
const unlockedDiv = document.querySelector('#unlockedDiv');

var end;
function onUnlock() {

    userDoc.update({ locked: false }).then(function () {
        console.log("Unlocked successfully.");
        end = Math.ceil(new Date().getTime() / 1000) + numofMins * 60
        preemptiveServerSnapshot()
    })
        .catch(function (error) {
            console.error("Error unlocking: ", error);
        });
}


const numofMins = 60 

function onSubmit() {

    function _submit(uploadEle, spanEle) {
        if (uploadEle.files.length < 1) { console.log("No file selected."); return 
    }

        let file = uploadEle.files[0]
        let fn = spanEle.innerText
        let dN = auth.currentUser.displayName || "noDisplayName"
        let timing = "e"
        if(end){
        timing = Math.ceil( (end - new Date().getTime() / 1000) / 60).toString()
        }
        let verbose_fn = weekString + "--" + dN + "--" + timing + "--" + Math.ceil(Math.random() * 100).toString() + "--" + fn
        let uploadTask = storage.ref("/submitted/" + weekString + "/" + verbose_fn).put(file)

        uploadTask.on('state_changed', function (snapshot) {
        }, function (error) {
            console.log('Error on upload: ', error);
            spanEle.classList.add("error-text")
        }, function () {
            console.log('File upload success');
            spanEle.classList.add("success-text")
        });

        uploadEle.value = "";
    }

    _submit(answerUpload, answerSpan)
    _submit(photoUpload, photoSpan)

}


async function initDownloadButton() {

    // Get File Path
    let passphrasePromise = await db.collection("secrets").doc(weekString).get()
    let passphrase = passphrasePromise.data().pass

    if (!passphrase) {
        console.log("Error getting passphrase.")
        return
    }

    let files = await storage.refFromURL('gs://theeventonline-4809b.appspot.com/questions/')
        .child(weekString)
        .child(passphrase)
        .list({ maxResults: 1 }).catch((e) => console.log("Error getting filename: ", e))

    let filePath = files.items[0].location.path

    // Get File and link to Download button
    var fileName = filePath.split("/").reverse()[0]

    storage.ref(filePath)
        .getDownloadURL()
        .then(function (fb_url) {

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';

            xhr.onload = function (event) {
                var blob = xhr.response;
                downloadBtn.href = window.URL.createObjectURL(blob);
                downloadBtn.download = fileName;
            };

            xhr.open('GET', fb_url);
            xhr.send();
        })
}

var downloaded = false;
function onDownload() {

    if (!downloaded) {
        userDoc.update({ downloadCount: downloadCount + 1 }).then(function () {
            console.log("Updated Download successfully.");
        })
            .catch(function (error) {
                console.error("Error Updating Download: ", error);
            });
        downloaded = true;
    }
}



var sI;
const weekMessageDiv = document.querySelector('#week-message-div');
var timer = document.querySelector('#timer');

function serverDocSnapshot(snapshot) {
    //console.log("serverSnapshot: ", snapshot)
    
    if (!snapshot || !snapshot.data() || Object.keys(snapshot.data()).length === 0) {
        //console.log("serverSnapshotData is empty / does not exist");
        timer.style.display = "none";
        weekMessageDiv.style.removeProperty("display");
        if (sI) { clearInterval(sI); }
    }


    else{

    end = snapshot.data().unlockedTime.seconds + numofMins * 60
    if (!sI) {
        console.log("3rd party server update.")
        preemptiveServerSnapshot();
    }
    }
    
    document.querySelector("#currentWeek").style.removeProperty("display")

}

function preemptiveServerSnapshot() {
    //console.log("preemptiveServerSnapshot")

    if (sI) { clearInterval(sI); }

    initDownloadButton()
    unlockBtn.disabled = true;
    unlockedDiv.style.removeProperty("display");
    timer.style.removeProperty("display");
    weekMessageDiv.style.display = "none";


    // Timer 
    if (end - Math.ceil(new Date().getTime() / 1000) > 0) {
        sI = setInterval(tick, 1000)
    }
    else{
        onTimerExpire()
    }

    function tick() {
        let difference = end - Math.ceil(new Date().getTime() / 1000)
        let mins = (Math.floor(difference / 60)).toString()
        let secs = (difference % 60).toString()
        timer.innerText = ("0" + mins).slice(-2) + ":" + ("0" + secs).slice(-2);

        if (difference <= 0) { clearInterval(sI); onTimerExpire()}
        if (difference <= 5 * 60) {
            timer.style.color = "red";
        }
    }

}


function onTimerExpire(){
    timer.style.color = "black";
    timer.style.display = "none"
    unlockedDiv.style.display = "none";
    unlockBtn.style.display = "none";
    weekMessageDiv.children[0].innerText = "IT'S OVER!"
    weekMessageDiv.children[1].innerText = "You've done all that you can for this week. \n We hope that you had fun."
    
    weekMessageDiv.style.removeProperty("display");
}

       /// Previous Weeks


function onScoresSnapshot(snap){


    //console.log("ScoresSnapshot: ", snap)
        let a = snap.docs

        if(a.length == 1 && a[0].id == "default" ){
            console.log("No scores.")
            return
        }

        document.body.querySelector("#previousScores").style.removeProperty("display")

        
        
        // Reverse Sort the Score Docs based on Week ##.
        a.sort(function(x, y) {

            let xNum = parseInt(x.id.split(" ")[1])
            let yNum = parseInt(y.id.split(" ")[1])

            // Return statements opposite to normal due to reverse sort.
            if (xNum < yNum) {
              return 1;
            }
            if (xNum > yNum) {
              return -1;
            }
            return 0;
          });


        a.forEach(  doc => {

            if( doc.id == "default"){
                return
            }

            let s = `<div class="box">
            <h1>{title}</h1>
            <h2>Score: {score}/60</h2>
            <p>{message}</p>
            </div>`
            s = s.replace("{title}", doc.id)
            s = s.replace("{score}",doc.data().score)
            s = s.replace("{message}",doc.data().message || "")

            let temp = document.createElement('div')
            temp.classList.add("container")
            temp.innerHTML = s;
            const previousScoresDiv = document.body.querySelector("#previousScores")
            previousScoresDiv.appendChild(temp)
       
        }




        )


 


}



