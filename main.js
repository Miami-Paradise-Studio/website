document.getElementById('newsletterForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('emailaddress').value;

    fetch('https://script.google.com/macros/s/AKfycbxk7Nwnpjd0IK47FerhrMmlpGQng5bks-FYEohUXRySn-dQMDSXqYOoqULQZQCKhvpH9Q/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('responseMessage').innerText = 'Dziękujemy za zapisanie się!';
    })
    .catch(error => {
        document.getElementById('responseMessage').innerText = 'Wystąpił błąd: ' + error.message;
    });
});