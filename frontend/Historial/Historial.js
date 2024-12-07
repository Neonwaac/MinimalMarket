const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    console.log("Usuario en localStorage:", JSON.stringify(user.user));
    document.getElementById("history-from").textContent = user.user.username;
}else{
    alert("Inicia Sesión primero")
    window.location.href = "../index.html";
}

const URL = "http://localhost:8009/historial/usuario"
const historialContainer = document.getElementById("historial-container");

const showHistorial = (dataHistorial) =>{
    dataHistorial.forEach(historial => {
        const historialLog = document.createElement("div");
        historialLog.classList.add("historial-log");

        const historialFecha = document.createElement("p");
        historialFecha.classList.add("historial-fecha")
        const fecha = new Date(historial.timestamp);
        const dia = fecha.getDate()
        const mes = fecha.getMonth()+1;
        const anio = fecha.getFullYear();
        const horas = (fecha.getHours()<12)?"0"+fecha.getHours():fecha.getHours();
        const minutos = (fecha.getMinutes()<10)?"0"+fecha.getMinutes():fecha.getMinutes();
        const parsedFecha = "El "+dia+"/"+mes+"/"+anio+" a las "+horas+":"+minutos;
        historialFecha.textContent = parsedFecha

        const historialInfo = document.createElement("div");
        historialInfo.classList.add("historial-info")
        const historialList= document.createElement("p");
        const productosArray = JSON.parse(historial.productos);
        const textoProductos = productosArray.join(" / ");
        const textList = `Realizaste la compra de: ${textoProductos}`;
        historialList.textContent = textList;
        const historialTotal = document.createElement("h2");
        historialTotal.textContent = "Por un total de: "+historial.total+"$";

        historialInfo.append(historialList, historialTotal)
        historialLog.append(historialFecha, historialInfo)

        historialContainer.append(historialLog)

    })
}

fetch(URL+"/"+user.user.id)
.then(response => response.json())
.then(showHistorial)
.catch((error) => console.error(error))