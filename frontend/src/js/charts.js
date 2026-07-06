// ==========================================
// Gráfico general
// ==========================================

const ctx =
    document.getElementById("generalChart");

const generalChart =
    new Chart(ctx, {

        type: "line",

        data: {

            labels: [

                "00","10","20","30","40","50","60"

            ],

            datasets: [

                {
                    label: "Temperatura",

                    data: [28,29,28.5,30,31,30,29],

                    yAxisID: "yTemp",

                    borderWidth: 2,

                    borderColor: "#EF4444",

                    backgroundColor: "rgba(239,68,68,.05)",

                    fill: true,

                    tension: .45,

                    pointRadius: 0,

                    pointHoverRadius: 5

                },

                {
                    label: "Humedad aire",

                    data: [61,60,63,64,62,61,60],

                    yAxisID: "yHum",

                    borderWidth: 2,

                    borderColor: "#3B82F6",

                    backgroundColor: "rgba(59,130,246,.05)",

                    fill: true,

                    tension: .45,

                    pointRadius: 0,

                    pointHoverRadius: 5

                },

                {
                    label: "Humedad suelo",

                    data: [58,59,60,62,63,61,62],

                    yAxisID: "yHum",

                    borderWidth: 2,

                    borderColor: "#22C55E",

                    backgroundColor: "rgba(34,197,94,.05)",

                    fill: true,

                    tension: .45,

                    pointRadius: 0,

                    pointHoverRadius: 5

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,
            
            animation: false,

            interaction: {

                mode: "index",

                intersect: false

            },

			plugins: {

			    legend: {

			        position: "bottom"

			    },

			    tooltip: {

			        backgroundColor: "#1F2937",

			        titleColor: "#FFFFFF",

			        bodyColor: "#FFFFFF",

			        borderColor: "#374151",

			        borderWidth: 1,

			        padding: 12,

			        cornerRadius: 10,

			        displayColors: true,

			        callbacks: {

			        title: function(context){

			            const indice = context[0].dataIndex;

			            const timestamp =
			                generalChart.historial[indice].timestamp;

			            const fecha =
			                new Date(timestamp);

			            const meses = [

			                "Ene.","Feb.","Mar.","Abr.",
			                "May.","Jun.","Jul.","Ago.",
			                "Sep.","Oct.","Nov.","Dic."

			            ];

			            const dia =
			                String(fecha.getDate()).padStart(2,"0");

			            const mes =
			                meses[fecha.getMonth()];

			            const anio =
			                fecha.getFullYear();

			            const hora =
			                fecha.toTimeString().substring(0,8);

			            return [

			                `🕒 ${dia} ${mes} ${anio}`,

			                hora

			            ];

			        },

			            label: function(context){

			                const valor = context.parsed.y;

			                if(context.dataset.label === "Temperatura"){

			                    return `🌡 ${context.dataset.label}: ${valor.toFixed(1)} °C`;

			                }

							if(context.dataset.label === "Humedad aire"){

							    return `💧 Humedad aire: ${valor.toFixed(1)} %`;

							}

							if(context.dataset.label === "Humedad suelo"){

							    return `🌱 Humedad suelo: ${valor.toFixed(1)} %`;

							}

			            }

			        }

			    }

			},

            scales: {

            	x: {
            	
            	    ticks: {
            	
            	        autoSkip: true,
            	
            	        maxTicksLimit: 8,
            	
            	        maxRotation: 45,
            	
            	        minRotation: 45
            	
            	    },
            	
            	    grid: {
            	
            	        color: "rgba(148,163,184,.08)"
            	
            	    }
            	
            	},

                yTemp: {

                    type: "linear",

                    position: "left",

                    title: {

                        display: true,

                        text: "Temperatura (°C)"

                    },

                    ticks: {
                    
                        stepSize: 0.2
                    
                    },

                    grid:{
                    
                        color:"rgba(148,163,184,.08)"
                    
                    }

                },

                yHum: {

                    type: "linear",

                    position: "right",

                    min: 0,

                    max: 100,

                    title: {

                        display: true,

                        text: "Humedad (%)"

                    },

                    grid: {

                        drawOnChartArea: false
                        

                    }

                }

            }

        }

    });


// ==========================================
// Gráfico de pH
// ==========================================

const phCtx =
    document.getElementById("phChart");

//==========================================
// Fondo de zonas de pH
//==========================================

const phZones = {

    id: "phZones",

    beforeDraw(chart){

        const {ctx, chartArea, scales} = chart;

        if(!chartArea) return;

        const y = scales.y;

        function pintar(desde, hasta, color){

            const y1 = y.getPixelForValue(desde);

            const y2 = y.getPixelForValue(hasta);

            ctx.save();

            ctx.fillStyle = color;

            ctx.fillRect(

                chartArea.left,

                y1,

                chartArea.right-chartArea.left,

                y2-y1

            );

            ctx.restore();

        }

        // Alcalino

        pintar(

            8.0,

            7.5,

            "rgba(239,68,68,.08)"

        );

        // Óptimo

        pintar(

            7.5,

            6.0,

            "rgba(34,197,94,.10)"

        );

        // Ácido

        pintar(

            6.0,

            4.0,

            "rgba(245,158,11,.08)"

        );

        ctx.save();
        
        ctx.strokeStyle = "rgba(34,197,94,.55)";
        ctx.lineWidth = 2;
        
        const ySuperior =
            y.getPixelForValue(7.5);
        
        const yInferior =
            y.getPixelForValue(6.0);
        
        // Línea superior
        
        ctx.beginPath();
        
        ctx.moveTo(chartArea.left, ySuperior);
        
        ctx.lineTo(chartArea.right, ySuperior);
        
        ctx.stroke();
        
        // Línea inferior
        
        ctx.beginPath();
        
        ctx.moveTo(chartArea.left, yInferior);
        
        ctx.lineTo(chartArea.right, yInferior);
        
        ctx.stroke();
        
        ctx.restore();

        ctx.save();
        
        ctx.font = "11px sans-serif";
        
        ctx.fillStyle = "#64748B";
        
        ctx.textAlign = "right";
        
        ctx.fillText(
        
            "Alcalino",
        
            chartArea.right - 8,
        
            y.getPixelForValue(7.75)
        
        );
        
        ctx.fillText(
        
            "Óptimo",
        
            chartArea.right - 8,
        
            y.getPixelForValue(6.75)
        
        );
        
        ctx.fillText(
        
            "Ácido",
        
            chartArea.right - 8,
        
            y.getPixelForValue(5.0)
        
        );
        
        ctx.restore();

    }


};

const phChart =
    new Chart(phCtx, {

        type: "line",

        data: {

            labels: [],

            datasets: [

                {

                    label: "pH",

                    data: [],

                    borderColor: "#8B5CF6",

                    backgroundColor: "rgba(139,92,246,.05)",

                    borderWidth: 2,

                    fill: true,

                    tension: .45,

                    pointRadius: 0,

                    pointHoverRadius: 5

                }

            ]

        },

        plugins: [
        
            phZones
        
        ],

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    ticks: {

                        autoSkip: true,

                        maxTicksLimit: 5

                    },

                    grid: {

                        color: "rgba(148,163,184,.08)"

                    }

                },

                y: {

                    min: 4,

                    max: 8,

                    title: {

                        display: true,

                        text: "pH"

                    },

                    ticks: {

                        stepSize: 0.5

                    },

                    grid: {

                        color: "rgba(148,163,184,.08)"

                    }

                }

            }

        }

    });

