// Pobranie referencji do elementów
const submitButton = document.getElementById("button"); // Przycisk wysyłania formularza
const responseMessage = document.getElementById("responseMessage"); // Komunikat odpowiedzi

// Nasłuchiwanie zdarzenia kliknięcia przycisku wysyłania
submitButton.addEventListener('click', handleSubmit);

// Funkcja obsługująca wysłanie formularza
async function handleSubmit(event) {
    event.preventDefault(); // Zatrzymuje domyślne zachowanie wysyłania formularza

    const emailInput = document.getElementById("emailaddress"); // Pobranie pola adresu email z formularza
    const email = emailInput.value.trim(); // Pobranie wartości adresu email i usunięcie zbędnych białych znaków

    if (!isEmailCorrectFormat(email)) {
        return; // Zakończenie funkcji, jeśli format adresu email jest niepoprawny
    }

    // Bazowy URL API HubSpot
    const base_url = "https://api.hsforms.com/submissions/v3/integration/submit";
    const portal_id = "144715652"; // ID Twojego portalu HubSpot
    const form_id = "af2a733d-8790-4d20-b8fa-49571aa6c6ff"; // ID Twojego formularza HubSpot

    // Konstrukcja URL do wysłania żądania
    const request_url = `${base_url}/${portal_id}/${form_id}`;

    // Przygotowanie ciała żądania
    const body = {
        submittedAt: new Date().getTime(), // Dodanie czasu wysłania formularza
        fields: [
            {
                objectTypeId: "0-1", // Typ obiektu (dla adresu email)
                name: "email", // Nazwa pola (adres email)
                value: email // Wartość (adres email wpisany przez użytkownika)
            }
        ]
    };

    try {
        const response = await fetch(request_url, {
            method: 'POST', // Metoda POST do wysłania danych
            mode: 'cors', // Tryb cors dla żądania
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json' // Ustawienie typu treści na JSON
            },
            body: JSON.stringify(body) // Przekształcenie ciała żądania na format JSON
        });

        if (response.ok) {
            // Jeśli wysyłka jest udana, wyczyść formularz i pokaż komunikat o sukcesie
            emailInput.value = ''; // Wyczyść pole adresu email
            showSuccessMessage(); // Wywołaj funkcję pokazującą komunikat o sukcesie
        } else {
            console.error('Błąd wysyłki:', response.statusText); // Wyświetlenie błędu w konsoli, jeśli wysyłka nie powiedzie się
        }
    } catch (error) {
        console.error('Błąd:', error); // Obsługa błędu związana z żądaniem fetch
    }
}

// Funkcja sprawdzająca poprawność formatu adresu email
function isEmailCorrectFormat(email) {
    const regex = /^[^@]+@\w+(\.\w+)+\w$/; // Wyrażenie regularne do walidacji adresu email
    return regex.test(email); // Zwrócenie true, jeśli email jest poprawny, w przeciwnym razie false
}

// Funkcja pokazująca komunikat o sukcesie
function showSuccessMessage() {
    responseMessage.classList.add("opacity-75", "-translate-y-16"); // Dodanie klas CSS dla animacji pokazania komunikatu
    setTimeout(() => {
        responseMessage.classList.remove("opacity-75", "-translate-y-16"); // Usunięcie klas CSS po 3 sekundach
    }, 3000);
}