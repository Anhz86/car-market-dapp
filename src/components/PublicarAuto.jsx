import React, { useState } from "react";
import { ethers } from "ethers";

export default function PublicarAuto({ contract, cuenta }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [precio, setPrecio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const publicar = async () => {
    // Validaciones
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
      console.log("Publicando auto...");
      console.log("Marca:", marca);
      console.log("Modelo:", modelo);
      console.log("Año:", anio);
      console.log("Precio en ETH:", precio);

      // Convertir precio a Wei
      const precioWei = ethers.parseEther(precio);
      console.log("Precio en Wei:", precioWei.toString());

      // Llamar a la función listarAuto del contrato
      // listarAuto(_marca, _modelo, _anio, _precio)
      const tx = await contract.listarAuto(marca, modelo, parseInt(anio), precioWei);

      console.log("Transacción enviada:", tx.hash);
      alert("Transacción enviada. Esperando confirmación...");
      
      const receipt = await tx.wait();
      
      console.log("Transacción confirmada:", receipt);
      alert("✅ Auto publicado con éxito!");
      
      // Limpiar campos
      setMarca("");
      setModelo("");
      setAnio("");
      setPrecio("");
      
    } catch (error) {
      console.error("Error completo:", error);
      
      // Manejo de errores más específico
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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="text-3xl mr-2">🚗</span> 
        Publicar Auto
      </h2>
      
      <div className="space-y-4">
        {/* INPUT: MARCA */}
        <div>
          <label htmlFor="marca" className="block text-sm font-semibold text-gray-700 mb-2">
            Marca
          </label>
          <input
            id="marca"
            type="text"
            placeholder="Ej: Tesla, Audi, BMW"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isLoading}
          />
        </div>

        {/* INPUT: MODELO */}
        <div>
          <label htmlFor="modelo" className="block text-sm font-semibold text-gray-700 mb-2">
            Modelo
          </label>
          <input
            id="modelo"
            type="text"
            placeholder="Ej: Model S, R8, M3"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isLoading}
          />
        </div>

        {/* INPUT: AÑO */}
        <div>
          <label htmlFor="anio" className="block text-sm font-semibold text-gray-700 mb-2">
            Año
          </label>
          <input
            id="anio"
            type="number"
            placeholder="2024"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isLoading}
          />
        </div>
        
        {/* INPUT: PRECIO */}
        <div>
          <label htmlFor="precio" className="block text-sm font-semibold text-gray-700 mb-2">
            Precio en ETH
          </label>
          <input
            id="precio"
            type="number"
            placeholder="0.5"
            step="0.001"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isLoading}
          />
          {precio && parseFloat(precio) > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ≈ {parseFloat(precio).toFixed(4)} ETH
            </p>
          )}
        </div>

        {/* BOTÓN: PUBLICAR */}
        <button
          onClick={publicar}
          disabled={isLoading || !contract || !cuenta}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all duration-300 
            ${isLoading || !contract || !cuenta
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publicando...
            </div>
          ) : (
            "Publicar Auto"
          )}
        </button>

        {(!contract || !cuenta) && (
          <p className="text-red-500 text-sm text-center mt-2">
            ⚠️ Por favor, reconecta tu wallet.
          </p>
        )}
      </div>
    </div>
  );
}