// ==========================================
// Gráfico TDS
// ==========================================

const ctxTDS =
    document.getElementById("ecChart");


const tdsChart =
    new Chart(ctxTDS, {

        type: "line",

        data: {

            labels: [],

            datasets: [

                {
                    label: "TDS",

                    data: [],

                    borderWidth: 2,

                    borderColor: "#8B5CF6",

                    backgroundColor:
                        "rgba(139,92,246,.08)",

                    fill: true,

                    tension: .35,

                    pointRadius: 0,

                    pointHoverRadius: 5

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                mode: "index",

                intersect: false

            },

            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    displayColors: false,

                    callbacks: {

                        title: function(context) {

                            const timestamp =
                                context[0].raw.timestamp;

                            const fecha =
                                new Date(timestamp);

                            const dia =
                                String(
                                    fecha.getDate()
                                ).padStart(2, "0");

                            const meses = [

                                "Ene", "Feb", "Mar",
                                "Abr", "May", "Jun",
                                "Jul", "Ago", "Sep",
                                "Oct", "Nov", "Dic"

                            ];

                            const mes =
                                meses[fecha.getMonth()];

                            const anio =
                                fecha.getFullYear();

                            return `🕒 ${dia} ${mes}. ${anio}`;

                        },


                        label: function(context) {

                            const timestamp =
                                context.raw.timestamp;

                            const fecha =
                                new Date(timestamp);

                            const hora =
                                fecha.toLocaleTimeString(
                                    "es-PE",
                                    {
                                        hour12: false
                                    }
                                );

                            return [
                                hora,
                                "",
                                `TDS: ${context.parsed.y.toFixed(1)} ppm`
                            ];

                        }

                    }

                }

            },


            scales: {

                x: {

                    grid: {

                        display: false

                    },

                    ticks: {

                        maxTicksLimit: 6

                    }

                },


                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text: "TDS (ppm)"

                    },

                    grid: {

                        color:
                            "rgba(148,163,184,.08)"

                    }

                }

            }

        }

    });

