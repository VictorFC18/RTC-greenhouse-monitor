// ==========================================
// Historial RTC
// ==========================================

const LIMITE_REGISTROS = 20;

let paginaActual = 1;

let totalRegistros = 0;

let fechaDesde = null;

let fechaHasta = null;

// ==========================================
// Obtener registros
// ==========================================

async function obtenerRegistros(pagina) {

    try {

        const parametros =
            new URLSearchParams({

                pagina: pagina,

                limite: LIMITE_REGISTROS

            });


        if (fechaDesde) {

            parametros.append(
                "desde",
                fechaDesde
            );

        }


        if (fechaHasta) {

            parametros.append(
                "hasta",
                fechaHasta
            );

        }


        const respuesta = await fetch(

            `/api/registros?${parametros.toString()}`

        );


        if (!respuesta.ok) {

            throw new Error(
                "Error consultando registros"
            );

        }


        return await respuesta.json();

    }

    catch (error) {

        console.error(error);

        return {

            registros: [],

            total: 0,

            resumen: {}

        };

    }

}

// ==========================================
// Formatear fecha
// ==========================================

function formatearFecha(timestamp) {

    const fecha = new Date(timestamp);


    return fecha.toLocaleString(
        "es-PE",
        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit"

        }

    );

}


// ==========================================
// Mostrar tabla
// ==========================================

