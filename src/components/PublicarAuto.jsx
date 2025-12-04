import React, { useState } from "react";
import { ethers } from "ethers";

export default function PublicarAuto({ contract, cuenta, onPublicacionExitosa }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [precio, setPrecio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      
      const receipt = await tx.wait();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      setMarca("");
      setModelo("");
      setAnio("");
      setPrecio("");

      if (onPublicacionExitosa) {
        onPublicacionExitosa();
      }
      
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
    <div className="space-y-6">
      {/* NOTIFICACIÓN DE ÉXITO */}
      {showSuccess && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl animate-slideDown border-2 border-green-400">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white">¡Auto Publicado con Éxito!</h3>
              <p className="text-green-100 text-sm font-semibold">Tu vehículo ya está disponible en el marketplace</p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200/50 overflow-hidden">
        {/* HEADER ÉPICO */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center flex-shrink-0 transform hover:rotate-12 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Publicar Nuevo Auto</h2>
              <p className="text-pink-100 text-sm font-semibold mt-1">Completa la información para listar tu vehículo en la blockchain</p>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="p-8">
          {/* VISTA PREVIA DEL AUTO */}
          {(marca || modelo || anio || precio) && (
            <div className="mb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-lg font-black text-gray-800">Vista Previa</h3>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-gray-900">{modelo || "Modelo"} {marca || "Marca"}</p>
                    <p className="text-sm text-gray-500 font-semibold">{anio || "Año"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {precio || "0"} ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* MARCA */}
            <div className="group space-y-2">
              <label htmlFor="marca" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span>Marca del Vehículo</span>
              </label>
              <input
                id="marca"
                type="text"
                placeholder="Tesla, BMW, Audi, Mercedes..."
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-purple-300 hover:shadow-md"
                disabled={isLoading}
              />
            </div>

            {/* MODELO */}
            <div className="group space-y-2">
              <label htmlFor="modelo" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span>Modelo del Vehículo</span>
              </label>
              <input
                id="modelo"
                type="text"
                placeholder="Model S, M3, R8, Clase A..."
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-pink-300 hover:shadow-md"
                disabled={isLoading}
              />
            </div>

            {/* AÑO */}
            <div className="group space-y-2">
              <label htmlFor="anio" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Año de Fabricación</span>
              </label>
              <input
                id="anio"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                min="1900"
                max={new Date().getFullYear() + 1}
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-blue-300 hover:shadow-md"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 font-semibold flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rango válido: 1900 - {new Date().getFullYear() + 1}</span>
              </p>
            </div>
            
            {/* PRECIO */}
            <div className="group space-y-2">
              <label htmlFor="precio" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Precio en Ethereum</span>
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
                  className="w-full p-4 pr-20 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-green-300 hover:shadow-md"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-black text-gray-500">ETH</span>
                </div>
              </div>
              {precio && parseFloat(precio) > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-green-700">Precio confirmado:</span>
                    </div>
                    <p className="text-lg font-black text-green-600">
                      {parseFloat(precio).toFixed(4)} ETH
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INFORMACIÓN ADICIONAL */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-800 mb-2">Información Importante</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    <span className="font-semibold">Tu auto será visible para todos los usuarios del marketplace</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                    <span className="font-semibold">La transacción requiere gas fees de la red Ethereum</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-pink-600 rounded-full"></span>
                    <span className="font-semibold">El precio no puede ser modificado después de publicar</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* BOTÓN PUBLICAR */}
          <button
            onClick={publicar}
            disabled={isLoading || !contract || !cuenta}
            className={`
              relative w-full py-6 px-6 rounded-2xl font-black text-xl text-white shadow-2xl
              transition-all duration-300 transform overflow-hidden group
              ${isLoading || !contract || !cuenta
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 hover:scale-105 hover:shadow-3xl'
              }
            `}
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            {isLoading ? (
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <svg className="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Publicando en Blockchain...</span>
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Publicar Auto en Marketplace</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>

          {/* MENSAJE DE ERROR */}
          {(!contract || !cuenta) && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-5 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-800 font-black text-lg">Wallet no conectada</p>
                  <p className="text-red-600 font-semibold text-sm">Por favor, reconecta tu wallet para continuar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}