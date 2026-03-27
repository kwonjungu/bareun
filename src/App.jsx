import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, setDoc } from 'firebase/firestore';

// --- Icon Components (lucide-react 의존성 에러 해결을 위해 내장 SVG로 완전 교체) ---
const Icon = ({ name, size = 24, className = '', strokeWidth = 2 }) => {
  const paths = {
    Check: <polyline points="20 6 9 17 4 12" />,
    ChevronLeft: <polyline points="15 18 9 12 15 6" />,
    Minus: <line x1="5" y1="12" x2="19" y2="12" />,
    Plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    ShoppingBag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
    User: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    CheckCircle2: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
    Package: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    History: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 15 15" /></>,
    Settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    PlusCircle: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    Trash2: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    List: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    Camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
    Lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// 사용할 아이콘들을 컴포넌트화
const Check = (p) => <Icon name="Check" {...p}/>;
const ChevronLeft = (p) => <Icon name="ChevronLeft" {...p}/>;
const Minus = (p) => <Icon name="Minus" {...p}/>;
const Plus = (p) => <Icon name="Plus" {...p}/>;
const ShoppingBag = (p) => <Icon name="ShoppingBag" {...p}/>;
const User = (p) => <Icon name="User" {...p}/>;
const CheckCircle2 = (p) => <Icon name="CheckCircle2" {...p}/>;
const Package = (p) => <Icon name="Package" {...p}/>;
const History = (p) => <Icon name="History" {...p}/>;
const Settings = (p) => <Icon name="Settings" {...p}/>;
const PlusCircle = (p) => <Icon name="PlusCircle" {...p}/>;
const Trash2 = (p) => <Icon name="Trash2" {...p}/>;
const List = (p) => <Icon name="List" {...p}/>;
const Camera = (p) => <Icon name="Camera" {...p}/>;
const Lock = (p) => <Icon name="Lock" {...p}/>;

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyA7UWJVLJ8cmbNdPagEC9FrpUAIb4zPY48",
  authDomain: "schoolgymmanager.firebaseapp.com",
  projectId: "schoolgymmanager",
  storageBucket: "schoolgymmanager.firebasestorage.app",
  messagingSenderId: "518385351559",
  appId: "1:518385351559:web:e3ea5fd7fcde209a343122"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DB Collection Paths
const getEquipmentsRef = () => collection(db, 'equipments');
const getTransactionsRef = () => collection(db, 'transactions');

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [equipments, setEquipments] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // UI States
  const [view, setView] = useState('home');
  const [successMessage, setSuccessMessage] = useState('');

  // Borrow Flow States
  const [selectedItems, setSelectedItems] = useState({});
  const [borrowerType, setBorrowerType] = useState('select');
  const [borrowerGrade, setBorrowerGrade] = useState('1');
  const [borrowerClass, setBorrowerClass] = useState('1');
  const [borrowerManual, setBorrowerManual] = useState('');

  // Return Flow States
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  // Admin States
  const [newEqName, setNewEqName] = useState('');
  const [newEqImage, setNewEqImage] = useState('');
  const [newEqQty, setNewEqQty] = useState(1);
  const [newEqTracked, setNewEqTracked] = useState(true);
  const [adminPwdInput, setAdminPwdInput] = useState('');

  // Admin Password Management States
  const [actualAdminPwd, setActualAdminPwd] = useState('0000');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmPwdInput, setConfirmPwdInput] = useState('');

  // Tailwind CSS CDN
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  // --- 1. Authentication ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenError) {
            console.warn('Token mismatch (using custom DB). Falling back to anonymous auth.');
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Data Fetching & Seeding ---
  useEffect(() => {
    if (!user) return;

    let unsubEquipments;
    let unsubTransactions;
    let unsubAdminConfig;

    try {
      unsubEquipments = onSnapshot(
        getEquipmentsRef(),
        (snapshot) => {
          const eqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEquipments(eqData);

          if (eqData.length === 0 && snapshot.metadata.fromCache === false) {
            seedInitialEquipments();
          }
        },
        (err) => console.error("Equipments fetch error:", err)
      );

      unsubTransactions = onSnapshot(
        getTransactionsRef(),
        (snapshot) => {
          setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        },
        (err) => console.error("Transactions fetch error:", err)
      );

      unsubAdminConfig = onSnapshot(
        doc(db, 'config', 'admin'),
        (docSnap) => {
          if (docSnap.exists() && docSnap.data().password) {
            setActualAdminPwd(docSnap.data().password);
          }
        },
        (err) => console.error("Admin config fetch error:", err)
      );
    } catch (error) {
      console.error("Firestore subscription error:", error);
    }

    return () => {
      if (unsubEquipments) unsubEquipments();
      if (unsubTransactions) unsubTransactions();
      if (unsubAdminConfig) unsubAdminConfig();
    };
  }, [user]);

  const seedInitialEquipments = async () => {
    const initialData = [
      { name: '농구공', imageUrl: '🏀', totalQuantity: 15, isQuantityTracked: true },
      { name: '축구공', imageUrl: '⚽', totalQuantity: 12, isQuantityTracked: true },
      { name: '배구공', imageUrl: '🏐', totalQuantity: 10, isQuantityTracked: true },
      { name: '뜀틀 세트', imageUrl: '🤸', totalQuantity: 2, isQuantityTracked: false },
      { name: '줄넘기', imageUrl: '➰', totalQuantity: 30, isQuantityTracked: true },
      { name: '팀 조끼 (세트)', imageUrl: '🎽', totalQuantity: 4, isQuantityTracked: true }
    ];
    for (const item of initialData) {
      await addDoc(getEquipmentsRef(), item);
    }
  };

  // --- 3. Derived State & Helpers ---
  const activeTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'borrowed').sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const getAvailableQuantity = (equipmentId) => {
    const eq = equipments.find(e => e.id === equipmentId);
    if (!eq) return 0;

    const borrowedCount = activeTransactions
      .filter(t => t.equipmentId === equipmentId)
      .reduce((sum, t) => sum + t.borrowedQuantity, 0);

    return eq.totalQuantity - borrowedCount;
  };

  // --- Image Handling Helpers ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewEqImage(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const renderIcon = (url, name) => {
    if (!url) return <span className="text-gray-400">📦</span>;
    if (url.startsWith('http') || url.startsWith('data:')) {
      return <img src={url} alt={name} className="w-full h-full object-contain drop-shadow-sm rounded-md" />;
    }
    return <span>{url}</span>;
  };

  // --- 4. Handlers ---
  const handleBorrowSubmit = async () => {
    let finalBorrowerName = '';
    if (borrowerType === 'select') {
      finalBorrowerName = `${borrowerGrade}학년 ${borrowerClass}반`;
    } else {
      if (!borrowerManual.trim()) return alert('이름을 입력해주세요.');
      finalBorrowerName = borrowerManual.trim();
    }

    try {
      setLoading(true);
      const promises = Object.entries(selectedItems).map(([eqId, qty]) => {
        if (qty > 0) {
          return addDoc(getTransactionsRef(), {
            equipmentId: eqId,
            borrowerName: finalBorrowerName,
            borrowedQuantity: qty,
            status: 'borrowed',
            timestamp: serverTimestamp()
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      setSelectedItems({});
      setBorrowerManual('');
      showSuccess('대여가 완료되었습니다!');
    } catch (error) {
      console.error("Borrow error:", error);
      alert('대여 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async () => {
    try {
      setLoading(true);
      const promises = selectedTransactions.map(txId => {
        const txRef = doc(db, 'transactions', txId);
        return updateDoc(txRef, {
          status: 'returned',
          returnTimestamp: serverTimestamp()
        });
      });

      await Promise.all(promises);

      setSelectedTransactions([]);
      showSuccess('반납이 완료되었습니다!');
    } catch (error) {
      console.error("Return error:", error);
      alert('반납 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async () => {
    if (!newEqName.trim()) return;
    try {
      setLoading(true);
      await addDoc(getEquipmentsRef(), {
        name: newEqName.trim(),
        imageUrl: newEqImage || '📦',
        totalQuantity: Number(newEqQty),
        isQuantityTracked: newEqTracked
      });
      setNewEqName('');
      setNewEqImage('');
      setNewEqQty(1);
      showSuccess('새 물품이 추가되었습니다!');
    } catch (error) {
      console.error("Add equipment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'equipments', id));
      showSuccess('물품이 삭제되었습니다.');
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setView('success');
    setTimeout(() => {
      setView('home');
      setSuccessMessage('');
    }, 2000);
  };

  // --- 5. UI Components ---

  if (loading && view === 'home') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-gray-50 shadow-2xl overflow-hidden relative font-sans">

      {/* Header (Hidden on Home/Success) */}
      {view !== 'home' && view !== 'success' && (
        <header className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
          <button
            onClick={() => {
              if (view === 'borrow_qty') setView('borrow_select');
              else if (view === 'borrow_user') setView('borrow_qty');
              else if (view === 'admin_equipments' || view === 'admin_history' || view === 'admin_settings') setView('admin_home');
              else if (view === 'admin_auth') setView('home');
              else {
                setView('home');
                setSelectedItems({});
                setSelectedTransactions([]);
                setAdminPwdInput('');
              }
            }}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="ml-2 text-lg font-bold text-gray-800">
            {view.startsWith('borrow') ? '물품 대여하기' :
             view.startsWith('return') ? '물품 반납하기' :
             view === 'admin_auth' ? '관리자 인증' :
             view === 'admin_home' ? '관리자 모드' :
             view === 'admin_settings' ? '관리자 설정' :
             view === 'admin_equipments' ? '물품 마스터 관리' :
             view === 'admin_history' ? '전체 대여 기록' : ''}
          </h1>
        </header>
      )}

      <main className="pb-24">
        {/* --- HOME VIEW --- */}
        {view === 'home' && (
          <div className="flex flex-col h-screen p-6 justify-center relative">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">체육관 물품 관리</h1>
              <p className="text-gray-500 mt-3 md:text-lg">쉽고 빠른 대여/반납 시스템</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl mx-auto">
              <button
                onClick={() => setView('borrow_select')}
                className="flex-1 py-12 md:py-16 bg-green-500 hover:bg-green-600 active:scale-95 transition-all rounded-3xl p-6 shadow-lg shadow-green-500/30 flex flex-col items-center justify-center space-y-4 group"
              >
                <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
                  <Package size={56} className="text-white md:w-20 md:h-20" />
                </div>
                <span className="text-3xl md:text-4xl font-bold text-white tracking-wide">대여하기</span>
              </button>

              <button
                onClick={() => setView('return_select')}
                className="flex-1 py-12 md:py-16 bg-red-500 hover:bg-red-600 active:scale-95 transition-all rounded-3xl p-6 shadow-lg shadow-red-500/30 flex flex-col items-center justify-center space-y-4 group"
              >
                <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
                  <History size={56} className="text-white md:w-20 md:h-20" />
                </div>
                <span className="text-3xl md:text-4xl font-bold text-white tracking-wide">반납하기</span>
              </button>
            </div>

            {/* Admin Button */}
            <button
              onClick={() => setView('admin_auth')}
              className="absolute top-6 right-6 p-3 text-gray-400 hover:text-gray-700 bg-white rounded-full shadow-sm transition-all md:w-14 md:h-14 flex items-center justify-center"
            >
              <Settings size={26} />
            </button>
          </div>
        )}

        {/* --- ADMIN AUTH VIEW --- */}
        {view === 'admin_auth' && (
          <div className="p-6 flex flex-col items-center justify-center mt-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm text-center mx-auto">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">관리자 인증</h2>
              <p className="text-gray-500 text-sm mb-6">비밀번호를 입력해주세요.<br/>(초기 비밀번호: 0000)</p>

              <input
                type="password"
                placeholder="비밀번호 입력"
                value={adminPwdInput}
                onChange={(e) => setAdminPwdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (adminPwdInput === actualAdminPwd) {
                      setView('admin_home');
                      setAdminPwdInput('');
                    } else {
                      alert('비밀번호가 일치하지 않습니다.');
                    }
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 text-center text-2xl tracking-widest font-bold rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none mb-4"
              />

              <button
                onClick={() => {
                  if (adminPwdInput === actualAdminPwd) {
                    setView('admin_home');
                    setAdminPwdInput('');
                  } else {
                    alert('비밀번호가 일치하지 않습니다.');
                  }
                }}
                className="w-full bg-gray-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-colors hover:bg-gray-900 active:scale-95"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* --- BORROW STEP 1: Select Items --- */}
        {view === 'borrow_select' && (
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium text-gray-500 mb-4 px-1">대여할 물품을 선택해주세요 (다중 선택 가능)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {equipments.map((eq) => {
                const available = getAvailableQuantity(eq.id);
                const isUnavailable = available <= 0;
                const isSelected = selectedItems[eq.id] > 0;

                return (
                  <button
                    key={eq.id}
                    disabled={isUnavailable}
                    onClick={() => {
                      setSelectedItems(prev => {
                        const newItems = { ...prev };
                        if (newItems[eq.id]) delete newItems[eq.id];
                        else newItems[eq.id] = 1;
                        return newItems;
                      });
                    }}
                    className={`relative p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                      isUnavailable
                        ? 'bg-gray-200 border-gray-200 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'bg-green-50 border-green-500 shadow-md'
                          : 'bg-white border-transparent shadow-sm hover:shadow-md active:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-sm">
                        <Check size={20} strokeWidth={3} />
                      </div>
                    )}

                    <div className="w-24 h-24 md:w-32 md:h-32 mb-4 flex items-center justify-center text-7xl md:text-8xl">
                      {renderIcon(eq.imageUrl, eq.name)}
                    </div>
                    <h3 className={`font-bold text-lg md:text-xl text-center ${isUnavailable ? 'text-gray-500' : 'text-gray-800'}`}>{eq.name}</h3>
                    <p className={`text-sm md:text-base mt-1 ${isUnavailable ? 'text-gray-400' : 'text-green-600 font-medium'}`}>
                      {isUnavailable ? '대여 불가' : `남은 수량: ${available}개`}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10">
              <button
                disabled={Object.keys(selectedItems).length === 0}
                onClick={() => setView('borrow_qty')}
                className="w-full bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center"
              >
                다음 단계로 <ChevronLeft size={20} className="rotate-180 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* --- BORROW STEP 2: Adjust Quantity --- */}
        {view === 'borrow_qty' && (
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <p className="text-sm md:text-base font-medium text-gray-500 mb-4 px-1">대여할 수량을 확인 및 조정해주세요</p>

            {Object.keys(selectedItems).map(eqId => {
              const eq = equipments.find(e => e.id === eqId);
              const available = getAvailableQuantity(eqId);
              const qty = selectedItems[eqId];

              return (
                <div key={eqId} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-5xl md:text-6xl shrink-0">
                      {renderIcon(eq?.imageUrl, eq?.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg md:text-xl text-gray-800">{eq?.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">최대 {available}개 가능</p>
                    </div>
                  </div>

                  {eq?.isQuantityTracked ? (
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                      <button
                        onClick={() => setSelectedItems(prev => ({ ...prev, [eqId]: Math.max(1, qty - 1) }))}
                        className="p-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      >
                        <Minus size={24} />
                      </button>
                      <span className="w-12 text-center font-bold text-xl">{qty}</span>
                      <button
                        onClick={() => setSelectedItems(prev => ({ ...prev, [eqId]: Math.min(available, qty + 1) }))}
                        className="p-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50 text-green-700 font-bold px-4 py-2 rounded-lg text-sm border border-green-100">
                      수량 입력 없음 (1)
                    </div>
                  )}
                </div>
              );
            })}

            <div className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10">
              <button
                onClick={() => setView('borrow_user')}
                className="w-full bg-green-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center"
              >
                다음 단계로 <ChevronLeft size={20} className="rotate-180 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* --- BORROW STEP 3: Borrower Info --- */}
        {view === 'borrow_user' && (
          <div className="p-4 md:p-6 space-y-6">
            <p className="text-sm md:text-base font-medium text-gray-500 px-1">누가 빌리는지 알려주세요</p>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setBorrowerType('select')}
                  className={`flex-1 py-3 md:py-4 rounded-lg text-sm md:text-base font-bold transition-all ${borrowerType === 'select' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                >
                  학년 / 반 선택
                </button>
                <button
                  onClick={() => setBorrowerType('manual')}
                  className={`flex-1 py-3 md:py-4 rounded-lg text-sm md:text-base font-bold transition-all ${borrowerType === 'manual' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                >
                  직접 입력
                </button>
              </div>

              {borrowerType === 'select' ? (
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs md:text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">학년 (Grade)</label>
                    <div className="relative">
                      <select
                        value={borrowerGrade}
                        onChange={(e) => setBorrowerGrade(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-lg md:text-xl font-bold rounded-xl p-4 md:p-5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}학년</option>)}
                      </select>
                      <ChevronLeft size={20} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs md:text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">반 (Class)</label>
                    <div className="relative">
                      <select
                        value={borrowerClass}
                        onChange={(e) => setBorrowerClass(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-lg md:text-xl font-bold rounded-xl p-4 md:p-5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c}반</option>)}
                      </select>
                      <ChevronLeft size={20} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">이름 또는 부서 입력</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input
                      type="text"
                      placeholder="예) 홍길동 선생님, 학생회"
                      value={borrowerManual}
                      onChange={(e) => setBorrowerManual(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-lg md:text-xl font-bold rounded-xl p-4 md:p-5 pl-12 md:pl-14 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 md:p-6 mt-6">
              <h4 className="text-green-800 font-bold mb-3 flex items-center text-sm md:text-base">
                <ShoppingBag size={18} className="mr-2" /> 대여 요약
              </h4>
              <ul className="space-y-2 text-sm md:text-base text-green-700">
                {Object.entries(selectedItems).map(([eqId, qty]) => {
                  const eq = equipments.find(e => e.id === eqId);
                  return <li key={eqId} className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span> {eq?.name} <span className="font-bold ml-2">{qty}개</span></li>;
                })}
              </ul>
            </div>

            <div className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10">
              <button
                onClick={handleBorrowSubmit}
                disabled={loading}
                className="w-full bg-green-500 disabled:bg-green-400 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center"
              >
                {loading ? '처리 중...' : '대여 완료하기'}
              </button>
            </div>
          </div>
        )}

        {/* --- RETURN VIEW --- */}
        {view === 'return_select' && (
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium text-gray-500 mb-4 px-1">현재 대여 중인 항목입니다. 반납할 항목을 선택하세요.</p>

            {activeTransactions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={48} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">모두 반납됨</h3>
                <p className="text-gray-500 mt-2 md:text-lg">현재 대여 중인 물품이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:space-y-0">
                {activeTransactions.map((tx) => {
                  const eq = equipments.find(e => e.id === tx.equipmentId);
                  const isSelected = selectedTransactions.includes(tx.id);
                  const dateStr = tx.timestamp?.toDate ? new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(tx.timestamp.toDate()) : '';

                  return (
                    <button
                      key={tx.id}
                      onClick={() => {
                        setSelectedTransactions(prev =>
                          prev.includes(tx.id) ? prev.filter(id => id !== tx.id) : [...prev, tx.id]
                        );
                      }}
                      className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 flex items-center transition-all ${
                        isSelected
                          ? 'bg-red-50 border-red-500 shadow-md'
                          : 'bg-white border-gray-100 shadow-sm hover:border-red-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${
                        isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                      </div>

                      <div className="w-20 h-20 md:w-24 md:h-24 mr-4 bg-gray-50 p-2 rounded-xl shrink-0 flex items-center justify-center text-5xl md:text-6xl">
                        {renderIcon(eq?.imageUrl, eq?.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg md:text-xl text-gray-800 truncate">{eq?.name || '알 수 없는 물품'} <span className="text-red-500 ml-1">{tx.borrowedQuantity}개</span></h3>
                        </div>
                        <div className="flex items-center text-sm md:text-base text-gray-500 space-x-2">
                          <span className="flex items-center"><User size={14} className="mr-1" /> {tx.borrowerName}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTransactions.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10">
                <button
                  disabled={selectedTransactions.length === 0 || loading}
                  onClick={handleReturnSubmit}
                  className="w-full bg-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center"
                >
                  {loading ? '처리 중...' : `선택한 ${selectedTransactions.length}건 반납 완료`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- ADMIN HOME --- */}
        {view === 'admin_home' && (
          <div className="p-4 md:p-6 space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 md:gap-6 md:space-y-0">
            <button
              onClick={() => setView('admin_equipments')}
              className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:border-gray-300 transition-all"
            >
              <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Package size={32} /></div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">물품 마스터 관리</h3>
                <p className="text-sm md:text-base text-gray-500 mt-1">새로운 교구 추가 및 기존 물품 삭제</p>
              </div>
            </button>

            <button
              onClick={() => setView('admin_history')}
              className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:border-gray-300 transition-all"
            >
              <div className="bg-purple-100 p-4 rounded-full text-purple-600"><List size={32} /></div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">전체 대여 기록</h3>
                <p className="text-sm md:text-base text-gray-500 mt-1">모든 대여 및 반납 히스토리 조회</p>
              </div>
            </button>

            <button
              onClick={() => setView('admin_settings')}
              className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:border-gray-300 transition-all md:col-span-2"
            >
              <div className="bg-gray-100 p-4 rounded-full text-gray-600"><Lock size={32} /></div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">관리자 설정</h3>
                <p className="text-sm md:text-base text-gray-500 mt-1">관리자 비밀번호 변경</p>
              </div>
            </button>
          </div>
        )}

        {/* --- ADMIN SETTINGS --- */}
        {view === 'admin_settings' && (
          <div className="p-4 md:p-6 space-y-6">
            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center text-lg md:text-xl">
                <Lock size={22} className="mr-2 text-gray-600"/> 관리자 비밀번호 변경
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">새 비밀번호</label>
                  <input
                    type="password"
                    value={newPwdInput}
                    onChange={(e) => setNewPwdInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg font-bold outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="새 비밀번호 입력"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPwdInput}
                    onChange={(e) => setConfirmPwdInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg font-bold outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="새 비밀번호 다시 입력"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newPwdInput) return alert('변경할 비밀번호를 입력해주세요.');
                    if (newPwdInput !== confirmPwdInput) return alert('새 비밀번호가 일치하지 않습니다.');
                    try {
                      setLoading(true);
                      await setDoc(doc(db, 'config', 'admin'), { password: newPwdInput }, { merge: true });
                      setNewPwdInput('');
                      setConfirmPwdInput('');
                      showSuccess('비밀번호가 변경되었습니다!');
                    } catch(e) {
                      console.error("Password update error:", e);
                      alert('비밀번호 변경 중 오류가 발생했습니다.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full mt-6 bg-gray-800 text-white text-lg font-bold py-4 rounded-xl hover:bg-gray-900 active:scale-95 transition-transform"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ADMIN EQUIPMENTS --- */}
        {view === 'admin_equipments' && (
          <div className="p-4 md:p-6 space-y-6">
            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg md:text-xl"><PlusCircle size={22} className="mr-2 text-blue-500"/> 새 물품 추가</h3>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shrink-0 overflow-hidden relative">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    {newEqImage ? (
                      <img src={newEqImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera size={28} className="text-gray-400" />
                        <span className="text-xs md:text-sm text-gray-400 mt-1 font-bold">사진</span>
                      </div>
                    )}
                  </label>
                  <input type="text" placeholder="물품명 (예: 배드민턴 채)" value={newEqName} onChange={e => setNewEqName(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg md:text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 text-sm md:text-base font-medium text-gray-600">총 보유 수량</label>
                  <input type="number" min="1" value={newEqQty} onChange={e => setNewEqQty(e.target.value)} className="w-28 bg-gray-50 border border-gray-200 rounded-xl p-3 text-lg text-center font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <label className="flex items-center space-x-3 text-sm md:text-base text-gray-600 pt-2">
                  <input type="checkbox" checked={newEqTracked} onChange={e => setNewEqTracked(e.target.checked)} className="w-6 h-6 rounded text-blue-500" />
                  <span>수량 선택 기능 켜기 (체크 해제 시 1개 고정)</span>
                </label>
                <button onClick={handleAddEquipment} className="w-full mt-6 bg-blue-500 text-white text-lg font-bold py-4 rounded-xl hover:bg-blue-600 active:scale-95 transition-transform">추가하기</button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 px-1 text-lg">등록된 물품 목록</h3>
              {equipments.map(eq => (
                <div key={eq.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-5xl md:text-6xl shrink-0">
                      {renderIcon(eq.imageUrl, eq.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{eq.name}</h4>
                      <p className="text-sm text-gray-500">총 {eq.totalQuantity}개 {eq.isQuantityTracked ? '' : '(수량 입력 없음)'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEquipment(eq.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ADMIN HISTORY --- */}
        {view === 'admin_history' && (
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            <p className="text-sm md:text-base font-medium text-gray-500 mb-4 px-1">모든 대여 및 반납 기록입니다.</p>
            {transactions.slice().sort((a,b) => b.timestamp - a.timestamp).map(tx => {
              const eq = equipments.find(e => e.id === tx.equipmentId);
              const isReturned = tx.status === 'returned';
              const dateStr = tx.timestamp?.toDate ? new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(tx.timestamp.toDate()) : '';

              return (
                <div key={tx.id} className={`p-4 md:p-6 rounded-2xl border ${isReturned ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-green-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs md:text-sm font-bold px-2 py-1 rounded-md ${isReturned ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {isReturned ? '반납완료' : '대여중'}
                    </span>
                    <span className="text-sm text-gray-400">{dateStr}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 mr-4 flex items-center justify-center text-4xl md:text-5xl shrink-0">
                      {renderIcon(eq?.imageUrl, eq?.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg md:text-xl text-gray-800">{eq?.name || '삭제된 물품'} <span className="text-gray-500 font-normal">x{tx.borrowedQuantity}</span></h4>
                      <p className="text-sm md:text-base text-gray-600 flex items-center mt-1"><User size={16} className="mr-1"/> {tx.borrowerName}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- SUCCESS OVERLAY --- */}
        {view === 'success' && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="bg-green-100 p-6 rounded-full mb-6">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">{successMessage}</h2>
            <p className="text-gray-500 mt-2 font-medium">메인 화면으로 돌아갑니다...</p>
          </div>
        )}

      </main>
    </div>
  );
}
