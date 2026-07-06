// =====================================
// API - Sistema RTC
// =====================================

async function obtenerUltimaMedicion() {

    try {

        const respuesta = await fetch("/mediciones");

        if (!respuesta.ok) {
            throw new Error("Error consultando la API");
        }

        const datos = await respuesta.json();

        if (datos.length === 0) {
            return null;
        }

        return datos[0];

    } catch (error) {

        console.error(error);

        return null;

    }

}

// =====================================
// Historial
// =====================================

async function obtenerHistorial() {

    try {

        const respuesta = await fetch("/historial");

        if (!respuesta.ok) {

            throw new Error("Error consultando historial");

        }

        return await respuesta.json();

    }

    catch(error){

        console.error(error);

        return [];

    }

}
