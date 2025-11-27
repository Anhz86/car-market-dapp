import React, { useState } from "react";
// No es necesario importar ethers aquí ya que 'auto.precio' es un BigInt de Ethers
// y se pasa directamente al campo 'value' de la transacción.

export default function Comprar({ contract }) {
  const [idAuto, setIdAuto] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  const comprar = async () => {
    setError(null);

    if (!idAuto || isNaN(Number(idAuto)) || Number(idAuto) <= 0) {
      setError("Por favor, introduce un ID de auto válido (número positivo).");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Obtener los detalles del auto (incluyendo el precio)
      const auto = await contract.autos(idAuto);

      if (auto.vendido) {
        setError(`El Auto con ID ${idAuto} ya ha sido vendido.`);
        setIsLoading(false);
        return;
      }
      
      // 2. Ejecutar la transacción de compra, adjuntando el precio como 'value'
      const tx = await contract.comprarAuto(idAuto, { value: auto.precio });
      await tx.wait();

      alert(`¡Auto con ID ${idAuto} comprado con éxito!`);
      setIdAuto(""); // Limpiar el input
    } catch (err) {
      console.error("Error al comprar el auto:", err);
      // Intentar mostrar un mensaje de error más legible
      const errorMessage = err.reason || "Error desconocido al procesar la compra. Verifica si el ID es correcto o si tienes suficiente ETH.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // CONTENEDOR - Diseño tipo 'Card' elevado con borde de acento
    <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-red-600">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Comprar Auto</h2>

      <div className="flex items-start space-x-4">
        {/* INPUT: ID DEL AUTO */}
        <div className="flex-grow">
          <label htmlFor="idAuto" className="block text-sm font-medium text-gray-700 mb-1">ID del Auto a Comprar</label>
          <input
            id="idAuto"
            type="number"
            placeholder="ID del auto"
            value={idAuto}
            onChange={(e) => setIdAuto(e.target.value)}
            min="1"
            // CLASES DE INPUT MEJORADAS
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150"
            disabled={isLoading}
          />
        </div>

        {/* BOTÓN: COMPRAR */}
        <div className="mt-7"> {/* Ajuste para alinear con el input */}
          <button
            onClick={comprar}
            disabled={isLoading}
            // CLASES DE BOTÓN MEJORADAS (Usando rojo para "Comprar/Peligro")
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all duration-300 
              ${isLoading 
                ? 'bg-red-400 cursor-not-allowed flex items-center justify-center' 
                : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Comprando...
              </div>
            ) : (
              "Comprar"
            )}
          </button>
        </div>
      </div>
      
      {/* MENSAJE DE ERROR */}
      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          ⚠️ {error}
        </p>
      )}

    </div>
  );
}