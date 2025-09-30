$(document).ready(function() {
    verOrdenes();
    setInterval(function() {
        if ($('#carritoContenido ul').length === 0) {
            verOrdenes();
            seleccionarOrdenesAgregadas();
        } else {
            console.log("Carrito tiene contenido, no se hace la consulta.");
              seleccionarOrdenesAgregadas();
        }
    }, 5000);
});

function verModalOrdenes(){
    verOrdenesRestantes();
    new bootstrap.Modal(document.getElementById("ordenesModal")).show();
}

function reproducirSonido() {
    let sonido = new Audio("images/BELL1.mp3");
    sonido.play().catch(e => console.log(e));
}

function verOrdenes() {
    $.ajax({
        type: "GET",
        url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=SeleccionarOrdenes",
        contentType: false,
        processData: false,
        dataType: "json", // asegura que jQuery lo trate como JSON
        success: function (result) {
            if (JSON.stringify(result) != '[]') {
            // reproducirSonido();
            var ubicacion = "";
            var pagacon = "";
            var total = "";
            var cambio = "";
            // Si viene como string, lo parseamos
            let data = typeof result === 'string' ? JSON.parse(result) : result;
            // Contenedor donde se agregarán las cards
            let contenedor = $('#carritoContenido');
            contenedor.empty();
            // Agrupar por idorden si quieres separar pedidos
            let pedidos = {};
            data.forEach(item => {
                if (!pedidos[item.idorden]) pedidos[item.idorden] = [];
                pedidos[item.idorden].push(item);
            });
            // Crear cards por cada orden
            for (let idorden in pedidos) {
                let items = pedidos[idorden];
                let ul = $('<ul class="list-group mb-3"></ul>');
                items.forEach(item => {
                    let li = $('<li class="list-group-item" ></li>');
                    // Cabecera con nombre y cantidad
                    let header = $('<div class="d-flex justify-content-between align-items-center"></div>');
                    header.append(`<strong>${item.Producto}</strong>`);
                    header.append(`<span class="badge bg-info rounded-pill">(x${item.Cantidad})</span>`);
                    li.append(header);
                    // Ingredientes
                    if (item.Ingredientes && item.Ingredientes.trim() !== "") {
                        let ingredientesArray = item.Ingredientes.split(',').map(ing => ing.trim());
                        let ingredientesHTML = ingredientesArray.map(ing => `<span class="badge bg-success rounded-pill">${ing}</span>`).join(' ');
                        li.append(`Ingredientes: ${ingredientesHTML}<br>`);
                    }
                    // Opciones (condiciones)
                    //if (item.Opciones && item.Opciones.trim() !== "") {
                    //    let opcionesArray = item.Opciones.split(',').map(op => op.trim());
                    //    let opcionesHTML = opcionesArray.map(op => `<span class="badge bg-danger rounded-pill">${op}</span>`).join(' ');
                    //    li.append(`Condiciones: ${opcionesHTML}<br>`);
                    //}
                    if (item.Opciones && item.Opciones.trim() !== "") {
    let opcionesArray = item.Opciones.split(',').map(op => op.trim());
    let opcionesHTML = opcionesArray
        .map(op => `<span class="badge bg-danger rounded-pill">${op}</span>`)
        .join(' ');

    li.append(`Condiciones: ${opcionesHTML}<br>`);

    // Validar si NO contiene "sin papas"
    let tieneSinPapas = opcionesArray.some(op => op.toLowerCase() === "sin papas");

    if (!tieneSinPapas) {
        li.append(`<div class="bg-warning text-dark p-2 text-center">🍟<b> Con Papas </b>🍟</div>`);
    }
}

                    else{
                         li.append(`<div class="bg-warning text-dark p-2  text-center"><b>Con Papas</b></div>`);
                    }
                    ul.append(li);
                    ubicacion = item.ubicacion; // obtengo la ubicacion
                    pagacon = item.pagacon; // obtengo la ubicacion
                    total = item.total; // obtengo la ubicacion
                    cambio = item.cambio; // obtengo la ubicacion
                });
                contenedor.append(ul );
               
                let fecha = new Date(); // puede ser new Date() o un string convertido a Date
                // Obtener año, mes y día con ceros delante si hace falta
                let yyyy = fecha.getFullYear();
                let mm = String(fecha.getMonth() + 1).padStart(2, '0'); // getMonth() va de 0 a 11
                let dd = String(fecha.getDate()).padStart(2, '0');
                let fechaFormateada = `${yyyy}${mm}${dd}`;
                // Asignar al HTML
                document.getElementById("lblOrden").innerHTML = `#${idorden}-${yyyy}`;
                document.getElementById("lblUbicacion").innerHTML = `📍 ${ubicacion}`;
                document.getElementById("lblPagacon").value = `${pagacon}`;
                document.getElementById("lblTotal").value = `${total}`;
                document.getElementById("lblCambio").value = `${cambio.split('.')[0]}`;
                document.getElementById("tablaPago").style.display = "block";
            }
        } else {
                console.log("Imagen");
                document.getElementById("carritoContenido").innerHTML = `
                    <br><br><br>
                    <center><p>No hay órdenes</p>
                    <img src="images/completadas.webp" style="opacity:0.3" width="50%" class="img-fluid"><center
                `;
                document.getElementById("tablaPago").style.display = "none";
        }
        },
        error: function (jqXmlHttpRequest, textStatus, errorThrown) {
            setTimeout(function () { $("#loading").hide(); }, 1000);
            console.log("Error: "+errorThrown);
        }
    });
}

