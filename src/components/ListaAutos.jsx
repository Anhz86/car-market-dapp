import React, { useEffect, useState } from "react";
import { ethers } from "ethers"; // ¡Importación necesaria!

export default function ListaAutos({ contract }) {
  const [autos, setAutos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función auxiliar para formatear la dirección
  const shortenAddress = (address) => {
    if (!address || address === ethers.ZeroAddress) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const cargarAutos = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError(null);
    setAutos([]); // Limpiar lista al cargar

    try {
      // Usamos el ABI completo (getAutos) que es más eficiente que iterar.
      const autosData = await contract.getAutos();
      
      // Mapear los datos de la tupla de Solidity a un formato más amigable para React
      const lista = autosData.map((auto) => ({
        id: Number(auto.id),
        marca: auto.marca,
        modelo: auto.modelo,
        anio: Number(auto.anio),
        precio: ethers.formatEther(auto.precio),
        vendedor: auto.vendedor,
        comprador: auto.comprador,
        vendido: auto.vendido,
      }));

      setAutos(lista);
    } catch (err) {
      console.error("Error al cargar los autos:", err);
      setError("No se pudieron cargar los datos. Revisa la conexión a la red o el contrato.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar autos automáticamente al conectar el contrato
  useEffect(() => {
    if (contract) cargarAutos();
  }, [contract]);

  return (
    // CONTENEDOR - Diseño tipo 'Card' elevado con borde de acento
    <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📊 Lista de Autos en Venta</h2>
        
        {/* BOTÓN REFRESCAR */}
        <button
          onClick={cargarAutos}
          disabled={isLoading}
          className={`
            bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg 
            hover:bg-gray-800 transition-colors shadow-md text-sm
            ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Refrescar Lista"
          )}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          ⚠️ {error}
        </p>
      )}

      {/* VISTA DE TABLA (Pantallas Grandes) */}
      <div className="hidden md:block overflow-x-auto">
        {autos.length === 0 && !isLoading ? (
          <p className="text-gray-500 text-center py-6">No hay autos publicados en este momento.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Modelo', 'Año', 'Precio (ETH)', 'Vendedor', 'Estado'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {autos.map((auto) => (
                <tr key={auto.id} className={auto.vendido ? 'bg-gray-50 opacity-70' : 'hover:bg-blue-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{auto.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${auto.marca || 'N/A'} ${auto.modelo}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{auto.anio || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{auto.precio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{shortenAddress(auto.vendedor)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${auto.vendido ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {auto.vendido ? 'VENDIDO' : 'EN VENTA'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* VISTA DE TARJETAS (Pantallas Móviles) */}
      <div className="md:hidden space-y-4">
        {autos.length === 0 && !isLoading ? (
          <p className="text-gray-500 text-center py-6">No hay autos publicados en este momento.</p>
        ) : (
          autos.map((auto) => (
            <div key={auto.id} className={`p-4 border rounded-lg shadow-sm ${auto.vendido ? 'bg-gray-50 opacity-70 border-red-300' : 'bg-white border-blue-100'}`}>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{auto.modelo} (ID: {auto.id})</h3>
                <span 
                  className={`px-3 py-1 text-xs leading-5 font-bold rounded-full 
                    ${auto.vendido ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                >
                  {auto.vendido ? 'VENDIDO' : 'EN VENTA'}
                </span>
              </div>
              <p className="text-xl font-extrabold text-green-600 mt-1">{auto.precio} ETH</p>
              <p className="text-sm text-gray-500 mt-2">Vendedor: <span className="font-mono">{shortenAddress(auto.vendedor)}</span></p>
              <p className="text-xs text-gray-400">Año: {auto.anio || 'N/A'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}