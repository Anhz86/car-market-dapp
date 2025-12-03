import React from 'react';
import { ethers } from "ethers";

// Función auxiliar para acortar direcciones (la misma que usaste)
const shortenAddress = (address) => {
    if (!address || address === ethers.ZeroAddress) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function ReciboTransaccion({ auto }) {
    if (!auto || !auto.vendido) {
        return (
            <div className="p-6 text-center text-gray-500">
                Este auto no ha sido vendido o los datos no están disponibles.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <h2 className="text-3xl font-black text-pink-600 mb-6 flex items-center space-x-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Recibo de Transacción</span>
            </h2>

            {/* DETALLES DEL AUTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-blue-50 rounded-xl">
                <div className="font-bold text-gray-700">Auto ID: <span className="text-xl text-blue-800">{auto.id}</span></div>
                <div className="font-bold text-gray-700">Modelo: <span className="text-xl text-blue-800">{auto.marca} {auto.modelo} ({auto.anio})</span></div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Detalles Financieros</h3>
            
            <dl className="space-y-4">
                {/* PRECIO */}
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <dt className="text-gray-600 font-medium">Monto Transaccionado:</dt>
                    <dd className="text-2xl font-black text-green-700">{auto.precio} ETH</dd>
                </div>

                {/* VENDEDOR */}
                <div className="py-2">
                    <dt className="text-gray-600 font-medium block mb-1">Dirección del Vendedor (Recibe ETH):</dt>
                    <dd className="text-sm font-mono font-bold bg-gray-100 text-gray-700 p-2 rounded-lg break-all">
                        {auto.vendedor} <span className="text-xs text-gray-500">({shortenAddress(auto.vendedor)})</span>
                    </dd>
                </div>

                {/* COMPRADOR */}
                <div className="py-2">
                    <dt className="text-gray-600 font-medium block mb-1">Dirección del Comprador (Paga ETH):</dt>
                    <dd className="text-sm font-mono font-bold bg-purple-100 text-purple-700 p-2 rounded-lg break-all">
                        {auto.comprador} <span className="text-xs text-gray-500">({shortenAddress(auto.comprador)})</span>
                    </dd>
                </div>
            </dl>

            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Blockchain Info</h3>

            <div className="py-2">
                <dt className="text-gray-600 font-medium block mb-1">Hash de Transacción (¡Importante!):</dt>
                {/* Nota: Necesitas el hash real. Aquí se usa un marcador de posición */}
                <dd className="text-xs font-mono font-bold bg-pink-100 text-pink-700 p-2 rounded-lg break-all">
                    {/* 👇 Aquí debes pasar el hash real de la transacción que se ejecutó */}
                    {auto.txHash || "HASH_NO_DISPONIBLE_AUN_EN_EL_OBJETO_AUTO"}
                </dd>
                <p className="text-xs text-gray-500 mt-1">
                    Esta es la prueba inmutable de la transferencia en la blockchain.
                </p>
            </div>
        </div>
    );
}