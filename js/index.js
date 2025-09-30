   
document.getElementById("realizarPedido").addEventListener("click", function() {
    // Recuperar carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let pedido = {
        clienteId: 123, // ⚡ Aquí pones el id del cliente logueado
        items: carrito
    };
    var ubica = document.getElementById("txtUbicacion").value;
    var total = document.getElementById("precio").value;
    var mp = document.getElementById("metodoPago").value;
    var pc = document.getElementById("pagaCon").value;
    var cambio = document.getElementById("cambio").value;
    // Recorrer cada item del pedido
    pedido.items.forEach(item => {
        if (item.opciones && item.opciones.length > 0) {
            item.opciones = item.opciones.map(opcion => {
                // Elimina etiquetas <span> y </span>
                return opcion.replace(/<[^>]*>/g, '').trim();
            });
        }
    });
    var jsonData = JSON.stringify(pedido);
    if(ubica == "" || pc == ""){
        alert("Agregue los datos solicitados");
    }
    else{
          $.ajax({
            type: "POST",
            url: "https://amahcarev2.somee.com/apihouse.ashx?Comando=AgregarOrden&Ubicacion="+ubica+"&Total="+total+"&MetodoPago="+mp+"&PagaCon="+pc+"&Cambio="+cambio,
            contentType: false,
            processData: false,
            data: jsonData,
            success: function (result) {
                document.getElementById("txtUbicacion").value = "";
                document.getElementById("metodoPago").value = "efectivo";
                document.getElementById("pagaCon").value = "";
                document.getElementById("cambio").value = "";
                document.getElementById("pagaConContainer").style.display = "block";
                document.getElementById("cambioContainer").style.display = "block";
            $('#addProdMod').modal('hide');
            // ToastSuccess("Imagen actualizada");
            },
            error: function (jqXmlHttpRequest, textStatus, errorThrown) {
            setTimeout($("#loading").hide(), 1000);
            ToastWarning("Verifique su conexión");
            }
        });

        if (carrito.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }
        // Obtener la ubicación del textarea
        const ubicacion = document.getElementById("txtUbicacion").value.trim();
        const numero = "522282114473"; // Número de WhatsApp
        // Construir mensaje con todos los productos del carrito
        let mensaje = "Hola! Quiero realizar el siguiente pedido:\n\n";
        carrito.forEach(item => {
            mensaje += `- ${item.producto || "Producto"} (x${item.cantidad || 1})\n`;
            if (item.opciones && item.opciones.length > 0) {
                mensaje += `  Opciones: ${item.opciones.join(", ")}\n`;
            }
            if (item.comentario) {
                mensaje += `  Nota: ${item.comentario}\n`;
            }
            mensaje += "\n";
        });                                                                             
        // Agregar la ubicación al final del mensaje si existe
        if (ubicacion) {
            mensaje += ` | Ubicación de entrega: ${ubicacion}\n`;
        }
        // Codificar mensaje para URL
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        // Abrir WhatsApp en nueva ventana
        //window.open(url, "_blank");
        // Opcional: vaciar el carrito después de enviar
        localStorage.removeItem("carrito");
        document.getElementById("carritoContenido").innerHTML = "<p>Tu carrito está vacío.</p>";
        document.getElementById("comments").value = "";
    }  
});

// Guardar pedido en localStorage
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombreHamburguesa = this.parentElement.querySelector("h3").innerText;
    const cantidad = this.parentElement.querySelector('input[type="number"]').value;
    // Obtenemos el precio desde el span con name="precio"
    const precioText = this.parentElement.querySelector('span[name="precio"]').textContent.trim(); // "$ 80"

    // Obtener checkboxes seleccionados
    let opciones = [];
    this.querySelectorAll('input[name="customizations"]').forEach(el => {
    // Obtener el texto del label o del nextSibling
    let texto = el.nextSibling.textContent.trim();

     if (el.checked) {
        //if(texto == "Papas"){
        //    opciones.push(`<span class="badge bg-primary rounded-pill">${texto}</span>`);
        //}
    } else {
        opciones.push(`<span class="badge bg-danger rounded-pill">Sin ${texto}</span>`);
    }
});

    // Obtener comentario adicional
    let comentario = this.querySelector("textarea") ? this.querySelector("textarea").value.trim() : "";

    // Crear objeto del pedido
    let pedido = {
      producto: nombreHamburguesa,
      cantidad: cantidad,
      opciones: opciones,
      comentario: comentario,
      precio: precioText
    };
    // Leer carrito actual
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    // Agregar pedido al carrito
    carrito.push(pedido);
    // Guardar de nuevo en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));
    //alert(`${nombreHamburguesa} agregado al carrito 🛒`);
    mostrarAlerta(`${nombreHamburguesa} agregado al carrito 🛒`);
  });
});

