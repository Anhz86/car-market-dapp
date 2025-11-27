import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import PublicarAuto from "./components/PublicarAuto";
import ListaAutos from "./components/ListaAutos";
import Comprar from "./components/Comprar";

const CONTRACT_ADDRESS = "0xd895e71fc3a798C9dfc7FCc096b12Fae6a436ec6";
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "comprador", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "precio", "type": "uint256" }
    ],
    "name": "AutoComprado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "marca", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "modelo", "type": "string" },
      { "indexed": false, "internalType": "uint16", "name": "anio", "type": "uint16" },
      { "indexed": false, "internalType": "uint256", "name": "precio", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "vendedor", "type": "address" }
    ],
    "name": "AutoPublicado",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" }
    ],
    "name": "comprarAuto",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_marca", "type": "string" },
      { "internalType": "string", "name": "_modelo", "type": "string" },
      { "internalType": "uint16", "name": "_anio", "type": "uint16" },
      { "internalType": "uint256", "name": "_precio", "type": "uint256" }
    ],
    "name": "listarAuto",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "autos",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "marca", "type": "string" },
      { "internalType": "string", "name": "modelo", "type": "string" },
      { "internalType": "uint16", "name": "anio", "type": "uint16" },
      { "internalType": "uint256", "name": "precio", "type": "uint256" },
      { "internalType": "address payable", "name": "vendedor", "type": "address" },
      { "internalType": "address", "name": "comprador", "type": "address" },
      { "internalType": "bool", "name": "vendido", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contadorAutos",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAutos",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "marca", "type": "string" },
          { "internalType": "string", "name": "modelo", "type": "string" },
          { "internalType": "uint16", "name": "anio", "type": "uint16" },
          { "internalType": "uint256", "name": "precio", "type": "uint256" },
          { "internalType": "address payable", "name": "vendedor", "type": "address" },
          { "internalType": "address", "name": "comprador", "type": "address" },
          { "internalType": "bool", "name": "vendido", "type": "bool" }
        ],
        "internalType": "struct CarMarket.Auto[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Definimos las pestañas aquí
