const button = document.getElementById("button").addEventListener('click', submit);
const responseMessage = document.getElementById("responseMessage");

function submitMessage() {
    let email = document.getElementById("emailaddress");
    email.value = '';
    responseMessage.classList.toggle("opacity-75");
    responseMessage.classList.toggle("-translate-y-16");

    setTimeout(() => {
        responseMessage.classList.toggle("opacity-75");
        responseMessage.classList.toggle("-translate-y-16");
    }, 3000)
}

function isEmailCorrectFormat(email) {
    const regex = /^[^@]+@\w+(\.\w+)+\w$/;
    if (regex.test(email) == true) {
        //email is good :D
        return true;
    } else {
        //email isn't good :(
        return false;
    }
}

async function submit() {
    var email = document.getElementById("emailaddress").value;
    if (!isEmailCorrectFormat(email)) {
        return;
    }
    // Hubspot's base API url
    let base_url = "https://api.hsforms.com/submissions/v3/integration/submit";

    // Our portalId
    let portal_id = "144715652";

    // Our formId
    let form_id = "af2a733d-8790-4d20-b8fa-49571aa6c6ff";

    // Construct the request url
    let request_url = base_url + "/" + portal_id + "/" + form_id;


    let body = {
        "submittedAt": (new Date()).getTime(),
        "fields": [
            {
                "objectTypeId": "0-1",
                "name": "email",
                "value": email
            }
        ]
    }
    await fetch(request_url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(submitMessage())
}