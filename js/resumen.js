

function verOrdenes() {
    var fecha = document.getElementById("txtFecha").value;
    $.ajax({
        type: "GET",
        url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=ConsultarVentasPorFecha&Fecha=" + fecha,
        contentType: false,
        processData: false,
        dataType: "json", // asegura que jQuery lo trate como JSON
        success: function (result) {
            if (JSON.stringify(result) != '[]') {
            let data = typeof result === 'string' ? JSON.parse(result) : result;
            let contenedor = $('#resumenVentas');
            contenedor.empty();
            let pedidos = {};
            var metodo = "";
            data.forEach(item => {
                if (!pedidos[item.idorden]) pedidos[item.idorden] = [];
                pedidos[item.idorden].push(item);
            });
            for (let idorden in pedidos) {
                let items = pedidos[idorden];
                let ul = $('<ul class="list-group "></ul>');
                items.forEach(item => {
                    let li = $('<li class="list-group-item" ></li>');
                    let header = $('<div class="d-flex justify-content-between align-items-center"></div>');
                    // separar productos por coma
                    let productos = item.productos.split(",");
                    var productoscad = "";
                    var preciocad = "";
                    productos.forEach(prod => {
                        // quitar espacios extra
                        let p = prod.trim();
                        p = p.split('|');
                        productoscad = productoscad + `${p[0]}<br>`;
                        preciocad = preciocad + `<b>$${p[1]}</span><b><br>`
                    });                          
                    if(item.metodopago == "transfer"){
                        metodo = "bg-info";
                    }
                    if(item.metodopago == "efectivo"){
                        metodo = "bg-danger";
                    }
                    li.append($(`<div><span class="badge ${metodo} rounded-pill">${item.idorden}</span>${item.ubicacion}</div>`));
                    header.append($(`<div>${productoscad}</div>`));
                    header.append($(`<div>${preciocad}</div>`));                          
                    li.append(header);
                    li.append($(`                         
                        <table style="width: 100%; margin: 0 auto; color: black; text-align: center;">
                            <tr>
                                <td style="text-align: left; font-weight: 500;">Paga: ${item.pagacon}</td>
                                <td style="text-align: center; font-weight: 500;">Cambio: ${item.cambio}</td>
                                <td style="text-align: right; font-weight: 700;">Total: $${item.total}</td>
                            </tr>
                        </table>
                    `));
                    ul.append(li);
                });
                contenedor.append(ul);
            }
    contenedor.append("<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>");
        } else {
                console.log("Imagen");
                document.getElementById("resumenVentas").innerHTML = `
                <br><br><br>
                    <center><p>No hay ventas</p>
                    <img src="images/completadas.webp" style="opacity:0.3" width="50%" class="img-fluid"><center
                `;
        }
        },
        error: function (jqXmlHttpRequest, textStatus, errorThrown) {
            setTimeout(function () { $("#loading").hide(); }, 1000);
            console.log("Error: "+errorThrown);
        }
    });
}

        // Ejecutar cada 5 segundos
$(document).ready(function() {
    let hoy = new Date();
    let yyyy = hoy.getFullYear();
    let mm = String(hoy.getMonth() + 1).padStart(2, '0'); // meses 0-11
    let dd = String(hoy.getDate()).padStart(2, '0');
    let fechaHoy = `${yyyy}-${mm}-${dd}`;
    $("#txtFecha").val(fechaHoy);
     // --- Ejecutar verOrdenes() cuando cambie ---
    $("#txtFecha").on("change", function () {
        verOrdenes();
        verResumen();
    });
    verOrdenes();
    verResumen();
});


function verResumen() {
    var fecha = document.getElementById("txtFecha").value;
    $.ajax({
        type: "GET",
        url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=ConsultarResumenPorFecha&Fecha=" + fecha,
        contentType: false,
        processData: false,
        dataType: "json", // asegura que jQuery lo trate como JSON
        success: function (result) {
            document.getElementById("lblCantidadOrden").innerHTML =  `📝 #${result[0].NumeroOrdenes}`;
            document.getElementById("btnTransfer").innerHTML =  `Transfer<br>$${result[0].TotalTransferencia}`;
            document.getElementById("btnEfectivo").innerHTML =  `Efectivo<br>$${result[0].TotalEfectivo}`;
            document.getElementById("btnTotal").innerHTML =  `Total<br>$${result[0].TotalGeneral}`;
        },
        error: function (jqXmlHttpRequest, textStatus, errorThrown) {
            setTimeout(function () { $("#loading").hide(); }, 1000);
            console.log("Error: "+errorThrown);
        }
    });
}

       

  