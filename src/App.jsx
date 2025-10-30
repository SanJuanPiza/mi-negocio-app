import React, { useState, useEffect } from 'react';
// Íconos (los mismos de antes)
import { Plus, Edit2, Trash2, Package, ShoppingCart, DollarSign, Search, TrendingDown, TrendingUp, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient'; 

// ------------------------------------------------------------------
// COMPONENTE 1: Formulario de Login (MODIFICADO)
// ------------------------------------------------------------------
function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Ya no necesitamos 'isLogin', solo es un formulario de Login

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // --- Solo Iniciar Sesión ---
      // Ya no hay lógica de 'signUp'
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      // Si todo sale bien, el 'onAuthStateChange' nos logueará
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-sm">
        {/* Título estático */}
        <h1 className="text-2xl font-bold text-center mb-6">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="tu-email@correo.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
        {/* Ya no hay botón para registrarse */}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENTE 2: El "Portero" (Sin cambios)
// ------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando sesión...</div>;
  }

  if (!session) {
    return <AuthForm />;
  } 
  
  return <BusinessApp user={session.user} />;
}

// ------------------------------------------------------------------
// COMPONENTE 3: La App del Negocio (Sin cambios)
// ------------------------------------------------------------------
function BusinessApp({ user }) {
  // ... (Todo el código de BusinessApp es idéntico)
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [dineroActual, setDineroActual] = useState(0);
  const [gastos, setGastos] = useState([]);
  const [reinversiones, setReinversiones] = useState([]);
  const [seccionActual, setSeccionActual] = useState('inventario');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: productosData, error: errorProductos } = await supabase
        .from('productos').select('*').order('nombre', { ascending: true }); 
      if (errorProductos) throw errorProductos;
      if (productosData) setProductos(productosData);

      const { data: ventasData, error: errorVentas } = await supabase
        .from('ventas').select('*').order('created_at', { ascending: false }); 
      if (errorVentas) throw errorVentas;
      if (ventasData) setVentas(ventasData);
      
      const { data: gastosData, error: errorGastos } = await supabase
        .from('gastos').select('*').order('created_at', { ascending: false }); 
      if (errorGastos) throw errorGastos;
      if (gastosData) setGastos(gastosData);

      const { data: reinversionesData, error: errorReinversiones } = await supabase
        .from('reinversiones').select('*').order('created_at', { ascending: false });
      if (errorReinversiones) throw errorReinversiones;
      if (reinversionesData) setReinversiones(reinversionesData);

      const { data: dineroData, error: errorDinero } = await supabase
        .from('dinero').select('monto').eq('id', 1).single();   
      if (errorDinero) throw errorDinero;
      if (dineroData) setDineroActual(dineroData.monto);

    } catch (error) {
      console.error('Error cargando datos: ', error.message);
    }
    setCargando(false);
  };

  const handleLogout = async () => {
    setCargando(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error al cerrar sesión:', error.message);
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="flex items-center justify-center h-screen">Cargando datos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Menú de navegación */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        {/* Fila superior con Título y Botón Logout */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Mi Negocio</h1>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 flex items-center gap-2"
          >
            <LogOut size={18} />
            <span className="hidden md:block">Salir</span>
          </button>
        </div>
        
        {/* Fila inferior con botones de navegación */}
        <div className="flex gap-2 overflow-x-auto">
           {/* ... (Botones de navegación idénticos) ... */}
           <button
            onClick={() => setSeccionActual('inventario')}
            className={`px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap ${
              seccionActual === 'inventario' ? 'bg-blue-800' : 'bg-blue-500'
            }`}
          >
            <Package size={20} /> Inventario
          </button>
          <button
            onClick={() => setSeccionActual('ventas')}
            className={`px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap ${
              seccionActual === 'ventas' ? 'bg-blue-800' : 'bg-blue-500'
            }`}
          >
            <ShoppingCart size={20} /> Ventas
          </button>
          <button
            onClick={() => setSeccionActual('gastos')}
            className={`px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap ${
              seccionActual === 'gastos' ? 'bg-blue-800' : 'bg-blue-500'
            }`}
          >
            <TrendingDown size={20} /> Gastos
          </button>
          <button
            onClick={() => setSeccionActual('reinversion')}
            className={`px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap ${
              seccionActual === 'reinversion' ? 'bg-blue-800' : 'bg-blue-500'
            }`}
          >
            <TrendingUp size={20} /> Reinversión
          </button>
          <button
            onClick={() => setSeccionActual('corte')}
            className={`px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap ${
              seccionActual === 'corte' ? 'bg-blue-800' : 'bg-blue-500'
            }`}
          >
            <DollarSign size={20} /> Corte de Caja
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {seccionActual === 'inventario' && (
          <SeccionInventario productos={productos} cargarDatos={cargarDatos} />
        )}
        {seccionActual === 'ventas' && (
          <SeccionVentas productos={productos} ventas={ventas} dineroActual={dineroActual} cargarDatos={cargarDatos} />
        )}
        {seccionActual === 'gastos' && (
          <SeccionGastos gastos={gastos} dineroActual={dineroActual} cargarDatos={cargarDatos} />
        )}
        {seccionActual === 'reinversion' && (
          <SeccionReinversion productos={productos} reinversiones={reinversiones} dineroActual={dineroActual} cargarDatos={cargarDatos} />
        )}
        {seccionActual === 'corte' && (
          <SeccionCorte productos={productos} ventas={ventas} gastos={gastos} reinversiones={reinversiones} dineroActual={dineroActual} />
        )}
      </div>
    </div>
  );
}


// ------------------------------------------------------------------
// PEGA AQUÍ LAS 5 SECCIONES (Inventario, Ventas, Gastos, Reinversion, Corte)
// ------------------------------------------------------------------
// ... (El código de las 5 secciones es idéntico al que ya tenías) ...
// ... (Asegúrate de pegarlas aquí) ...

function SeccionInventario({ productos, cargarDatos }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');

  const guardarProducto = async () => {
    if (!nombre || !cantidad || !precioVenta || !precioCompra) {
      alert('Por favor llena todos los campos');
      return;
    }
    const productoDatos = {
      nombre,
      cantidad: parseInt(cantidad),
      precioVenta: parseFloat(precioVenta),
      precioCompra: parseFloat(precioCompra)
    };
    try {
      if (productoEditando) {
        const { error } = await supabase
          .from('productos')
          .update(productoDatos)
          .eq('id', productoEditando.id); 
        if (error) throw error;
        alert('¡Producto actualizado!');
      } else {
        const { error } = await supabase
          .from('productos')
          .insert(productoDatos);
        if (error) throw error;
        alert('¡Producto guardado!');
      }
      limpiarFormulario();
      cargarDatos(); 
    } catch (error) {
      console.error('Error guardando producto:', error.message);
      alert('Error al guardar el producto.');
    }
  };

  const eliminarProducto = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      try {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('id', id); 
        if (error) throw error;
        alert('Producto eliminado.');
        cargarDatos(); 
      } catch (error) {
        console.error('Error eliminando producto:', error.message);
        alert('Error al eliminar el producto.');
      }
    }
  };

  const editarProducto = (producto) => {
    setProductoEditando(producto);
    setNombre(producto.nombre);
    setCantidad(producto.cantidad.toString());
    setPrecioVenta(producto.precioVenta.toString());
    setPrecioCompra(producto.precioCompra.toString());
    setMostrarForm(true);
  };

  const limpiarFormulario = () => {
    setNombre('');
    setCantidad('');
    setPrecioVenta('');
    setPrecioCompra('');
    setProductoEditando(null);
    setMostrarForm(false);
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="w-full bg-green-500 text-white py-3 rounded-lg mb-4 flex items-center justify-center gap-2 font-semibold"
      >
        <Plus size={20} /> {mostrarForm ? 'Ocultar Formulario' : 'Agregar Producto'}
      </button>
      {mostrarForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold text-lg mb-3">
            {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Cantidad en stock"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio de venta"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio de compra"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={guardarProducto}
                className="flex-1 bg-blue-500 text-white py-2 rounded font-semibold"
              >
                {productoEditando ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                onClick={limpiarFormulario}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {productosFiltrados.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {busqueda ? 'No se encontraron productos' : 'No hay productos. ¡Agrega el primero!'}
          </div>
        ) : (
          productosFiltrados.map(producto => (
            <div key={producto.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{producto.nombre}</h4>
                  <p className="text-sm text-gray-600">Stock: {producto.cantidad} unidades</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editarProducto(producto)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="p-2 bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-semibold">
                  Venta: ${producto.precioVenta.toFixed(2)}
                </span>
                <span className="text-gray-600">
                  Compra: ${producto.precioCompra.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SeccionVentas({ productos, ventas, dineroActual, cargarDatos }) {
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadVenta, setCantidadVenta] = useState('');

  const registrarVenta = async () => {
    if (!productoSeleccionado || !cantidadVenta) {
      alert('Selecciona un producto y cantidad');
      return;
    }
    const producto = productos.find(p => p.id === parseInt(productoSeleccionado));
    const cantidad = parseInt(cantidadVenta);
    if (cantidad > producto.cantidad) {
      alert('No hay suficiente stock');
      return;
    }
    const nuevaVenta = {
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidad: cantidad,
      precioUnitario: producto.precioVenta,
      total: producto.precioVenta * cantidad,
    };
    const nuevoStock = producto.cantidad - cantidad;
    const nuevoDinero = dineroActual + nuevaVenta.total;
    try {
      const { error: errorVenta } = await supabase
        .from('ventas')
        .insert(nuevaVenta);
      if (errorVenta) throw errorVenta;
      const { error: errorProducto } = await supabase
        .from('productos')
        .update({ cantidad: nuevoStock })
        .eq('id', producto.id);
      if (errorProducto) throw errorProducto;
      const { error: errorDinero } = await supabase
        .from('dinero')
        .update({ monto: nuevoDinero })
        .eq('id', 1); 
      if (errorDinero) throw errorDinero;
      alert('¡Venta registrada exitosamente!');
      setProductoSeleccionado('');
      setCantidadVenta('');
      cargarDatos(); 
    } catch (error) {
      console.error('Error al registrar venta:', error.message);
      alert('Error al registrar la venta. La operación se canceló.');
    }
  };

  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => v.created_at.startsWith(hoy));
  const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);

  return (
    <div>
      <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold">Ventas de Hoy</h3>
        <p className="text-3xl font-bold">${totalHoy.toFixed(2)}</p>
        <p className="text-sm">{ventasHoy.length} transacciones</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="font-bold text-lg mb-3">Registrar Venta</h3>
        <div className="space-y-3">
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un producto</option>
            {productos.filter(p => p.cantidad > 0).map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - Stock: {producto.cantidad} - ${producto.precioVenta}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cantidad a vender"
            value={cantidadVenta}
            onChange={(e) => setCantidadVenta(e.target.value)}
            className="w-full p-2 border rounded"
            min="1"
          />
          {productoSeleccionado && cantidadVenta > 0 && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-semibold">Total a cobrar:</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(productos.find(p => p.id === parseInt(productoSeleccionado))?.precioVenta * parseInt(cantidadVenta || 0)).toFixed(2)}
              </p>
            </div>
          )}
          <button
            onClick={registrarVenta}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold"
          >
            Registrar Venta
          </button>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-3">Historial de Ventas</h3>
      <div className="space-y-2">
        {ventas.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay ventas registradas
          </div>
        ) : (
          ventas.slice(0, 20).map(venta => (
            <div key={venta.id} className="bg-white p-3 rounded-lg shadow text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold">{venta.nombreProducto}</span>
                <span className="text-green-600 font-bold">${venta.total.toFixed(2)}</span>
              </div>
              <div className="text-gray-600 text-xs">
                {venta.cantidad} unidades × ${venta.precioUnitario.toFixed(2)}
              </div>
              <div className="text-gray-400 text-xs mt-1">{new Date(venta.created_at).toLocaleString('es-MX')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SeccionGastos({ gastos, dineroActual, cargarDatos }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');

  const registrarGasto = async () => {
    if (!concepto || !monto) {
      alert('Por favor llena todos los campos');
      return;
    }
    const montoGasto = parseFloat(monto);
    if (montoGasto > dineroActual) {
      alert('No hay suficiente dinero en caja para registrar este gasto.');
      return;
    }
    const gastoDatos = {
      concepto,
      monto: montoGasto
    };
    const nuevoDinero = dineroActual - montoGasto;
    try {
      const { error: errorGasto } = await supabase
        .from('gastos')
        .insert(gastoDatos);
      if (errorGasto) throw errorGasto;
      const { error: errorDinero } = await supabase
        .from('dinero')
        .update({ monto: nuevoDinero })
        .eq('id', 1); 
      if (errorDinero) throw errorDinero;
      alert('¡Gasto registrado!');
      limpiarFormulario();
      cargarDatos(); 
    } catch (error) {
      console.error('Error registrando gasto:', error.message);
      alert('Error al registrar el gasto.');
    }
  };

  const eliminarGasto = async (gasto) => {
    if (confirm('¿Seguro que quieres eliminar este gasto? (Esto devolverá el dinero a la caja)')) {
      const nuevoDinero = dineroActual + gasto.monto;
      try {
        const { error: errorGasto } = await supabase
          .from('gastos')
          .delete()
          .eq('id', gasto.id); 
        if (errorGasto) throw errorGasto;
        const { error: errorDinero } = await supabase
          .from('dinero')
          .update({ monto: nuevoDinero })
          .eq('id', 1);
        if (errorDinero) throw errorDinero;
        alert('Gasto eliminado y dinero devuelto a caja.');
        cargarDatos(); 
      } catch (error) {
        console.error('Error eliminando gasto:', error.message);
        alert('Error al eliminar el gasto.');
      }
    }
  };
  
  const limpiarFormulario = () => {
    setConcepto('');
    setMonto('');
    setMostrarForm(false);
  };

  const gastosFiltrados = gastos.filter(g => 
    g.concepto.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  const hoy = new Date().toISOString().split('T')[0];
  const gastosHoy = gastos.filter(g => g.created_at.startsWith(hoy));
  const totalHoy = gastosHoy.reduce((sum, g) => sum + g.monto, 0);

  return (
    <div>
      <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold">Gastos de Hoy</h3>
        <p className="text-3xl font-bold">${totalHoy.toFixed(2)}</p>
        <p className="text-sm">{gastosHoy.length} registros</p>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar concepto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="w-full bg-red-500 text-white py-3 rounded-lg mb-4 flex items-center justify-center gap-2 font-semibold"
      >
        <Plus size={20} /> {mostrarForm ? 'Ocultar Formulario' : 'Registrar Gasto'}
      </button>
      {mostrarForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold text-lg mb-3">Nuevo Gasto</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Concepto (ej. Renta, Luz, Comida)"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Monto (ej. 150.00)"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={registrarGasto}
                className="flex-1 bg-blue-500 text-white py-2 rounded font-semibold"
              >
                Guardar Gasto
              </button>
              <button
                onClick={limpiarFormulario}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <h3 className="font-bold text-lg mb-3">Historial de Gastos</h3>
      <div className="space-y-3">
        {gastosFiltrados.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {busqueda ? 'No se encontraron gastos' : 'No hay gastos registrados.'}
          </div>
        ) : (
          gastosFiltrados.map(gasto => (
            <div key={gasto.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{gasto.concepto}</h4>
                  <p className="text-sm text-red-600 font-semibold">
                    -${gasto.monto.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => eliminarGasto(gasto)}
                    className="p-2 bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(gasto.created_at).toLocaleString('es-MX')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SeccionReinversion({ productos, reinversiones, dineroActual, cargarDatos }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoReInversion, setProductoReInversion] = useState('');
  const [cantidadReInversion, setCantidadReInversion] = useState('');

  const registrarReInversion = async () => {
    if (!productoReInversion || !cantidadReInversion) {
      alert('Selecciona un producto y cantidad');
      return;
    }
    const producto = productos.find(p => p.id === parseInt(productoReInversion));
    const cantidad = parseInt(cantidadReInversion);
    const costoUnitario = producto.precioCompra;
    const costoTotal = costoUnitario * cantidad;
    if (costoTotal > dineroActual) {
      alert('No hay suficiente dinero para esta reinversión');
      return;
    }
    const reinversionDatos = {
      nombreProducto: producto.nombre,
      cantidadComprada: cantidad,
      costoUnitario: costoUnitario,
      costoTotal: costoTotal
    };
    const nuevoStock = producto.cantidad + cantidad;
    const nuevoDinero = dineroActual - costoTotal;
    try {
      const { error: errorReinversion } = await supabase
        .from('reinversiones')
        .insert(reinversionDatos);
      if (errorReinversion) throw errorReinversion;
      const { error: errorProducto } = await supabase
        .from('productos')
        .update({ cantidad: nuevoStock })
        .eq('id', producto.id);
      if (errorProducto) throw errorProducto;
      const { error: errorDinero } = await supabase
        .from('dinero')
        .update({ monto: nuevoDinero })
        .eq('id', 1); 
      if (errorDinero) throw errorDinero;
      alert('¡Reinversión registrada!');
      setProductoReInversion('');
      setCantidadReInversion('');
      setMostrarForm(false);
      cargarDatos(); 
    } catch (error) {
      console.error('Error al registrar reinversión:', error.message);
      alert('Error al registrar la reinversión.');
    }
  };
  
  const hoy = new Date().toISOString().split('T')[0];
  const reinversionesHoy = reinversiones.filter(r => r.created_at.startsWith(hoy));
  const totalHoy = reinversionesHoy.reduce((sum, r) => sum + r.costoTotal, 0);
  
  return (
    <div>
      <div className="bg-orange-500 text-white p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold">Reinversión de Hoy</h3>
        <p className="text-3xl font-bold">${totalHoy.toFixed(2)}</p>
        <p className="text-sm">{reinversionesHoy.length} registros</p>
      </div>
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="w-full bg-orange-500 text-white py-3 rounded-lg mb-4 flex items-center justify-center gap-2 font-semibold"
      >
        <Plus size={20} /> {mostrarForm ? 'Ocultar Formulario' : 'Registrar Reinversión'}
      </button>
      {mostrarForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold text-lg mb-3">Reinversión en Inventario</h3>
          <div className="space-y-3">
            <select
              value={productoReInversion}
              onChange={(e) => setProductoReInversion(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecciona un producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - Costo: ${producto.precioCompra}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Cantidad a comprar"
              value={cantidadReInversion}
              onChange={(e) => setCantidadReInversion(e.target.value)}
              className="w-full p-2 border rounded"
              min="1"
            />
            {productoReInversion && cantidadReInversion > 0 && (
              <div className="bg-orange-50 p-3 rounded">
                <p className="font-semibold">Costo total:</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(productos.find(p => p.id === parseInt(productoReInversion))?.precioCompra * parseInt(cantidadReInversion || 0)).toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={registrarReInversion}
                className="flex-1 bg-orange-500 text-white py-2 rounded font-semibold"
              >
                Registrar
              </button>
              <button
                onClick={() => {
                  setProductoReInversion('');
                  setCantidadReInversion('');
                  setMostrarForm(false);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <h3 className="font-bold text-lg mb-3">Historial de Reinversiones</h3>
      <div className="space-y-3">
        {reinversiones.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay reinversiones registradas.
          </div>
        ) : (
          reinversiones.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{item.nombreProducto}</h4>
                  <p className="text-sm text-gray-600">
                    {item.cantidadComprada} unidades × ${item.costoUnitario.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-orange-600">
                    -${item.costoTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(item.created_at).toLocaleString('es-MX')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SeccionCorte({ productos, ventas, gastos, reinversiones, dineroActual }) {
  const gananciaTotal = ventas.reduce((sum, venta) => {
    const producto = productos.find(p => p.id === venta.productoId);
    if (producto) {
      const ganancia = (venta.precioUnitario - producto.precioCompra) * venta.cantidad;
      return sum + ganancia;
    }
    return sum;
  }, 0);
  
  const gastosTotales = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const reinversionesTotales = reinversiones.reduce((sum, r) => sum + r.costoTotal, 0);

  const productosVendidos = {};
  ventas.forEach(venta => {
    if (productosVendidos[venta.nombreProducto]) {
      productosVendidos[venta.nombreProducto] += venta.cantidad;
    } else {
      productosVendidos[venta.nombreProducto] = venta.cantidad;
    }
  });
  const topProductos = Object.entries(productosVendidos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          <h3 className="text-sm font-semibold">Dinero Actual</h3>
          <p className="text-3xl font-bold">${dineroActual.toFixed(2)}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg">
          <h3 className="text-sm font-semibold">Ganancia Bruta (Ventas)</h3>
          <p className="text-3xl font-bold">${gananciaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <h3 className="text-sm font-semibold">Gastos Totales</h3>
          <p className="text-3xl font-bold">-${gastosTotales.toFixed(2)}</p>
        </div>
        <div className="bg-orange-500 text-white p-4 rounded-lg">
          <h3 className="text-sm font-semibold">Total Reinvertido</h3>
          <p className="text-3xl font-bold">-${reinversionesTotales.toFixed(2)}</p>
        </div>
        <div className="bg-purple-500 text-white p-4 rounded-lg md:col-span-2">
          <h3 className="text-sm font-semibold">Ganancia Neta (Ganancia Bruta - Gastos)</h3>
          <p className="text-3xl font-bold">${(gananciaTotal - gastosTotales).toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="font-bold text-lg mb-3">Productos Más Vendidos</h3>
         {topProductos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Sin datos aún</p>
        ) : (
          <div className="space-y-2">
            {topProductos.map(([nombre, cantidad], index) => (
              <div key={nombre} className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">{index + 1}. {nombre}</span>
                <span className="text-blue-600">{cantidad} vendidos</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-3">Alerta de Stock Bajo</h3>
        {productos.filter(p => p.cantidad <= 5).length === 0 ? (
          <p className="text-gray-500 text-center py-4">Todo bien con el inventario</p>
        ) : (
          <div className="space-y-2">
            {productos.filter(p => p.cantidad <= 5).map(producto => (
              <div key={producto.id} className="flex justify-between items-center bg-red-50 p-2 rounded">
                <span className="font-semibold">{producto.nombre}</span>
                <span className="text-red-600">Solo {producto.cantidad} unidades</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}