function terminarOrden(estatus){
    var id = document.getElementById("lblOrden").innerHTML.split('-');
    id = id[0].split('#')[1];
    console.log(id + " - " + estatus);
    $.ajax({
        type: "POST",
        url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=TerminarOrden",
        contentType: false,
        processData: false,
        data: JSON.stringify({ IdOrden: id, Estatus: estatus }), // 👈 aquí
        success: function (result) {
            console.log(result)
                document.getElementById("lblUbicacion").innerHTML = "";
                verOrdenes();
        $('#addProdMod').modal('hide');
        // ToastSuccess("Imagen actualizada");
        },
        error: function (jqXmlHttpRequest, textStatus, errorThrown) {
        setTimeout($("#loading").hide(), 1000);
        ToastWarning("Verifique su conexión");
        }
    });
}

function verOrdenesRestantes() {
    $.ajax({
        type: "GET",
        url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=SeleccionarOrdenesRestantes",
        contentType: false,
        processData: false,
        dataType: "json",
        success: function (result) {
            if (result && result.length > 0) {
                let raw = result[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];
                let data = JSON.parse(raw); // ahora sí tenemos un array de órdenes
                console.log("Órdenes parseadas:", data);
                if (data.length === 0) {
                    $('#ordenesRestantesContenidoModal').html(`
                        <br><br><br>
                        <center><p>No hay órdenes</p>
                        <img src="images/completadas.webp" style="opacity:0.3" width="50%" class="img-fluid"><center>
                    `);
                    return;
                }
                let carousel = `
                  <div id="ordenesCarousel" class="carousel slide" data-bs-ride="carousel">
                  <div class="carousel-inner">`;
                let isActive = true;
                data.forEach(orden => {
                    let ul = $('<ul class="list-group mb-3"></ul>');
                    orden.productos.forEach(prod => {
                        let li = $('<li class="list-group-item"></li>');
                        let header = $('<div class="d-flex justify-content-between align-items-center"></div>');
                        header.append(`<strong>${prod.Producto}</strong>`);
                        header.append(`<span class="badge bg-info rounded-pill">(x${prod.Cantidad})</span>`);
                        li.append(header);
                        if (prod.Ingredientes && prod.Ingredientes.trim() !== "") {
                            let ingredientesArray = prod.Ingredientes.split(',').map(ing => ing.trim());
                            let ingredientesHTML = ingredientesArray.map(ing => `<span class="badge bg-success rounded-pill">${ing}</span>`).join(' ');
                            li.append(`Ingredientes: ${ingredientesHTML}<br>`);
                        }
                        //if (prod.Opciones && prod.Opciones.trim() !== "") {
                        //    let opcionesArray = prod.Opciones.split(',').map(op => op.trim());
                        //    let opcionesHTML = opcionesArray.map(op => `<span class="badge bg-danger rounded-pill">${op}</span>`).join(' ');
                        //    li.append(`Condiciones: ${opcionesHTML}<br>`);
                        //}
                        if (item.Opciones && item.Opciones.trim() !== "") {
    let opcionesArray = item.Opciones.split(',').map(op => op.trim());
    let opcionesHTML = opcionesArray
        .map(op => `<span class="badge bg-danger rounded-pill">${op}</span>`)
        .join(' ');

    li.append(`Condiciones: ${opcionesHTML}<br>`);

    // Validar si NO contiene "sin papas"
    let tieneSinPapas = opcionesArray.some(op => op.toLowerCase() === "sin papas");

    if (!tieneSinPapas) {
        li.append(`<div class="bg-warning text-dark p-2 text-center">🍟<b> Con Papas </b>🍟</div>`);
    }
}

                        ul.append(li);
                    });
                    let ulHtml = $('<div>').append(ul).html();
                    carousel += `
                      <div class="carousel-item ${isActive ? 'active' : ''}">
                        <div class="card p-3">
                          <h5>Orden #${orden.idorden}</h5>
                          <p><strong>📍</strong> ${orden.ubicacion}</p>
                          ${ulHtml}
                        </div>
                      </div>`;
                    isActive = false;
                });
                carousel += `
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#ordenesCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="false"></span>
                    <span class="visually-hidden">Anterior</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#ordenesCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="false"></span>
                    <span class="visually-hidden">Siguiente</span>
                  </button>
                </div>
                <style>
                /* Sobrescribir icono next a negro */
                .carousel-control-next-icon {
                    background-image: url("data:image/svg+xml;charset=UTF8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='black' viewBox='0 0 8 8'%3E%3Cpath d='M2.5 0l-1.4 1.4 2.6 2.6-2.6 2.6 1.4 1.4 4-4-4-4z'/%3E%3C/svg%3E");
                }
                .carousel-control-prev-icon {
                    background-image: url("data:image/svg+xml;charset=UTF8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='black' viewBox='0 0 8 8'%3E%3Cpath d='M5.5 0l1.4 1.4-2.6 2.6 2.6 2.6-1.4 1.4-4-4 4-4z'/%3E%3C/svg%3E");
                }
                </style>
                `;

                // Insertar en el modal
                $('#ordenesRestantesContenidoModal').html(carousel);

            } else {
                $('#ordenesRestantesContenidoModal').html(`
                    <br><br><br>
                    <center><p>No hay órdenes</p>
                    <img src="images/completadas.webp" style="opacity:0.3" width="50%" class="img-fluid"><center>
                `);
            }
        },
        error: function (jqXmlHttpRequest, textStatus, errorThrown) {
            console.log("Error: " + errorThrown);
        }
    });
}

function seleccionarOrdenesAgregadas() {
    $.ajax({
        type: "GET",
        url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=SeleccionarOrdenesAgregadas",
        contentType: false,
        processData: false,
        dataType: "json",
        success: function (result) {
            if(result[0].idorden != null){
                reproducirSonido();
            }    
        },
        error: function (jqXmlHttpRequest, textStatus, errorThrown) {
            console.log("Error: " + errorThrown);
        }
    });
}
























          