//==========================================
// Actualizar gráfico
//==========================================

function actualizarGrafico(historial){

    const horas =
        historial.map(m =>

            m.timestamp.substring(11,19)

        );

    const temperatura =
        historial.map(m =>

            m.temperatura

        );

    const humedadAire =
        historial.map(m =>

            m.humedad_aire

        );

    const humedadSuelo =
        historial.map(m =>

            m.humedad_suelo

        );


    generalChart.data.labels =
        horas;

    generalChart.data.datasets[0].data =
        temperatura;

    generalChart.data.datasets[1].data =
        humedadAire;

    generalChart.data.datasets[2].data =
        humedadSuelo;


    const tempMin =
        Math.min(...temperatura);

    const tempMax =
        Math.max(...temperatura);


    generalChart.options.scales.yTemp.min =
        Math.floor(tempMin - 2);

    generalChart.options.scales.yTemp.max =
        Math.ceil(tempMax + 2);


    generalChart.update("none");

}


//==========================================
// Actualizar gráfico de pH
//==========================================

function actualizarGraficoPH(historial) {

    const registrosPH =
        historial.filter(m =>

            m.ph !== null &&
            m.ph !== undefined

        );


    const horas =
        registrosPH.map(m =>

            m.timestamp.substring(11, 19)

        );


    const datosPH =
        registrosPH.map(m => ({

            x: m.timestamp.substring(11, 19),

            y: m.ph,

            timestamp: m.timestamp

        }));


    phChart.data.labels =
        horas;

    phChart.data.datasets[0].data =
        datosPH;

    phChart.update("none");

}


// ==========================================
// Actualizar gráfico TDS
// ==========================================

function actualizarGraficoTDS(historial) {

    const registrosTDS =
        historial.filter(m =>

            m.tds !== null &&
            m.tds !== undefined

        );


    const horas =
        registrosTDS.map(m =>

            m.timestamp.substring(11, 19)

        );


    const datosTDS =
        registrosTDS.map(m => ({

            x: m.timestamp.substring(11, 19),

            y: m.tds,

            timestamp: m.timestamp

        }));


    tdsChart.data.labels =
        horas;

    tdsChart.data.datasets[0].data =
        datosTDS;

    tdsChart.update("none");

}

// ==========================================
// Actualizar todos los gráficos
// ==========================================

async function actualizarGraficos() {

    const historial =
        await obtenerHistorial();


    if(historial.length === 0)
        return;


    historial.reverse();


    actualizarGrafico(historial);

    actualizarGraficoPH(historial);

    actualizarGraficoTDS(historial);

}

actualizarGraficos();

setInterval(

    actualizarGraficos,

    1000

);


