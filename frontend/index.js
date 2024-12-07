let hasAccount = true;

document.getElementById("form-method").addEventListener("click", function () {
    let formTitle = document.getElementById("form-title");
    let formButton = document.getElementById("form-button");
    let formParaph = document.getElementById("form-paraph");

    if (hasAccount) {
        formTitle.textContent = "Regístrate";
        formButton.textContent = "Registrarse";
        formParaph.textContent = "¿Ya tienes una cuenta?";
        this.textContent = "Inicia Sesión";
        hasAccount = false;
    } else {
        formTitle.textContent = "Inicia Sesión";
        formButton.textContent = "Iniciar Sesión";
        formParaph.textContent = "¿No tienes una cuenta?";
        this.textContent = "Regístrate";
        hasAccount = true;
    }
});

document.getElementById("variable-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;
    const URL = hasAccount ? "http://localhost:8009/login" : "http://localhost:8009/usuarios";

    fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.error || "Error desconocido");
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log("Respuesta del servidor:", data);
            if (!hasAccount) { 
                alert("Registro exitoso, ahora inicia sesión");
            } else {
                alert("Inicio de sesión exitoso");
                localStorage.setItem("user", JSON.stringify(data));
                window.location.href = "./HomePage/HomePage.html";
            }
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });
});


