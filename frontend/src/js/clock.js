function actualizarFechaHora() {

    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const hora = ahora.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    document.getElementById("fecha").textContent = fecha;
    document.getElementById("hora").textContent = hora;
}

actualizarFechaHora();

setInterval(actualizarFechaHora, 1000);
