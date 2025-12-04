import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import PublicarAuto from "./components/PublicarAuto";
import ListaAutos from "./components/ListaAutos";
import Comprar from "./components/Comprar";

const CONTRACT_ADDRESS = "0x22b8EA1284DdD12cbd76f6C35049d7e63392B962";
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "comprador",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "precio",
        "type": "uint256"
      }
    ],
    "name": "AutoComprado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "marca",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "modelo",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "anio",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "precio",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "vendedor",
        "type": "address"
      }
    ],
    "name": "AutoPublicado",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "comprarAuto",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_marca",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_modelo",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "_anio",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "_precio",
        "type": "uint256"
      }
    ],
    "name": "listarAuto",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "autos",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "marca",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "modelo",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "anio",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "precio",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "vendedor",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "comprador",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "vendido",
        "type": "bool"
      },
      {
        "internalType": "bytes32",
        "name": "transactionHash",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contadorAutos",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAutos",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "marca",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "modelo",
            "type": "string"
          },
          {
            "internalType": "uint16",
            "name": "anio",
            "type": "uint16"
          },
          {
            "internalType": "uint256",
            "name": "precio",
            "type": "uint256"
          },
          {
            "internalType": "address payable",
            "name": "vendedor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "comprador",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "vendido",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "transactionHash",
            "type": "bytes32"
          }
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
  
  // 🔑 CAMBIO 1: Estado para forzar la recarga de ListaAutos
  const [refreshKey, setRefreshKey] = useState(0); 
  
  const [accountInfo, setAccountInfo] = useState({
    balance: "0",
    autosPublicados: 0,
    autosComprados: 0,
    autosVendidos: 0
  });
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false); 

  // 🔑 CAMBIO 2: Función para recargar la lista de autos
  const handleReloadList = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Función para obtener las estadísticas de la cuenta
  const fetchAccountStats = useCallback(async (currentContract, currentCuenta, currentProvider) => {
    if (!currentContract || !currentCuenta || !currentProvider) return;

    try {
        // 1. Obtener Saldo de ETH
        const balance = await currentProvider.getBalance(currentCuenta);
        const balanceInEth = ethers.formatEther(balance);
        
        // 2. Obtener la lista completa de autos y filtrar (conteo en frontend)
        const allAutos = await currentContract.getAutos(); 
        
        let publicados = 0;
        let comprados = 0;
        let vendidos = 0;
        
        const cuentaLower = currentCuenta.toLowerCase();

        for (const auto of allAutos) {
            const vendedorLower = auto.vendedor.toLowerCase();
            const compradorLower = auto.comprador.toLowerCase();
            
            // Autos publicados por la cuenta actual
            if (vendedorLower === cuentaLower) {
                publicados++;
                
                // Autos vendidos (publicados por el usuario actual y marcados como vendidos)
                if (auto.vendido) {
                    vendidos++;
                }
            }
            
            // Autos comprados por la cuenta actual (solo si la venta se completó/vendido=true)
            if (compradorLower === cuentaLower && auto.vendido) {
                comprados++;
            }
        }

        setAccountInfo({
            balance: parseFloat(balanceInEth).toFixed(4),
            autosPublicados: publicados,
            autosComprados: comprados,
            autosVendidos: vendidos
        });
        
        // 🔑 CAMBIO ADICIONAL: Si se recargan las estadísticas, recarga también la lista de autos
        // Esto asegura que la lista se actualice después de un cambio de cuenta o inicialización.
        handleReloadList();

    } catch (error) {
        console.error("Error al obtener estadísticas de la cuenta:", error);
    }
  }, [handleReloadList]); // Añadir handleReloadList a las dependencias de useCallback

  // useEffect para inicializar el provider y manejar clics fuera del menú
  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
    }

    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.relative')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);

  // useEffect para escuchar eventos del contrato y actualizar las estadísticas
  useEffect(() => {
    if (!contract || !cuenta || !provider) return;

    // Usamos el provider para la escucha de eventos, es más ligero que el signer.
    const contractListener = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const handleContractEvent = () => {
        // Recargar las estadísticas cada vez que un auto es publicado o comprado.
        console.log("Evento de contrato detectado. Recargando estadísticas de cuenta y lista de autos...");
        fetchAccountStats(contract, cuenta, provider); 
        // handleReloadList() ya se llama dentro de fetchAccountStats, no es necesario aquí.
    };

    // Escuchar los eventos relevantes
    contractListener.on("AutoPublicado", handleContractEvent);
    contractListener.on("AutoComprado", handleContractEvent);

    // Función de limpieza
    return () => {
        contractListener.off("AutoPublicado", handleContractEvent);
        contractListener.off("AutoComprado", handleContractEvent);
    };
  }, [contract, cuenta, provider, fetchAccountStats]);


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
      // Pedir cuentas a MetaMask
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 1) {
        setAvailableAccounts(accounts);
        setShowAccountSelector(true);
        setIsLoading(false);
      } else {
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
      
      // Obtener el Signer
      // Nota: getSigner() obtiene el signer de la cuenta seleccionada en MetaMask.
      const signer = await provider.getSigner(); 
      
      // Inicializar el contrato con el Signer para transacciones
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setSigner(signer);
      setCuenta(selectedAccount);
      setContract(contractInstance);
      
      // Cargar las estadísticas de la cuenta por primera vez (esto también recarga la lista)
      await fetchAccountStats(contractInstance, selectedAccount, provider);
      
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
    // Resetear la clave al desconectar es buena práctica, aunque no estrictamente necesario
    setRefreshKey(0); 
  };
  
  const renderContent = () => {
    if (!contract) return null;
    
    // 🔑 CAMBIO 3: Pasar la función handleReloadList a PublicarAuto y Comprar
    // y pasar refreshKey a ListaAutos
    switch (activeTab) {
        case TABS.PUBLICAR:
            return <div className="py-6"><PublicarAuto contract={contract} cuenta={cuenta} onPublicacionExitosa={handleReloadList} /></div>;
        case TABS.COMPRAR:
            return <div className="py-6"><Comprar contract={contract} cuenta={cuenta} onCompraExitosa={handleReloadList} /></div>;
        case TABS.LISTA:
        default:
            return <div className="py-6"><ListaAutos contract={contract} cuenta={cuenta} refreshKey={refreshKey} /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      
      {/* HEADER/NAVBAR MEJORADO */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* LOGO MEJORADO */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Car Market
              </h1>
              <p className="text-xs text-gray-500 font-medium">Blockchain Marketplace</p>
            </div>
          </div>
          
          {!cuenta ? (
            <button
              onClick={conectarWallet}
              disabled={isLoading}
              className={`
                relative overflow-hidden group
                bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl 
                hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl
                transform hover:scale-105
                ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Conectar Wallet
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-4 shadow-xl flex items-center space-x-3 transition-all duration-300 hover:shadow-2xl hover:border-blue-400 hover:scale-105"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Conectado
                  </span>
                  <span className="text-xs text-green-600 font-semibold flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Activo
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-mono text-sm font-bold py-2 px-4 rounded-xl shadow-lg">
                  {shortenAddress(cuenta)}
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${showAccountMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* MENÚ DESPLEGABLE MEJORADO */}
              {showAccountMenu && (
                <div className="absolute right-0 mt-4 w-[420px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden animate-slideDown">
                  {/* HEADER DEL MODAL */}
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">Mi Cuenta</h3>
                        <p className="text-blue-100 text-sm font-medium">Información del usuario</p>
                      </div>
                      <button
                        onClick={() => setShowAccountMenu(false)}
                        className="text-white/80 hover:text-white transition-colors hover:bg-white/20 rounded-lg p-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* CONTENIDO */}
                  <div className="p-6 space-y-5">
                    {/* DIRECCIÓN */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 shadow-inner">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Dirección</label>
                      <p className="text-gray-900 font-mono text-sm break-all bg-white px-3 py-2 rounded-lg border border-gray-200">{cuenta}</p>
                    </div>

                    {/* GRID DE ESTADÍSTICAS */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* BALANCE */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                          <p className="text-4xl font-black text-white mb-1">{accountInfo.balance}</p>
                          <p className="text-sm text-blue-100 font-semibold flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ETH Balance
                          </p>
                        </div>
                      </div>

                      {/* PUBLICADOS */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                        <div className="relative z-10">
                          <p className="text-4xl font-black text-white mb-1">{accountInfo.autosPublicados}</p>
                          <p className="text-sm text-purple-100 font-semibold flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Publicados
                          </p>
                        </div>
                      </div>

                      {/* COMPRADOS */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10"></div>
                        <div className="relative z-10">
                          <p className="text-4xl font-black text-white mb-1">{accountInfo.autosComprados}</p>
                          <p className="text-sm text-green-100 font-semibold flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Comprados
                          </p>
                        </div>
                      </div>

                      {/* VENDIDOS */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mb-8"></div>
                        <div className="relative z-10">
                          <p className="text-4xl font-black text-white mb-1">{accountInfo.autosVendidos}</p>
                          <p className="text-sm text-orange-100 font-semibold flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Vendidos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* BOTÓN DE DESCONEXIÓN AÑADIDO */}
                  <div className="p-6 pt-0">
                    <button
                        onClick={desconectarWallet}
                        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-3m3-10V4a3 3 0 013-3h4a3 3 0 013 3v3" />
                        </svg>
                        <span>Desconectar Wallet</span>
                    </button>
                  </div>
                  {/* FIN BOTÓN DE DESCONEXIÓN */}

                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      {contract && (
        <main 
          className={`
            max-w-7xl mx-auto px-6 py-8
            transition-all duration-700 ease-out
            ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* TABS MEJORADOS */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-2 mb-8">
            <nav className="flex space-x-2" aria-label="Tabs">
              {Object.entries(TABS).map(([key, label]) => {
                const icons = {
                  LISTA: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  ),
                  PUBLICAR: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                  COMPRAR: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )
                };

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(label)}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-bold text-base
                      transition-all duration-300 transform
                      ${activeTab === label 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }
                    `}
                  >
                    {icons[key]}
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* CONTENIDO DE LA PESTAÑA */}
          <div 
            key={activeTab}
            className="animate-fadeIn"
          >
            {renderContent()}
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-out;
            }
            .animate-slideDown {
              animation: slideDown 0.3s ease-out;
            }
          `}</style>
        </main>
      )}

      {!cuenta && !isLoading && (
        <div className="relative min-h-[calc(100vh-120px)] overflow-hidden">
          {/* BACKGROUND ANIMADO */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="relative z-10 flex flex-col justify-center items-center min-h-[calc(100vh-120px)] px-4 py-12">
            <div className="text-center space-y-8 max-w-5xl mx-auto">
              
              {/* LOGO GRANDE ANIMADO */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              {/* TÍTULO PRINCIPAL */}
              <div className="space-y-4">
                <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-tight">
                  Car Market
                </h1>
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
                  <p className="text-xl md:text-2xl font-bold text-gray-600 uppercase tracking-wider">
                    Blockchain Marketplace
                  </p>
                  <div className="h-1 w-20 bg-gradient-to-l from-purple-600 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                El futuro de la compra-venta de automóviles está aquí. 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold"> Transacciones seguras, transparentes y descentralizadas</span> en la blockchain de Ethereum.
              </p>

              {/* CARACTERÍSTICAS */}
              <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="group bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">100% Seguro</h3>
                  <p className="text-gray-600">Contratos inteligentes verificados en Ethereum</p>
                </div>

                <div className="group bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">Ultra Rápido</h3>
                  <p className="text-gray-600">Transacciones instantáneas en la blockchain</p>
                </div>

                <div className="group bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">Transparente</h3>
                  <p className="text-gray-600">Todas las transacciones son públicas y verificables</p>
                </div>
              </div>

              {/* BOTÓN CTA */}
              <div className="pt-8">
                <button
                  onClick={conectarWallet}
                  className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-black text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative flex items-center space-x-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Conectar con MetaMask</span>
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  ¿No tienes MetaMask? 
                  <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-bold hover:text-purple-700 ml-1">
                    Descárgalo aquí →
                  </a>
                </p>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">∞</div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">Transacciones</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">100%</div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">Seguro</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">Disponible</div>
                </div>
              </div>

            </div>
          </div>

          {/* ESTILOS ADICIONALES */}
          <style>{`
            @keyframes blob {
              0%, 100% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(20px, -20px) scale(1.1); }
              50% { transform: translate(-20px, 20px) scale(0.9); }
              75% { transform: translate(20px, 20px) scale(1.05); }
            }
            @keyframes gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
            .animate-gradient {
              background-size: 200% 200%;
              animation: gradient 5s ease infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}