import React, { useState } from "react";
// Asegúrate de importar ethers si lo necesitas para otras utilidades, aunque no es estrictamente
// necesario para la lógica de compra si 'auto.precio' ya está en Wei.

// 🔑 CAMBIO 1: La función acepta una nueva propiedad: onCompraExitosa
export default function Comprar({ contract, onCompraExitosa }) {
  const [idAuto, setIdAuto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      
      // 🔑 CAMBIO 2: Esperar la confirmación y capturar el recibo (receipt)
      const receipt = await tx.wait();
      
      // 🔑 CAMBIO 3: Extraer el Hash de la Transacción
      const txHash = receipt.hash;
      
      // 🔑 CAMBIO 4: Almacenar el Hash en el LocalStorage
      // Usamos una clave única (txHash_Auto_ID) para asociarlo al auto.
      localStorage.setItem(`txHash_Auto_${idAuto}`, txHash);
      
      // 🔑 CAMBIO 5: Notificar al componente padre que la compra fue exitosa.
      // Esto dispara la recarga de ListaAutos.
      if (onCompraExitosa) {
          onCompraExitosa();
      }

      alert(`¡Auto con ID ${idAuto} comprado con éxito! Hash de Tx: ${txHash}`);
      setIdAuto("");
    } catch (err) {
      console.error("Error al comprar el auto:", err);
      // Intenta extraer un mensaje de error legible
      const errorMessage = err.reason || (err.data && err.data.message) || "Error desconocido al procesar la compra. Verifica si el ID es correcto o si tienes suficiente ETH.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Comprar Auto</h2>
            <p className="text-orange-100 text-sm font-medium">Ingresa el ID del auto que deseas adquirir</p>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-8">
        <div className="space-y-6">
          {/* INPUT CON BOTÓN */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* INPUT */}
            <div className="flex-1 space-y-2">
              <label htmlFor="idAuto" className="flex items-center space-x-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>ID del Auto</span>
              </label>
              <div className="relative">
                <input
                  id="idAuto"
                  type="number"
                  placeholder="Ej: 1, 2, 3..."
                  value={idAuto}
                  onChange={(e) => setIdAuto(e.target.value)}
                  min="1"
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white text-gray-900 font-semibold placeholder-gray-400 shadow-sm hover:border-orange-300 text-lg"
                  disabled={isLoading}
                />
                <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>

            {/* BOTÓN */}
            <div className="sm:pt-7">
              <button
                onClick={comprar}
                disabled={isLoading}
                className={`
                  w-full sm:w-auto py-4 px-8 rounded-xl font-black text-lg text-white shadow-2xl
                  transition-all duration-300 transform flex items-center justify-center space-x-2
                  ${isLoading 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 hover:scale-105 hover:shadow-3xl'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Comprando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Comprar Ahora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg animate-shake">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 font-black mb-1">Error en la Compra</h3>
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* INFORMACIÓN ÚTIL (sin cambios) */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-800">¿Cómo Comprar?</h3>
            </div>
            
            <div className="space-y-3 pl-2">
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-black flex-shrink-0">1</span>
                <p className="text-gray-700 font-semibold pt-1">Consulta la <span className="text-blue-600 font-black">Lista de Autos</span> para ver los IDs disponibles</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-black flex-shrink-0">2</span>
                <p className="text-gray-700 font-semibold pt-1">Ingresa el <span className="text-purple-600 font-black">ID del auto</span> que deseas comprar</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-black flex-shrink-0">3</span>
                <p className="text-gray-700 font-semibold pt-1">Confirma la transacción en tu wallet de <span className="text-orange-600 font-black">MetaMask</span></p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-black flex-shrink-0">4</span>
                <p className="text-gray-700 font-semibold pt-1">Espera la confirmación y el auto será tuyo</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-blue-200/50">
              <p className="text-sm text-gray-600 font-semibold flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span><span className="font-black">Importante:</span> Asegúrate de tener suficiente ETH en tu wallet para cubrir el precio del auto y las tarifas de gas.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}