const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    console.log("Usuario en localStorage:", JSON.stringify(user.user));
}else{
    alert("Inicia Sesión primero")
    window.location.href = "../index.html";
}
const URL = "http://localhost:8009/carrito";

let totalCarrito = 0;
const carritoContainer = document.getElementById("carrito-container")

document.getElementById("confirmar-compra").addEventListener("click", async function(){
    const productos = [];
    const items = carritoContainer.querySelectorAll(".producto-card-info h2");
    items.forEach((item) => {
        productos.push(item.textContent);
    });
    const historialData = {
        id_usuario: user.user.id,
        productos: JSON.stringify(productos),
        total: totalCarrito,
    };
    try {
        const response = await fetch("http://localhost:8009/historial", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(historialData),
        });

        if (response.ok) {
            console.log("Historial actualizado con éxito");
        } else {
            console.error("Error al actualizar el historial");
        }
    } catch (error) {
        console.error("Error en la solicitud al historial:", error);
        return; 
    }
    fetch(URL + "/usuario/" + user.user.id, {
        method: "DELETE",
    })
        .then((response) => {
            if (response.ok) {
                console.log("Has comprado los productos");
                location.reload();
            } else {
                console.error("Error al eliminar productos");
            }
        })
        .catch((error) => console.error("Error al eliminar productos:", error));
})

function EliminarProducto(id){
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        fetch(URL + "/" + id, {
            method: "DELETE"
        })
        .then((response) => {
            if (response.ok) {
                console.log("Producto eliminado");
                location.reload();
            } else {
                console.log("Error al eliminar producto");
            }
        })
        .catch((error) => console.error("Error al eliminar producto:", error));
    } else {
        console.log("El usuario canceló la compra.");
    }
}
const showCarrito = (dataCarrito) => {
    dataCarrito.forEach((producto) => {
        const totalCarritoText = document.getElementById("total-carrito");
        totalCarrito+=producto.precio
        totalCarritoText.textContent = "Precio total a pagar: "+totalCarrito+"$"
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



        CardInfo.append(Nombre, Precio)

        const CardActions = document.createElement("div");
        CardActions.classList.add("producto-card-actions");

        const DeleteButton = document.createElement("button");
        DeleteButton.classList.add("delete-button")
        DeleteButton.addEventListener("click", function (event) {
            event.preventDefault();
            EliminarProducto(producto.id); 
        });

        CardActions.append(DeleteButton)
        productoCard.append(ImageContainer, CardInfo, CardActions)
        carritoContainer.append(productoCard)
    })
}
fetch(URL+"/"+user.user.id)
.then(response => response.json())
.then(showCarrito)
.catch((error) => console.error(error))