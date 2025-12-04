import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const ZeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

const obtenerUrlEtherscan = (txHash) => {
    const baseUrl = "https://sepolia.etherscan.io"; 
    return `${baseUrl}/tx/${txHash}`;
};

export default function ListaAutos({ contract, refreshKey }) {
    const [autos, setAutos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('todos'); // 'todos', 'disponibles', 'vendidos'
    const [busqueda, setBusqueda] = useState('');

    const cargarAutos = async () => {
        if (!contract) return;
        setIsLoading(true);
        setError(null);
        
        try {
            const autosData = await contract.getAutos();

            const listaProcesada = autosData.map((auto) => {
                const autoId = Number(auto.id);
                const storedTxHash = localStorage.getItem(`txHash_Auto_${autoId}`);
                const finalTxHash = storedTxHash || ZeroHash; 

                return ({
                    id: autoId,
                    marca: auto.marca,
                    modelo: auto.modelo,
                    anio: Number(auto.anio),
                    precio: ethers.formatEther(auto.precio), 
                    vendedor: auto.vendedor,
                    comprador: auto.comprador,
                    vendido: auto.vendido,
                    txHash: finalTxHash,
                });
            });

            setAutos(listaProcesada);

        } catch (err) {
            console.error("Error al cargar los autos:", err);
            setError("Error al conectar con el contrato o cargar los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarAutos();
    }, [contract, refreshKey]);

    // Filtrar autos
    const autosFiltrados = autos.filter(auto => {
        const cumpleFiltro = filtro === 'todos' ? true : 
                            filtro === 'disponibles' ? !auto.vendido : 
                            auto.vendido;
        
        const cumpleBusqueda = busqueda === '' ? true :
                              auto.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
                              auto.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
                              auto.id.toString().includes(busqueda);
        
        return cumpleFiltro && cumpleBusqueda;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>
                <p className="text-xl text-gray-600 font-bold mt-6">Cargando autos del marketplace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-3xl p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-xl text-red-800 font-bold">{error}</p>
            </div>
        );
    }

    const autosDisponibles = autos.filter(auto => !auto.vendido).length;
    const autosVendidos = autos.filter(auto => auto.vendido).length;
    const totalValor = autos.reduce((sum, auto) => sum + parseFloat(auto.precio), 0).toFixed(2);

    return (
        <div className="space-y-6">
            

            {/* CONTENEDOR PRINCIPAL */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200/50 overflow-hidden">
                {/* HEADER ÉPICO */}
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white">Marketplace de Autos</h2>
                                    <p className="text-blue-100 text-sm font-semibold mt-1">
                                        🚗 {autosDisponibles} disponibles • 💰 {autosVendidos} vendidos
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={cargarAutos}
                                className="group bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                disabled={isLoading}
                            >
                                <div className="flex items-center space-x-2">
                                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Refrescar</span>
                                </div>
                            </button>
                        </div>

                        {/* BARRA DE BÚSQUEDA Y FILTROS */}
                        <div className="mt-6 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por marca, modelo o ID..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full bg-white/20 backdrop-blur-lg border-2 border-white/30 text-white placeholder-white/70 rounded-xl px-5 py-3 pl-12 focus:outline-none focus:border-white/50 transition-all duration-300"
                                />
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFiltro('todos')}
                                    className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                                        filtro === 'todos' 
                                            ? 'bg-white text-purple-600 shadow-lg scale-105' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFiltro('disponibles')}
                                    className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                                        filtro === 'disponibles' 
                                            ? 'bg-white text-green-600 shadow-lg scale-105' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    Disponibles
                                </button>
                                <button
                                    onClick={() => setFiltro('vendidos')}
                                    className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                                        filtro === 'vendidos' 
                                            ? 'bg-white text-red-600 shadow-lg scale-105' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    Vendidos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA MEJORADA */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                {["ID", "VEHÍCULO", "AÑO", "PRECIO", "VENDEDOR", "COMPRADOR", "ESTADO", "TRANSACCIÓN"].map((header, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {autosFiltrados.map((auto, index) => (
                                <tr 
                                    key={auto.id} 
                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                                >
                                    {/* ID */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                            auto.vendido 
                                                ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                                                : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                        }`}>
                                            {auto.id}
                                        </div>
                                    </td>
                                    
                                    {/* VEHÍCULO */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                auto.vendido ? 'bg-gray-100' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                                            }`}>
                                                <svg className={`w-6 h-6 ${auto.vendido ? 'text-gray-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{auto.modelo}</div>
                                                <div className="text-xs text-gray-500 font-semibold">{auto.marca}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* AÑO */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                                            {auto.anio}
                                        </span>
                                    </td>
                                    
                                    {/* PRECIO */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                {auto.precio}
                                            </span>
                                            <span className="text-sm font-bold text-gray-500">ETH</span>
                                        </div>
                                    </td>
                                    
                                    {/* VENDEDOR */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="bg-gray-100 px-3 py-2 rounded-lg font-mono text-xs text-gray-700 border border-gray-200">
                                            {auto.vendedor.slice(0, 6)}...{auto.vendedor.slice(-4)}
                                        </div>
                                    </td>
                                    
                                    {/* COMPRADOR */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        {auto.vendido ? (
                                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-lg font-mono text-xs text-purple-700 font-bold border border-purple-200">
                                                {auto.comprador.slice(0, 6)}...{auto.comprador.slice(-4)}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 font-semibold text-sm">—</span>
                                        )}
                                    </td>
                                    
                                    {/* ESTADO */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        {auto.vendido ? (
                                            <span className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span>VENDIDO</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>EN VENTA</span>
                                            </span>
                                        )}
                                    </td>
                                    
                                    {/* TRANSACCIÓN */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        {auto.vendido && auto.txHash && auto.txHash !== ZeroHash ? (
                                            <a
                                                href={obtenerUrlEtherscan(auto.txHash)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <span>Ver TX</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 font-semibold text-sm">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {autosFiltrados.length === 0 && !isLoading && (
                        <div className="py-16 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-xl font-bold text-gray-600 mb-2">No se encontraron autos</p>
                            <p className="text-sm text-gray-500">
                                {busqueda ? 'Intenta con otros términos de búsqueda' : 'Publica un auto para comenzar'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}