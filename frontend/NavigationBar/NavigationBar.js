function switchPage(string){
    let url;
    switch(string){
        case "home":
            url = "../HomePage/HomePage.html";
            break;
        case "carrito":
            url = "../Carrito/Carrito.html";
            break;
        case "historial":
            url =  "../Historial/Historial.html";
            break;
    }
    window.location.href = url;
}
function LogOut(){
    localStorage.removeItem("user");
    alert("Has cerrado sesión")
    window.location.href = "../index.html"
}