function mostrarRegistros(registros) {

    const tabla = document.getElementById(
        "history-table-body"
    );


    tabla.innerHTML = "";


    if (registros.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td colspan="6">

                    No hay registros disponibles

                </td>

            </tr>

        `;

        return;

    }


    registros.forEach(registro => {

        const fila = document.createElement("tr");


        const tds = (
            registro.tds !== null
            &&
            registro.tds !== undefined
        )

            ? `${Number(registro.tds).toFixed(1)} ppm`

            : "--";


        fila.innerHTML = `

            <td>
                ${formatearFecha(registro.timestamp)}
            </td>

            <td>
                ${Number(registro.temperatura).toFixed(1)} °C
            </td>

            <td>
                ${Number(registro.humedad_aire).toFixed(1)} %
            </td>

            <td>
                ${registro.humedad_suelo} %
            </td>

            <td>
                ${Number(registro.ph).toFixed(2)}
            </td>

            <td>
                ${tds}
            </td>

        `;


        tabla.appendChild(fila);

    });

}


// ==========================================
// Actualizar paginación
// ==========================================

function actualizarPaginacion() {

    const totalPaginas = Math.ceil(
        totalRegistros / LIMITE_REGISTROS
    );


    document.getElementById(
        "page-info"
    ).textContent =

        `Página ${paginaActual} de ${totalPaginas}`;


    document.getElementById(
        "previous-page"
    ).disabled =

        paginaActual <= 1;


    document.getElementById(
        "next-page"
    ).disabled =

        paginaActual >= totalPaginas;

}


// ==========================================
// Cargar historial
// ==========================================

async function cargarHistorial() {

    const resultado = await obtenerRegistros(
        paginaActual
    );


    totalRegistros = resultado.total;


    mostrarRegistros(
        resultado.registros
    );

    actualizarResumen(resultado);

    actualizarPaginacion();

}


// ==========================================
// Página anterior
// ==========================================

document.getElementById(
    "previous-page"
).addEventListener(
    "click",
    () => {

        if (paginaActual > 1) {

            paginaActual--;

            cargarHistorial();

        }

    }
);


// ==========================================
// Página siguiente
// ==========================================

document.getElementById(
    "next-page"
).addEventListener(
    "click",
    () => {

        const totalPaginas = Math.ceil(
            totalRegistros / LIMITE_REGISTROS
        );


        if (paginaActual < totalPaginas) {

            paginaActual++;

            cargarHistorial();

        }

    }
);

// ==========================================
// Filtros de periodo
// ==========================================

const periodFilter =
    document.getElementById("period-filter");

const filterMessage =
    document.getElementById("filter-message");

const dateFrom =
    document.getElementById("date-from");

const dateTo =
    document.getElementById("date-to");

const applyFilters =
    document.getElementById("apply-filters");

const exportCSV =
    document.getElementById("export-csv");

// ==========================================
// Formatear fecha para API
// ==========================================

function formatearFechaAPI(fecha) {

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");

    const hora =
        String(
            fecha.getHours()
        ).padStart(2, "0");

    const minuto =
        String(
            fecha.getMinutes()
        ).padStart(2, "0");

    const segundo =
        String(
            fecha.getSeconds()
        ).padStart(2, "0");


    return (
        `${anio}-${mes}-${dia} ` +
        `${hora}:${minuto}:${segundo}`
    );

}


// ==========================================
// Estado campos personalizados
// ==========================================

function actualizarCamposFecha() {

    const personalizado =
        periodFilter.value === "custom";


    dateFrom.disabled =
        !personalizado;

    dateTo.disabled =
        !personalizado;

}

// ==========================================
// Aplicar filtros
// ==========================================

async function aplicarFiltros() {

    filterMessage.textContent = "";

    const periodo =
        periodFilter.value;

    const ahora =
        new Date();

    let desde = null;

    let hasta = null;


    if (periodo === "hour") {

        desde = new Date(
            ahora.getTime()
            - 60 * 60 * 1000
        );

        hasta = ahora;

    }


    else if (periodo === "today") {

        desde = new Date(ahora);

        desde.setHours(
            0,
            0,
            0,
            0
        );

        hasta = ahora;

    }


    else if (periodo === "week") {

        desde = new Date(
            ahora.getTime()
            - 7 * 24 * 60 * 60 * 1000
        );

        hasta = ahora;

    }


    else if (periodo === "all") {

        desde = null;

        hasta = null;

    }


    else if (periodo === "custom") {

        if (
            !dateFrom.value
            ||
            !dateTo.value
        ) {

            filterMessage.textContent =
                "Selecciona una fecha inicial y una fecha final.";

            return;

        }


        desde =
            new Date(dateFrom.value);

        hasta =
            new Date(dateTo.value);


        if (desde > hasta) {

            filterMessage.textContent =
                "La fecha inicial no puede ser posterior a la fecha final.";

            return;

        }

    }


    fechaDesde = desde

        ? formatearFechaAPI(desde)

        : null;


    fechaHasta = hasta

        ? formatearFechaAPI(hasta)

        : null;


    paginaActual = 1;


    await cargarHistorial();

}

// ==========================================
// Eventos filtros
// ==========================================

periodFilter.addEventListener(
    "change",
    actualizarCamposFecha
);


applyFilters.addEventListener(
    "click",
    aplicarFiltros
);

// ==========================================
// Exportar CSV
// ==========================================

function exportarCSV() {

    const parametros =
        new URLSearchParams();


    if (fechaDesde) {

        parametros.append(
            "desde",
            fechaDesde
        );

    }


    if (fechaHasta) {

        parametros.append(
            "hasta",
            fechaHasta
        );

    }


    let url =
        "/api/exportar-csv";


    const query =
        parametros.toString();


    if (query) {

        url += `?${query}`;

    }


    window.location.href = url;

}

exportCSV.addEventListener(
    "click",
    exportarCSV
);
// ==========================================
// Inicio
// ==========================================

actualizarCamposFecha();

aplicarFiltros();

// ==========================================
// Actualizar resumen
// ==========================================

function actualizarResumen(resultado) {

    const resumen =
        resultado.resumen || {};


    document.getElementById(
        "summary-records"
    ).textContent =

        resultado.total ?? 0;


    document.getElementById(
        "summary-temp"
    ).textContent =

        resumen.temperatura_promedio != null

            ? Number(
                resumen.temperatura_promedio
            ).toFixed(1)

            : "--";


    document.getElementById(
        "summary-humidity"
    ).textContent =

        resumen.humedad_promedio != null

            ? Number(
                resumen.humedad_promedio
            ).toFixed(1)

            : "--";


    document.getElementById(
        "summary-tds"
    ).textContent =

        resumen.tds_promedio != null

            ? Number(
                resumen.tds_promedio
            ).toFixed(1)

            : "--";

}
