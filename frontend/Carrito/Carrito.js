const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Inicia Sesión primero");
    window.location.href = "../index.html";
}

const URL = "http://localhost:8009/carrito";
let totalCarrito = 0;
const carritoContainer = document.getElementById("carrito-container");

document.getElementById("confirmar-compra").addEventListener("click", async function () {
    const productos = [];
    const items = carritoContainer.querySelectorAll(".producto-card-info h2");
    items.forEach((item) => {
        productos.push(item.textContent);
    });

    if (productos.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de confirmar.");
        return;
    }

    const historialData = {
        id_usuario: user.user.id,
        productos: JSON.stringify(productos),
        total: totalCarrito,
    };

    try {
        // Eliminar productos del carrito
        const deleteResponse = await fetch(`${URL}/usuario/${user.user.id}`, {
            method: "DELETE",
        });

        if (!deleteResponse.ok) {
            console.error("Error al eliminar productos del carrito:", deleteResponse.statusText);
            alert("No se pudo vaciar el carrito. Intenta nuevamente.");
            return;
        }
        console.log("Productos eliminados del carrito.");

        // Agregar datos al historial
        const historialResponse = await fetch("http://localhost:8009/historial", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(historialData),
        });

        if (!historialResponse.ok) {
            console.error("Error al actualizar el historial:", historialResponse.statusText);
            alert("No se pudo actualizar el historial. Intenta nuevamente.");
            return;
        }

        console.log("Historial actualizado con éxito.");
        alert("Compra confirmada y historial actualizado.");
        location.reload();
    } catch (error) {
        console.error("Error en el proceso de confirmación de compra:", error);
        alert("Ocurrió un error durante la compra. Intenta nuevamente.");
    }
});

function EliminarProducto(id) {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        fetch(`${URL}/${id}`, { method: "DELETE" })
            .then((response) => {
                if (response.ok) {
                    console.log("Producto eliminado");
                    location.reload();
                } else {
                    console.error("Error al eliminar producto:", response.statusText);
                    alert("No se pudo eliminar el producto. Intenta nuevamente.");
                }
            })
            .catch((error) => console.error("Error al eliminar producto:", error));
    } else {
        console.log("El usuario canceló la eliminación.");
    }
}

const showCarrito = (dataCarrito) => {
    const totalCarritoText = document.getElementById("total-carrito");
    carritoContainer.innerHTML = ""; // Limpia el contenedor antes de agregar productos
    totalCarrito = 0;

    dataCarrito.forEach((producto) => {
        totalCarrito += producto.precio;
        totalCarritoText.textContent = `Precio total a pagar: ${totalCarrito}$`;

        const productoCard = document.createElement("div");
        productoCard.classList.add("producto-card");

        const imageContainer = document.createElement("div");
        imageContainer.classList.add("producto-card-image");

        const image = document.createElement("img");
        image.src = producto.foto;

        imageContainer.append(image);

        const cardInfo = document.createElement("div");
        cardInfo.classList.add("producto-card-info");

        const nombre = document.createElement("h2");
        nombre.textContent = producto.nombre;

        const precio = document.createElement("h3");
        precio.textContent = `${producto.precio}$`;

        cardInfo.append(nombre, precio);

        const cardActions = document.createElement("div");
        cardActions.classList.add("producto-card-actions");

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", (event) => {
            event.preventDefault();
            EliminarProducto(producto.id);
        });

        cardActions.append(deleteButton);
        productoCard.append(imageContainer, cardInfo, cardActions);
        carritoContainer.append(productoCard);
    });
};

// Carga inicial del carrito
fetch(`${URL}/${user.user.id}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error al obtener el carrito: ${response.statusText}`);
        }
        return response.json();
    })
    .then(showCarrito)
    .catch((error) => console.error("Error al cargar el carrito:", error));