const TABS = {
    LISTA: 'Lista de Autos',
    PUBLICAR: 'Publicar Auto',
    COMPRAR: 'Comprar Auto',
};

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [cuenta, setCuenta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.LISTA);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    balance: "0",
    autosPublicados: 0,
    autosComprados: 0,
    autosVendidos: 0
  });
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false); 

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
    }

    // Cerrar el menú al hacer click fuera
    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.relative')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const conectarWallet = async () => {
    if (!provider) {
      alert("Por favor, instala MetaMask!");
      return;
    }
    
    setIsLoading(true);

    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      
      // Si hay múltiples cuentas, mostrar selector
      if (accounts.length > 1) {
        setAvailableAccounts(accounts);
        setShowAccountSelector(true);
        setIsLoading(false);
      } else {
        // Si solo hay una cuenta, conectar directamente
        await selectAccount(accounts[0]);
      }

    } catch (error) {
      console.error("Error al conectar la wallet:", error);
      setIsLoading(false);
    }
  };

  const selectAccount = async (selectedAccount) => {
    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      
      setSigner(signer);
      setCuenta(selectedAccount);
      
      // IMPORTANTE: Quitar el array extra del ABI
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contract);
      
      console.log("=== DEBUG CONTRATO ===");
      console.log("Cuenta conectada:", selectedAccount);
      console.log("Dirección del contrato:", CONTRACT_ADDRESS);
      console.log("Contrato inicializado:", contract);
      console.log("Funciones disponibles:");
      
      // Listar todas las funciones disponibles
      if (contract.interface && contract.interface.fragments) {
        contract.interface.fragments.forEach(fragment => {
          if (fragment.type === 'function') {
            console.log(`  - ${fragment.name}`);
          }
        });
      }
      
      // Verificar si listarAuto existe
      console.log("¿listarAuto existe?", typeof contract.listarAuto);
      console.log("¿getAutos existe?", typeof contract.getAutos);
      
      // Obtener información de la cuenta
      const balance = await provider.getBalance(selectedAccount);
      const balanceInEth = ethers.formatEther(balance);
      
      setAccountInfo({
        balance: parseFloat(balanceInEth).toFixed(4),
        autosPublicados: 0,
        autosComprados: 0,
        autosVendidos: 0
      });
      
      setShowAccountSelector(false);
      setIsLoading(false);
      
      setTimeout(() => {
        setShowContent(true);
      }, 100); 

    } catch (error) {
      console.error("Error al seleccionar la cuenta:", error);
      alert("Error al conectar la cuenta: " + error.message);
      setIsLoading(false);
    }
  };

  const desconectarWallet = () => {
    setCuenta(null);
    setSigner(null);
    setContract(null);
    setShowContent(false);
    setShowAccountMenu(false);
    setAccountInfo({
      balance: "0",
      autosPublicados: 0,
      autosComprados: 0,
      autosVendidos: 0
    });
  };
  
  // Función para renderizar el contenido de la pestaña activa con transición
  const renderContent = () => {
    if (!contract) return null;
    
    switch (activeTab) {
        case TABS.PUBLICAR:
            return <div className="py-6"><PublicarAuto contract={contract} cuenta={cuenta} /></div>;
        case TABS.COMPRAR:
            return <div className="py-6"><Comprar contract={contract} cuenta={cuenta} /></div>;
        case TABS.LISTA:
        default:
            return <div className="py-6"><ListaAutos contract={contract} cuenta={cuenta} /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER/NAVBAR */}
      <header className="sticky top-0 z-20 bg-white shadow-md p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-600">Car Market DApp</h1>
          
          {!cuenta ? (
            <button
              onClick={conectarWallet}
              disabled={isLoading}
              className={`
                bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg 
                hover:bg-blue-700 transition-colors shadow-lg
                ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  Conectando...
                </div>
              ) : (
                "Conectar Wallet"
              )}
            </button>
          ) : (
            /* APLICACIÓN DE DISEÑO DE TARJETA DE CUENTA */
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg flex items-center space-x-3 transition duration-300 hover:shadow-xl hover:border-blue-300"
              >
                <span className="text-xs font-semibold uppercase text-gray-500 hidden sm:inline">
                  Wallet Conectada
                </span>
                <span className="text-sm font-mono text-blue-600 bg-blue-50 py-1 px-3 rounded-lg border border-blue-200">
                  {shortenAddress(cuenta)}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú desplegable */}
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
                  {/* Header del modal */}
                  <div className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-sm p-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Información de la Cuenta</h3>
                    <button
                      onClick={() => setShowAccountMenu(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    {/* Cuenta */}
                    <div className="bg-gray-100/50 backdrop-blur-sm rounded-lg p-3 mb-4 border border-gray-200/50">
                      <label className="text-sm text-gray-600 block mb-1">Cuenta</label>
                      <p className="text-gray-900 font-mono text-sm break-all">{cuenta}</p>
                    </div>

                    {/* Grid de información */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Balance */}
                      <div className="bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-blue-300/30">
                        <p className="text-4xl font-bold text-white mb-1">{accountInfo.balance}</p>
                        <p className="text-sm text-blue-50">ETH Saldo</p>
                      </div>

                      {/* Autos Publicados */}
                      <div className="bg-gradient-to-br from-purple-500/80 to-purple-600/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-purple-300/30">
                        <p className="text-4xl font-bold text-white mb-1">{accountInfo.autosPublicados}</p>
                        <p className="text-sm text-purple-50">Autos Publicados</p>
                      </div>

                      {/* Autos Comprados */}
                      <div className="bg-gradient-to-br from-green-500/80 to-green-600/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-green-300/30">
                        <p className="text-4xl font-bold text-white mb-1">{accountInfo.autosComprados}</p>
                        <p className="text-sm text-green-50">Autos Comprados</p>
                      </div>

                      {/* Autos Vendidos */}
                      <div className="bg-gradient-to-br from-orange-500/80 to-orange-600/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-orange-300/30">
                        <p className="text-4xl font-bold text-white mb-1">{accountInfo.autosVendidos}</p>
                        <p className="text-sm text-orange-50">Autos Vendidos</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL Y TABS */}
      {contract && (
        <main 
          className={`
            max-w-7xl mx-auto p-6 mt-6
            transition-all duration-700 ease-out
            ${showContent 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }
          `}
        >
            {/* BARRA DE TABS */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {Object.values(TABS).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg 
                                transition-colors duration-200
                                ${activeTab === tab 
                                    ? 'border-blue-600 text-blue-600 font-bold' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
            <div 
                key={activeTab}
                className="transition-all duration-500 ease-out opacity-0 scale-95 animate-fadeIn"
                style={{
                    animation: 'fadeIn 0.5s ease-out forwards'
                }}
            >
                {renderContent()}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>

        </main>
      )}

      {!cuenta && !isLoading && (
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
            <p className="text-xl text-gray-500">
                Conecta tu wallet para acceder al Car Market.
            </p>
        </div>
      )}
    </div>
  );
}