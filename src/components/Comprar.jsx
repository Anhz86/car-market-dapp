import React, { useState } from "react";

export default function Comprar({ contract, onCompraExitosa }) {
  const [idAuto, setIdAuto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);

  const comprar = async () => {
    setError(null);

    if (!idAuto || isNaN(Number(idAuto)) || Number(idAuto) <= 0) {
      setError("Por favor, introduce un ID de auto válido (número positivo).");
      return;
    }

    setIsLoading(true);

    try {
      const auto = await contract.autos(idAuto);

      if (auto.vendido) {
        setError(`El Auto con ID ${idAuto} ya ha sido vendido.`);
        setIsLoading(false);
        return;
      }
      
      const tx = await contract.comprarAuto(idAuto, { value: auto.precio });
      const receipt = await tx.wait();
      const txHash = receipt.hash;
      
      localStorage.setItem(`txHash_Auto_${idAuto}`, txHash);
      
      setLastPurchase({ id: idAuto, txHash: txHash });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 7000);
      
      if (onCompraExitosa) {
          onCompraExitosa();
      }

      setIdAuto("");
    } catch (err) {
      console.error("Error al comprar el auto:", err);
      const errorMessage = err.reason || (err.data && err.data.message) || "Error desconocido al procesar la compra. Verifica si el ID es correcto o si tienes suficiente ETH.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* NOTIFICACIÓN DE ÉXITO */}
      {showSuccess && lastPurchase && (
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-6 shadow-2xl animate-slideDown border-2 border-green-400">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-white mb-1">¡Compra Exitosa! 🎉</h3>
                <p className="text-green-100 text-sm font-semibold mb-3">El Auto #{lastPurchase.id} ahora es tuyo</p>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 border border-white/30">
                  <p className="text-xs font-bold text-green-100 mb-1">TRANSACTION HASH</p>
                  <p className="text-white font-mono text-xs break-all">{lastPurchase.txHash}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-white/80 hover:text-white transition-colors ml-4"
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
        <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center flex-shrink-0 transform hover:rotate-12 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Comprar Auto</h2>
              <p className="text-orange-100 text-sm font-semibold mt-1">Adquiere tu vehículo favorito del marketplace</p>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="p-8">
          <div className="space-y-6">
            {/* INPUT SECTION CON DISEÑO MEJORADO */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
              <label htmlFor="idAuto" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <span>ID del Auto</span>
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* INPUT */}
                <div className="flex-1 relative">
                  <input
                    id="idAuto"
                    type="number"
                    placeholder="Ingresa el número de ID (ej: 1, 2, 3...)"
                    value={idAuto}
                    onChange={(e) => setIdAuto(e.target.value)}
                    min="1"
                    className="w-full p-5 pl-14 pr-20 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white text-gray-900 font-bold placeholder-gray-400 shadow-sm hover:border-orange-400 hover:shadow-md text-lg"
                    disabled={isLoading}
                  />
                  <svg className="w-7 h-7 text-orange-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {idAuto && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      <span className="text-sm font-black text-gray-500">ID:</span>
                      <span className="text-lg font-black text-orange-600">{idAuto}</span>
                    </div>
                  )}
                </div>

                {/* BOTÓN */}
                <button
                  onClick={comprar}
                  disabled={isLoading}
                  className={`
                    group relative sm:w-48 py-5 px-8 rounded-xl font-black text-lg text-white shadow-2xl
                    transition-all duration-300 transform flex items-center justify-center space-x-2 overflow-hidden
                    ${isLoading 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 hover:scale-105 hover:shadow-3xl'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  {isLoading ? (
                    <div className="relative z-10 flex items-center space-x-2">
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="relative z-10 flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Comprar</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-xl shadow-lg animate-shake">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-800 font-black text-lg mb-1">Error en la Compra</h3>
                    <p className="text-red-700 font-semibold">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* GUÍA PASO A PASO */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl p-6 space-y-5 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-gray-800">¿Cómo Comprar un Auto?</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                      1
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 font-bold text-base leading-relaxed">
                      Ve a la pestaña <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black">Lista de Autos</span> y encuentra el vehículo que deseas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg font-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                      2
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 font-bold text-base leading-relaxed">
                      Copia el <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-black">número de ID</span> del auto (aparece en la primera columna)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-lg font-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                      3
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 font-bold text-base leading-relaxed">
                      Pega el ID en el campo de arriba y haz clic en <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-black">"Comprar"</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                      4
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 font-bold text-base leading-relaxed">
                      Confirma la transacción en <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 font-black">MetaMask</span> y espera la confirmación blockchain
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ADVERTENCIA IMPORTANTE */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-yellow-900 mb-2">⚠️ Importante - Lee Antes de Comprar</h4>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold">Verifica que tengas suficiente ETH en tu wallet para el precio del auto + gas fees</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold">Solo puedes comprar autos que estén marcados como "EN VENTA"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold">Las transacciones son irreversibles en la blockchain</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold">Guarda el hash de transacción que recibirás como comprobante</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* TIPS ADICIONALES */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h5 className="font-black text-gray-800 mb-1">Rápido</h5>
                <p className="text-sm text-gray-600 font-semibold">Transacciones confirmadas en minutos</p>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h5 className="font-black text-gray-800 mb-1">Seguro</h5>
                <p className="text-sm text-gray-600 font-semibold">Smart contracts verificados</p>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h5 className="font-black text-gray-800 mb-1">Transparente</h5>
                <p className="text-sm text-gray-600 font-semibold">Todo registrado on-chain</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-5px); }
        }
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
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}