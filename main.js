const button = document.getElementById("button").addEventListener('click', submit);

async function submit() {
    // Hubspot's base API url
    let base_url = "https://api.hsforms.com/submissions/v3/integration/submit";
    
    // Our portalId
    let portal_id = "144715652";
    
    // Our formId
    let form_id = "af2a733d-8790-4d20-b8fa-49571aa6c6ff";
    
    // Construct the request url
    let request_url = base_url + "/" + portal_id + "/" + form_id;
    
    // Selecting the email input element and get its value
    var email = document.getElementById("emailaddress").value;
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
          }).then(alert("Success!"))
  }