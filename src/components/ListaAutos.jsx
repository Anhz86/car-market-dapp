import React, { useState, useEffect } from "react";
import { ethers } from "ethers"; // Asegúrate de que esta importación sea correcta

// Hash de 32 bytes de ceros, usado para comprobar si el hash es nulo.
const ZeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

// ⚠️ NOTA: Debes definir esta función en tu proyecto.
// Esta función crea el enlace a Etherscan. (ej: https://sepolia.etherscan.io/tx/HASH)
const obtenerUrlEtherscan = (txHash) => {
    // Reemplaza 'tu-red-etherscan.io' con la URL correcta de tu red (ej. sepolia.etherscan.io)
    const baseUrl = "https://sepolia.etherscan.io"; 
    return `${baseUrl}/tx/${txHash}`;
};


export default function ListaAutos({ contract, refreshKey }) {
    const [autos, setAutos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarAutos = async () => {
        if (!contract) return;
        setIsLoading(true);
        setError(null);
        
        try {
            // 1. Obtener la lista de autos del contrato
            const autosData = await contract.getAutos();

            // 2. Mapear y procesar los datos
            const listaProcesada = autosData.map((auto) => {
                const autoId = Number(auto.id);
                
                // 🔑 PASO CLAVE: Intentar leer el hash de la transacción desde localStorage
                const storedTxHash = localStorage.getItem(`txHash_Auto_${autoId}`);
                
                // Usamos el hash de localStorage si existe, de lo contrario usamos el ZeroHash 
                // que devuelve el contrato (ya que no puede guardar el hash real).
                const finalTxHash = storedTxHash || ZeroHash; 

                return ({
                    id: autoId,
                    marca: auto.marca,
                    modelo: auto.modelo,
                    anio: Number(auto.anio),
                    // Convertir de wei a ETH (o el valor que uses para la visualización)
                    precio: ethers.formatEther(auto.precio), 
                    vendedor: auto.vendedor,
                    comprador: auto.comprador,
                    vendido: auto.vendido,
                    txHash: finalTxHash, // Usamos el hash del frontend
                });
            });

            // 3. Almacenar y ordenar los autos
            setAutos(listaProcesada);

        } catch (err) {
            console.error("Error al cargar los autos:", err);
            setError("Error al conectar con el contrato o cargar los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    // 4. useEffect para cargar la lista al montar o al cambiar la llave de recarga
    useEffect(() => {
        cargarAutos();
    }, [contract, refreshKey]); // Dependencia de refreshKey para forzar la recarga

    if (isLoading) {
        return <p className="text-center text-lg text-gray-600 font-semibold mt-10">Cargando autos...</p>;
    }

    if (error) {
        return <p className="text-center text-lg text-red-600 font-semibold mt-10">{error}</p>;
    }

    const autosDisponibles = autos.filter(auto => !auto.vendido).length;

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden mt-10">
            {/* HEADER DE LA TABLA */}
            <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">Lista de Autos en Venta</h2>
                        <p className="text-indigo-100 text-sm font-medium">{autosDisponibles} autos disponibles</p>
                    </div>
                </div>
                <button 
                    onClick={cargarAutos}
                    className="bg-white/20 backdrop-blur-lg text-white font-bold py-2 px-4 rounded-xl hover:bg-white/30 transition-all duration-300"
                    disabled={isLoading}
                >
                    <div className="flex items-center space-x-2">
                        <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m15.356-2H15V2" />
                        </svg>
                        <span>Refrescar</span>
                    </div>
                </button>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/70">
                        <tr>
                            {/* ... (Encabezados de columna) ... */}
                            {["# ID", "MODELO", "AÑO", "PRECIO", "VENDEDOR", "COMPRADOR", "ESTADO", "TRANSACCIÓN"].map((header, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white/90 divide-y divide-gray-200">
                        {autos.map((auto, index) => (
                            <tr key={auto.id} className="hover:bg-indigo-50/50 transition duration-150">
                                {/* ID */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-md font-black shadow-lg ${auto.vendido ? 'bg-purple-400' : 'bg-purple-600'}`}>
                                        {auto.id}
                                    </div>
                                </td>
                                
                                {/* MODELO */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{auto.modelo}</div>
                                    <div className="text-xs text-gray-500">{auto.marca}</div>
                                </td>
                                
                                {/* AÑO */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{auto.anio}</td>
                                
                                {/* PRECIO */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                    <span className="font-extrabold text-lg mr-1">$</span>
                                    {auto.precio} ETH
                                </td>
                                
                                {/* VENDEDOR */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                                    {auto.vendedor.slice(0, 6)}...{auto.vendedor.slice(-4)}
                                </td>
                                
                                {/* COMPRADOR */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-xs">
                                    {auto.vendido ? (
                                        <span className="text-purple-600 font-semibold bg-purple-100 px-3 py-1 rounded-full">
                                            {auto.comprador.slice(0, 6)}...{auto.comprador.slice(-4)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 font-semibold">N/A</span>
                                    )}
                                </td>
                                
                                {/* ESTADO */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {auto.vendido ? (
                                        <span className="px-3 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                            ❌ VENDIDO
                                        </span>
                                    ) : (
                                        <span className="px-3 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                            ✅ EN VENTA
                                        </span>
                                    )}
                                </td>
                                
                                {/* 🔑 TRANSACCIÓN - El Link Ahora Funciona */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {/* Mostrar el link solo si está vendido Y si hay un hash válido */}
                                    {auto.vendido && auto.txHash && auto.txHash !== ZeroHash ? (
                                        <a
                                            href={obtenerUrlEtherscan(auto.txHash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white font-bold text-xs bg-indigo-500 hover:bg-indigo-600 py-1.5 px-3 rounded-xl transition duration-150 inline-flex items-center shadow-md hover:shadow-lg"
                                        >
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
                {autos.length === 0 && !isLoading && (
                    <div className="p-10 text-center text-gray-500">
                        <p className="font-bold">No hay autos listados en el mercado.</p>
                        <p className="text-sm">Publica un auto para comenzar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}