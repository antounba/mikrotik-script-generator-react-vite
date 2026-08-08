import React, { useState, useEffect } from 'react';
import {
  generateBindingScript,
  generateEditBindingScript,
  generateHapusBindingScript,
  generatePCCScript,
  generateQueueScript
} from './utils/mikrotikGenerators';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Navigation States
  const [activeTab, setActiveTab] = useState('binding'); // 'binding' | 'queue' | 'loadbalance'
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop toggle & Mobile open

  // IP Binding Sub-Tabs
  const [bindingType, setBindingType] = useState('hotspot'); // 'hotspot' | 'dhcp'
  const [bindingAction, setBindingAction] = useState('tambah'); // 'tambah' | 'edit' | 'hapus'

  const [outputScript, setOutputScript] = useState('');
  const [copied, setCopied] = useState(false);

  // Form States - IP Binding
  const [bindings, setBindings] = useState([
    { ip: '', mac: '', name: '', iface: 'bridge', upload: '2', upload_unit: 'M', download: '5', download_unit: 'M', parent: '' }
  ]);
  const [editBindings, setEditBindings] = useState([{ ip: '', mac: '' }]);
  const [hapusBindings, setHapusBindings] = useState([{ ip: '' }]);

  // Form States - Simple Queue & PCC
  const [queues, setQueues] = useState([
    { ip: '', name: '', upload: '2', upload_unit: 'M', download: '5', download_unit: 'M', parent: 'BINDING', comment: '' }
  ]);
  const [modems, setModems] = useState([
    { name: 'ISP1', interface: 'ether1', gateway: '192.168.1.1', bandwidth: '50' }
  ]);
  const [rosVersion, setRosVersion] = useState(6);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ------------ HANDLERS IP BINDING: TAMBAH ------------
  const handleBindingChange = (index, field, value) => {
    const updated = [...bindings];
    updated[index][field] = value;
    setBindings(updated);
  };
  const addBindingRow = () => setBindings([...bindings, { ip: '', mac: '', name: '', iface: 'bridge', upload: '2', upload_unit: 'M', download: '5', download_unit: 'M', parent: '' }]);
  const removeBindingRow = (index) => setBindings(bindings.filter((_, i) => i !== index));

  // ------------ HANDLERS IP BINDING: EDIT ------------
  const handleEditChange = (index, field, value) => {
    const updated = [...editBindings];
    updated[index][field] = value;
    setEditBindings(updated);
  };
  const addEditRow = () => setEditBindings([...editBindings, { ip: '', mac: '' }]);
  const removeEditRow = (index) => setEditBindings(editBindings.filter((_, i) => i !== index));

  // ------------ HANDLERS IP BINDING: HAPUS ------------
  const handleHapusChange = (index, field, value) => {
    const updated = [...hapusBindings];
    updated[index][field] = value;
    setHapusBindings(updated);
  };
  const addHapusRow = () => setHapusBindings([...hapusBindings, { ip: '' }]);
  const removeHapusRow = (index) => setHapusBindings(hapusBindings.filter((_, i) => i !== index));

  // ------------ HANDLERS SIMPLE QUEUE ------------
  const handleQueueChange = (index, field, value) => {
    const updated = [...queues];
    updated[index][field] = value;
    setQueues(updated);
  };
  const addQueueRow = () => setQueues([...queues, { ip: '', name: '', upload: '2', upload_unit: 'M', download: '5', download_unit: 'M', parent: 'BINDING', comment: '' }]);
  const removeQueueRow = (index) => setQueues(queues.filter((_, i) => i !== index));

  // ------------ HANDLERS LOAD BALANCE ------------
  const handleModemChange = (index, field, value) => {
    const updated = [...modems];
    updated[index][field] = value;
    setModems(updated);
  };
  const addModemRow = () => setModems([...modems, { name: `ISP${modems.length + 1}`, interface: `ether${modems.length + 1}`, gateway: '', bandwidth: '50' }]);
  const removeModemRow = (index) => setModems(modems.filter((_, i) => i !== index));

  // ------------ TRIGGER GENERATE SCRIPT ------------
  const handleGenerateTrigger = () => {
    const isHotspot = bindingType === 'hotspot';

    if (activeTab === 'binding') {
      if (bindingAction === 'tambah') {
        setOutputScript(generateBindingScript(bindings, isHotspot));
      } else if (bindingAction === 'edit') {
        setOutputScript(generateEditBindingScript(editBindings, isHotspot));
      } else if (bindingAction === 'hapus') {
        setOutputScript(generateHapusBindingScript(hapusBindings, isHotspot));
      }
    } else if (activeTab === 'queue') {
      setOutputScript(generateQueueScript(queues));
    } else if (activeTab === 'loadbalance') {
      setOutputScript(generatePCCScript(modems, rosVersion));
    }
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { id: 'binding', label: 'IP Binding', icon: '🔗', category: 'IP' },
    { id: 'queue', label: 'Simple Queue', icon: '📊', category: 'Queues' },
    { id: 'loadbalance', label: 'PCC Load Balance', icon: '⚡', category: 'Routing' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">

      {/* 1. WINBOX TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          {/* Toggle Sidebar Icon (Hamburger) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Winbox Title Badge */}
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">ROS</span>
            <h1 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
              MikroTik Generator <span className="text-xs font-normal text-slate-400 hidden sm:inline">(Winbox Edition)</span>
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1 text-xs text-slate-400 border-r border-slate-800 pr-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected: 127.0.0.1</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* 2. LAYOUT MAIN (SIDEBAR + CONTENT CONTAINER) */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* MOBILE OVERLAY BACKDROP */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          ></div>
        )}

        {/* WINBOX SIDEBAR NAV */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 w-64 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:hidden'
            }`}
        >
          <div className="p-3 space-y-4">
            {/* Header Sidebar Small */}
            <div className="flex justify-between items-center px-2 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Main Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                ✖
              </button>
            </div>

            {/* Menu List Winbox Style */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setOutputScript('');
                      // Tutup otomatis jika di layar hp
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Sidebar Info */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 text-center">
            MikroTik RouterOS v6 / v7
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">

          {/* WINBOX CARD FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 lg:p-7">

            {/* TAB 1: IP BINDING */}
            {activeTab === 'binding' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>🔗</span> IP Binding Configuration
                  </h2>
                </div>

                {/* BARIS SUB-MENU 1: Pilihan Metode Binding */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Mode:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setBindingType('hotspot'); setOutputScript(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${bindingType === 'hotspot'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      <span>🔥 Binding Hotspot + DHCP</span>
                    </button>
                    <button
                      onClick={() => { setBindingType('dhcp'); setOutputScript(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${bindingType === 'dhcp'
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      <span>🌐 Binding DHCP Only</span>
                    </button>
                  </div>
                </div>

                {/* BARIS SUB-MENU 2: Aksi (Tambah, Edit MAC, Hapus) */}
                <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl w-fit">
                  {[
                    { id: 'tambah', label: '➕ Tambah' },
                    { id: 'edit', label: '✏️ Edit MAC' },
                    { id: 'hapus', label: '🗑️ Hapus' }
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => { setBindingAction(act.id); setOutputScript(''); }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${bindingAction === act.id
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>

                {/* FORM: TAMBAH */}
                {bindingAction === 'tambah' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-xl text-xs">
                      {bindingType === 'hotspot'
                        ? 'ℹ️ Membuat script ARP, DHCP Lease, dan Hotspot IP Binding Bypassed lengkap.'
                        : 'ℹ️ Membuat script ARP & DHCP Server Lease saja (Tanpa IP Binding Hotspot).'}
                    </div>
                    {bindings.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 items-end">
                        <div>
                          <label className="block text-xs font-medium mb-1">IP Address</label>
                          <input
                            type="text"
                            placeholder="192.168.1.10"
                            value={item.ip}
                            onChange={(e) => handleBindingChange(idx, 'ip', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">MAC Address</label>
                          <input
                            type="text"
                            placeholder="AA:BB:CC:DD:EE:FF"
                            value={item.mac}
                            onChange={(e) => handleBindingChange(idx, 'mac', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Nama Device</label>
                          <input
                            type="text"
                            placeholder="LAPTOP ANDI"
                            value={item.name}
                            onChange={(e) => handleBindingChange(idx, 'name', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Interface</label>
                          <select
                            value={item.iface}
                            onChange={(e) => handleBindingChange(idx, 'iface', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                          >
                            {['bridge', 'ether1', 'ether2', 'ether3', 'ether4', 'ether5'].map((i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Upload</label>
                          <div className="flex space-x-1">
                            <input
                              type="number"
                              placeholder="2"
                              value={item.upload}
                              onChange={(e) => handleBindingChange(idx, 'upload', e.target.value)}
                              className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                            />
                            <select
                              value={item.upload_unit}
                              onChange={(e) => handleBindingChange(idx, 'upload_unit', e.target.value)}
                              className="px-1 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                            >
                              <option value="M">M</option>
                              <option value="K">K</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Download</label>
                          <div className="flex space-x-1">
                            <input
                              type="number"
                              placeholder="5"
                              value={item.download}
                              onChange={(e) => handleBindingChange(idx, 'download', e.target.value)}
                              className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                            />
                            <select
                              value={item.download_unit}
                              onChange={(e) => handleBindingChange(idx, 'download_unit', e.target.value)}
                              className="px-1 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                            >
                              <option value="M">M</option>
                              <option value="K">K</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium mb-1">Parent Queue</label>
                            <input
                              type="text"
                              placeholder="BINDING"
                              value={item.parent}
                              onChange={(e) => handleBindingChange(idx, 'parent', e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm uppercase outline-none"
                            />
                          </div>
                          {bindings.length > 1 && (
                            <button
                              onClick={() => removeBindingRow(idx)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex space-x-3 pt-2">
                      <button onClick={addBindingRow} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition">
                        + Tambah Device
                      </button>
                      <button onClick={handleGenerateTrigger} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md transition">
                        ⚡ Generate Tambah
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM: EDIT MAC */}
                {bindingAction === 'edit' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-xs">
                      {bindingType === 'hotspot'
                        ? 'ℹ️ Mengganti MAC Address di ARP, DHCP Lease, dan Hotspot IP Binding.'
                        : 'ℹ️ Mengganti MAC Address di ARP dan DHCP Lease saja.'}
                    </div>
                    {editBindings.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 items-end">
                        <div>
                          <label className="block text-xs font-medium mb-1">IP Address Target</label>
                          <input
                            type="text"
                            placeholder="192.168.1.10"
                            value={item.ip}
                            onChange={(e) => handleEditChange(idx, 'ip', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">MAC Address Baru</label>
                          <input
                            type="text"
                            placeholder="AA:BB:CC:DD:EE:FF"
                            value={item.mac}
                            onChange={(e) => handleEditChange(idx, 'mac', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          {editBindings.length > 1 && (
                            <button
                              onClick={() => removeEditRow(idx)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex space-x-3 pt-2">
                      <button onClick={addEditRow} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition">
                        + Tambah Baris
                      </button>
                      <button onClick={handleGenerateTrigger} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm shadow-md transition">
                        ✏️ Generate Edit MAC
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM: HAPUS */}
                {bindingAction === 'hapus' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl text-xs">
                      {bindingType === 'hotspot'
                        ? 'ℹ️ Menghapus entry dari ARP, DHCP Lease, Hotspot Binding, dan Simple Queue berdasarkan IP Address.'
                        : 'ℹ️ Menghapus entry dari ARP, DHCP Lease, dan Simple Queue saja.'}
                    </div>
                    {hapusBindings.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 items-end">
                        <div>
                          <label className="block text-xs font-medium mb-1">IP Address Perangkat</label>
                          <input
                            type="text"
                            placeholder="192.168.1.10"
                            value={item.ip}
                            onChange={(e) => handleHapusChange(idx, 'ip', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          {hapusBindings.length > 1 && (
                            <button
                              onClick={() => removeHapusRow(idx)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex space-x-3 pt-2">
                      <button onClick={addHapusRow} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition">
                        + Tambah IP
                      </button>
                      <button onClick={handleGenerateTrigger} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow-md transition">
                        🗑️ Generate Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SIMPLE QUEUE */}
            {activeTab === 'queue' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <span>📊</span> Simple Queue Generator
                </h2>
                {queues.map((q, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 items-end">
                    <div>
                      <label className="block text-xs font-medium mb-1">IP Target</label>
                      <input
                        type="text"
                        placeholder="192.168.1.10"
                        value={q.ip}
                        onChange={(e) => handleQueueChange(idx, 'ip', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Nama Queue</label>
                      <input
                        type="text"
                        placeholder="CLIENT 1"
                        value={q.name}
                        onChange={(e) => handleQueueChange(idx, 'name', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm uppercase outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Parent</label>
                      <input
                        type="text"
                        placeholder="BINDING"
                        value={q.parent}
                        onChange={(e) => handleQueueChange(idx, 'parent', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm uppercase outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Comment</label>
                      <input
                        type="text"
                        placeholder="Pelanggan A"
                        value={q.comment}
                        onChange={(e) => handleQueueChange(idx, 'comment', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Upload Speed</label>
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          placeholder="2"
                          value={q.upload}
                          onChange={(e) => handleQueueChange(idx, 'upload', e.target.value)}
                          className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                        />
                        <select
                          value={q.upload_unit}
                          onChange={(e) => handleQueueChange(idx, 'upload_unit', e.target.value)}
                          className="px-1 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        >
                          <option value="M">M</option>
                          <option value="K">K</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Download Speed</label>
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          placeholder="5"
                          value={q.download}
                          onChange={(e) => handleQueueChange(idx, 'download', e.target.value)}
                          className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                        />
                        <select
                          value={q.download_unit}
                          onChange={(e) => handleQueueChange(idx, 'download_unit', e.target.value)}
                          className="px-1 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        >
                          <option value="M">M</option>
                          <option value="K">K</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {queues.length > 1 && (
                        <button onClick={() => removeQueueRow(idx)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition">
                          ✖
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex space-x-3 pt-2">
                  <button onClick={addQueueRow} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition">
                    + Tambah Queue
                  </button>
                  <button onClick={handleGenerateTrigger} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md transition">
                    ⚡ Generate Queue
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: LOAD BALANCE */}
            {activeTab === 'loadbalance' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>⚡</span> PCC Load Balance Generator
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium">RouterOS:</span>
                    <select
                      value={rosVersion}
                      onChange={(e) => setRosVersion(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                    >
                      <option value={6}>v6</option>
                      <option value={7}>v7</option>
                    </select>
                  </div>
                </div>
                {modems.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 items-end">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nama ISP</label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleModemChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Interface</label>
                      <input
                        type="text"
                        value={m.interface}
                        onChange={(e) => handleModemChange(idx, 'interface', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Gateway IP</label>
                      <input
                        type="text"
                        value={m.gateway}
                        onChange={(e) => handleModemChange(idx, 'gateway', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Bandwidth (Mbps)</label>
                      <input
                        type="number"
                        value={m.bandwidth}
                        onChange={(e) => handleModemChange(idx, 'bandwidth', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      {modems.length > 1 && (
                        <button onClick={() => removeModemRow(idx)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition">
                          ✖
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex space-x-3 pt-2">
                  <button onClick={addModemRow} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition">
                    + Tambah ISP
                  </button>
                  <button onClick={handleGenerateTrigger} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md transition">
                    ⚡ Generate Script PCC
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CONSOLE OUTPUT SCRIPT MIKROTIK */}
          {outputScript && (
            <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-emerald-400">Hasil Script MikroTik:</span>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                >
                  {copied ? '✓ Berhasil Disalin!' : '📋 Copy Script'}
                </button>
              </div>
              <textarea
                readOnly
                value={outputScript}
                className="w-full h-64 bg-transparent font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}