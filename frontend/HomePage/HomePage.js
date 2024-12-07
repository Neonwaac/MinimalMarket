const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    console.log("Usuario en localStorage:", JSON.stringify(user.user));
    document.getElementById("welcome-to").textContent = user.user.username;
}else{
    alert("Inicia Sesión primero")
    window.location.href = "../index.html";
}


const URL = "http://localhost:8009/productos"

const productosContainer = document.getElementById("productos-container");

function AgregarAlCarrito(productoID) {
    const add = {
        id_usuario: user.user.id,
        id_producto: productoID
    };
    fetch("http://localhost:8009/carrito",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(add)
    })
    .then(response => {
        if (response.ok) {
            alert("Prdocuto agregado al carrito")
        }else{
            alert("Error al agregar producto")
        }
    })
}
const showProductos = (dataProductos) => {
    dataProductos.forEach((producto) => {
        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");

        const ImageContainer = document.createElement("div");
        ImageContainer.classList.add("producto-card-image");

        const Image = document.createElement("img");
        Image.src = producto.foto;

        ImageContainer.append(Image);

        const CardInfo = document.createElement("div");
        CardInfo.classList.add("producto-card-info");

        const Nombre = document.createElement("h2");
        Nombre.textContent = producto.nombre;

        const Precio = document.createElement("h3");
        Precio.textContent = producto.precio+"$";

        const Stock = document.createElement("h4");
        Stock.textContent = producto.stock+" unidades disponibles";

        CardInfo.append(Nombre, Precio, Stock)

        const CardActions = document.createElement("div");
        CardActions.classList.add("producto-card-actions");

        const AddButton = document.createElement("button");
        AddButton.classList.add("producto-button")
        AddButton.addEventListener("click", function (event) {
            event.preventDefault();
            AgregarAlCarrito(producto.id); 
        });

        const ActionsText = document.createElement("p");
        ActionsText.textContent = "Agregar al carrito";

        CardActions.append(AddButton, ActionsText)
        productoCard.append(ImageContainer, CardInfo, CardActions)

        productosContainer.append(productoCard)
    })
}

fetch(URL)
.then(response => response.json())
.then(showProductos)
.catch((error) => console.error(error))