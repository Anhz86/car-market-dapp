import React, { useState } from "react";
import { ethers } from "ethers";

export default function PublicarAuto({ contract, cuenta }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [precio, setPrecio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const publicar = async () => {
    if (!contract) {
        alert("Error: Contrato no conectado. Por favor, reconecta tu wallet.");
        return;
    }

    if (!cuenta) {
        alert("Error: No hay cuenta conectada. Por favor, reconecta tu wallet.");
        return;
    }

    if (!marca || !modelo || !anio || !precio) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    if (parseFloat(precio) <= 0) {
        alert("El precio debe ser mayor a 0.");
        return;
    }

    if (parseInt(anio) < 1900 || parseInt(anio) > new Date().getFullYear() + 1) {
        alert("Por favor, ingresa un año válido.");
        return;
    }
    
    setIsLoading(true);

    try {
      const precioWei = ethers.parseEther(precio);
      const tx = await contract.listarAuto(marca, modelo, parseInt(anio), precioWei);
      
      alert("Transacción enviada. Esperando confirmación...");
      
      const receipt = await tx.wait();
      
      alert("✅ Auto publicado con éxito!");
      
      setMarca("");
      setModelo("");
      setAnio("");
      setPrecio("");
      
    } catch (error) {
      console.error("Error completo:", error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert("❌ Transacción rechazada por el usuario.");
      } else if (error.message && error.message.includes("insufficient funds")) {
        alert("❌ Fondos insuficientes para realizar la transacción.");
      } else if (error.message && error.message.includes("gas")) {
        alert("❌ Error de gas. Intenta aumentar el límite de gas.");
      } else {
        alert(`❌ Error al publicar: ${error.message || "Error desconocido"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Publicar Nuevo Auto</h2>
            <p className="text-purple-100 text-sm font-medium">Completa la información para listar tu vehículo</p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* MARCA */}
          <div className="space-y-2">
            <label htmlFor="marca" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Marca</span>
            </label>
            <input
              id="marca"
              type="text"
              placeholder="Tesla, BMW, Audi..."
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-purple-300"
              disabled={isLoading}
            />
          </div>

          {/* MODELO */}
          <div className="space-y-2">
            <label htmlFor="modelo" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Modelo</span>
            </label>
            <input
              id="modelo"
              type="text"
              placeholder="Model S, M3, R8..."
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-pink-300"
              disabled={isLoading}
            />
          </div>

          {/* AÑO */}
          <div className="space-y-2">
            <label htmlFor="anio" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Año</span>
            </label>
            <input
              id="anio"
              type="number"
              placeholder="2024"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-blue-300"
              disabled={isLoading}
            />
          </div>
          
          {/* PRECIO */}
          <div className="space-y-2">
            <label htmlFor="precio" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Precio (ETH)</span>
            </label>
            <div className="relative">
              <input
                id="precio"
                type="number"
                placeholder="0.5"
                step="0.001"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full p-4 pr-16 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-green-300"
                disabled={isLoading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-500">ETH</span>
            </div>
            {precio && parseFloat(precio) > 0 && (
              <div className="flex items-center space-x-2 mt-2 text-sm">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-green-600 font-bold">
                  ≈ {parseFloat(precio).toFixed(4)} ETH
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN PUBLICAR */}
        <button
          onClick={publicar}
          disabled={isLoading || !contract || !cuenta}
          className={`
            w-full py-5 px-6 rounded-2xl font-black text-lg text-white shadow-2xl
            transition-all duration-300 transform
            ${isLoading || !contract || !cuenta
              ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 hover:scale-105 hover:shadow-3xl'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Publicando Auto...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Publicar Auto en Marketplace</span>
            </div>
          )}
        </button>

        {(!contract || !cuenta) && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-bold">
              Por favor, reconecta tu wallet para continuar.
          </p>
        </div>
      </div>
    )}
  </div>
</div>
);
}