// Mostrar carrito en modal con botón de eliminar
document.getElementById("btnCarrito").addEventListener("click", () => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contenedor = document.getElementById("carritoContenido");
  
    function actualizarTotal() {
        let total = carrito.reduce((sum, item) => {
        let precioUnitario = parseFloat(item.precio.replace("$", "").trim());
        return sum + precioUnitario; // si quieres multiplicar por cantidad: precioUnitario * item.cantidad
        }, 0);

        document.getElementById("precio").value = total.toFixed(2);
        if( document.getElementById("metodoPago").value == "transferencia"){
            document.getElementById("pagaCon").value = total.toFixed(2).split('.')[0];
        }
    }

    function renderCarrito() {
        if (carrito.length === 0) {
            contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
            document.getElementById("precio").value = 0;
            return;
        }

        contenedor.innerHTML = `
            <ul class="list-group">
            ${carrito.map((item, i) => `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                <div>
                    <strong>${item.producto}</strong> (x${item.cantidad})<br>
                    ${item.opciones?.length > 0 ? "Condiciones: " + item.opciones.join(", ") + "<br>" : ""}
                    ${item.comentario ? "Nota: " + item.comentario : ""}
                </div>
                <div class="text-end">
                    <span class="badge bg-info rounded-pill">${item.precio}</span>
                    <button class="btn btn-sm btn-danger btn-eliminar" style="padding:0px; background:#fff" data-index="${i}">❌</button>
                </div>
                </li>
            `).join("")}
            </ul>
        `;

        // 🔹 Asignar evento a botones de eliminar
        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", function() {
            let index = this.dataset.index;
            carrito.splice(index, 1); // eliminar del carrito
            localStorage.setItem("carrito", JSON.stringify(carrito)); // actualizar storage
            renderCarrito(); // volver a renderizar
            actualizarTotal(); // recalcular total
            });
        });

        actualizarTotal();
    }

    renderCarrito();

    new bootstrap.Modal(document.getElementById("carritoModal")).show();
});

// Vaciar carrito
document.getElementById("vaciarCarrito").addEventListener("click", () => {
  localStorage.removeItem("carrito");
  document.getElementById("carritoContenido").innerHTML = "<p>Tu carrito está vacío.</p>";
});

document.querySelectorAll(".menu-item").forEach(menuItem => {
  const precioSpan = menuItem.querySelector('span[name="precio"]');
  const cantidadInput = menuItem.querySelector('input[type="number"]');
  const checkboxes = menuItem.querySelectorAll('input[type="checkbox"]');
  // Guardamos el precio base (ej: "$ 70" → 70)
  const precioBase = parseFloat(precioSpan.textContent.replace("$", "").trim());

  function actualizarPrecio() {
    let precioFinal = precioBase;
    // Si tiene Papas seleccionadas, sumar $20
    checkboxes.forEach(cb => {
      const labelText = cb.parentElement.textContent;
      if (labelText.includes("Papas") && cb.checked) {
        precioFinal += 20;
      }
    });
    // Multiplicar por cantidad
    const cantidad = parseInt(cantidadInput.value) || 1;
    const total = precioFinal * cantidad;
    // Mostrar en el span
    precioSpan.textContent = `$ ${total}`;
  }
  // Eventos: cuando cambia cantidad o se selecciona un checkbox
  cantidadInput.addEventListener("input", actualizarPrecio);
  checkboxes.forEach(cb => cb.addEventListener("change", actualizarPrecio));
  // Inicializar al cargar
  actualizarPrecio();
});

document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".categoria-btn");
    const items = document.querySelectorAll(".menu-item");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            // Quitar la clase active de todos
            botones.forEach(b => b.classList.remove("active"));
            // Activar el botón actual
            boton.classList.add("active");

            const categoria = boton.dataset.categoria;

            // Mostrar/ocultar productos
            items.forEach(item => {
                if (item.classList.contains(categoria)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });

    // Mostrar por defecto hamburguesas
    document.querySelector('.categoria-btn[data-categoria="hamburguesas"]').click();
});

// Función para mostrar alerta tipo toast
function mostrarAlerta(mensaje) {
    const toast = document.createElement('div');
    toast.innerHTML = mensaje;
    toast.style.cssText = `
        background: #dc3545;
        color: white;
        padding: 10px 20px;
        margin-top: 5px;
        border-radius: 5px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        opacity: 0;
        transition: opacity 0.5s, transform 0.5s;
    `;
    document.getElementById('toastContainer').appendChild(toast);
    // Mostrar con efecto
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(-10px)';
    }, 50);
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
    // Efecto en el botón carrito
    const btn = document.getElementById('btnCarrito');
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = 'scale(1)', 200);
}




