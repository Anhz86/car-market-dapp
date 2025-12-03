import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function ListaAutos({ contract }) {
  const [autos, setAutos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define un ZeroHash para comparaciones, similar a ethers.ZeroAddress
  const ZeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const shortenAddress = (address) => {
    if (!address || address === ethers.ZeroAddress || address === ZeroHash) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // 🛠️ FUNCIÓN AGREGADA: Para generar el enlace al explorador de bloques
  const obtenerUrlEtherscan = (txHash) => {
    // ⚠️ IMPORTANTE: Reemplaza con la URL base de tu explorador de bloques (Etherscan, Polygonscan, etc.)
    // Usé Sepolia como ejemplo, debes ajustarlo a la red donde desplegaste tu contrato.
    const BASE_URL = "https://sepolia.etherscan.io"; 
    if (txHash && txHash !== ZeroHash) {
        return `${BASE_URL}/tx/${txHash}`;
    }
    return null;
  };

  const cargarAutos = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError(null);
    setAutos([]);

    try {
      // Asume que tu contrato inteligente tiene un método `getAutos()` que devuelve
      // una estructura con id, marca, modelo, anio, precio, vendedor, comprador, vendido, y AHORA transactionHash.
      const autosData = await contract.getAutos();
      
      const lista = autosData.map((auto) => ({
        id: Number(auto.id),
        marca: auto.marca,
        modelo: auto.modelo,
        anio: Number(auto.anio),
        precio: ethers.formatEther(auto.precio),
        vendedor: auto.vendedor,
        comprador: auto.comprador,
        vendido: auto.vendido,
        // 🔑 CAMBIO AGREGADO: Mapear el nuevo campo transactionHash del contrato
        txHash: auto.transactionHash || ZeroHash, 
      }));

      setAutos(lista);
    } catch (err) {
      console.error("Error al cargar los autos:", err);
      setError("No se pudieron cargar los datos. Revisa la conexión a la red o el contrato.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) cargarAutos();
  }, [contract]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
      {/* HEADER (sin cambios) */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Lista de Autos en Venta</h2>
              <p className="text-blue-100 text-sm font-medium">{autos.length} {autos.length === 1 ? 'auto disponible' : 'autos disponibles'}</p>
            </div>
          </div>
          
          <button
            onClick={cargarAutos}
            disabled={isLoading}
            className={`
              bg-white/20 backdrop-blur-lg text-white font-bold py-3 px-6 rounded-xl 
              hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30
              flex items-center space-x-2
              ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cargando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refrescar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ERROR (sin cambios) */}
      {error && (
        <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="p-6">
        {autos.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay autos disponibles</h3>
            <p className="text-gray-600">Sé el primero en publicar un auto en el marketplace.</p>
          </div>
        ) : (
          <>
            {/* VISTA DESKTOP - TABLA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    {[
                      { label: 'ID', icon: '#' },
                      { label: 'Modelo', icon: '🚗' },
                      { label: 'Año', icon: '📅' },
                      { label: 'Precio', icon: '💰' },
                      { label: 'Vendedor', icon: '👤' },
                      { label: 'Comprador', icon: '🤝' },
                      { label: 'Estado', icon: '📊' },
                      { label: 'Transacción', icon: '🔗' } // 🔑 NUEVO ENCABEZADO
                    ].map(header => (
                      <th key={header.label} className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-2">
                          <span>{header.icon}</span>
                          <span>{header.label}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {autos.map((auto) => (
                    <tr 
                      key={auto.id} 
                      className={`
                        transition-all duration-300
                        ${auto.vendido 
                          ? 'bg-gray-50/50 opacity-60' 
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-lg cursor-pointer'
                        }
                      `}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-black shadow-lg">
                          {auto.id}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div>
                          <p className="text-base font-bold text-gray-900">{auto.modelo}</p>
                          {auto.marca && <p className="text-sm text-gray-500 font-medium">{auto.marca}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                          {auto.anio || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {auto.precio} ETH
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          {shortenAddress(auto.vendedor)}
                        </span>
                      </td>
                      {/* CELDA DEL COMPRADOR */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        {auto.vendido && auto.comprador && auto.comprador !== ethers.ZeroAddress ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                            {shortenAddress(auto.comprador)}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span 
                          className={`
                            inline-flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg
                            ${auto.vendido 
                              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse'
                            }
                          `}
                        >
                          {auto.vendido ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Vendido
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              En Venta
                            </>
                          )}
                        </span>
                      </td>
                      {/* 🔑 NUEVA CELDA: BOTÓN DE TRANSACCIÓN */}
                      <td className="px-6 py-5 whitespace-nowrap text-left">
                        {auto.vendido && auto.txHash && auto.txHash !== ZeroHash ? (
                          <a
                            href={obtenerUrlEtherscan(auto.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-full shadow-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-150"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Ver Tx
                          </a>
                        ) : (
                          <span className="text-gray-400 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VISTA MOBILE - CARDS */}
            <div className="md:hidden space-y-4">
              {autos.map((auto) => (
                <div 
                  key={auto.id} 
                  className={`
                    rounded-2xl p-5 shadow-xl border-2 transition-all duration-300
                    ${auto.vendido 
                      ? 'bg-gray-50 border-gray-200 opacity-70' 
                      : 'bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:shadow-2xl hover:scale-105'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-black text-lg shadow-lg">
                        {auto.id}
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{auto.modelo}</h3>
                        {auto.marca && <p className="text-sm text-gray-600 font-medium">{auto.marca}</p>}
                      </div>
                    </div>
                    
                    <span 
                      className={`
                        px-3 py-1 rounded-full text-xs font-black uppercase
                        ${auto.vendido 
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        }
                      `}
                    >
                      {auto.vendido ? 'Vendido' : 'En Venta'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-semibold">Precio:</span>
                      <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {auto.precio} ETH
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-semibold">Año:</span>
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                        {auto.anio || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500 font-semibold block mb-1">Vendedor:</span>
                      <span className="text-xs font-mono font-bold bg-gray-100 px-3 py-1 rounded-lg inline-block">
                        {shortenAddress(auto.vendedor)}
                      </span>
                    </div>

                    {/* BLOQUE DEL COMPRADOR */}
                    {auto.vendido && auto.comprador && auto.comprador !== ethers.ZeroAddress && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-semibold block mb-1">
                          Comprador: 
                        </span>
                        <span className="text-xs font-mono font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-lg inline-block">
                          {shortenAddress(auto.comprador)}
                        </span>
                      </div>
                    )}
                    
                    {/* 🔑 NUEVO BLOQUE: ENLACE A TRANSACCIÓN */}
                    {auto.vendido && auto.txHash && auto.txHash !== ZeroHash && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-semibold block mb-2">Detalles de Transacción:</span>
                        <a
                          href={obtenerUrlEtherscan(auto.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-bold text-pink-700 hover:text-pink-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {shortenAddress(auto.txHash)} (Ver en Etherscan)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}