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
  const [activeTab, setActiveTab] = useState('binding'); // 'binding' | 'queue' | 'loadbalance'
  const [bindingSubTab, setBindingSubTab] = useState('tambah'); // 'tambah' | 'edit' | 'hapus'
  const [outputScript, setOutputScript] = useState('');
  const [copied, setCopied] = useState(false);

  // Modal State untuk Pilihan Binding (Tambah)
  const [showBindingModal, setShowBindingModal] = useState(false);

  // Form States - IP Binding (Tambah, Edit, Hapus)
  const [bindings, setBindings] = useState([
    { ip: '', mac: '', name: '', iface: 'bridge', upload: '2', upload_unit: 'M', download: '5', download_unit: 'M', parent: '' }
  ]);
  const [editBindings, setEditBindings] = useState([
    { ip: '', mac: '' }
  ]);
  const [hapusBindings, setHapusBindings] = useState([
    { ip: '' }
  ]);

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

  const executeGenerateBinding = (mode) => {
    const script = generateBindingScript(bindings, { mode });
    setOutputScript(script);
    setShowBindingModal(false);
    setCopied(false);
  };

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

  // ------------ TRIGGER GENERATE ------------
  const handleGenerateTrigger = () => {
    if (activeTab === 'binding') {
      if (bindingSubTab === 'tambah') {
        setShowBindingModal(true); // Muncul modal konfirmasi
      } else if (bindingSubTab === 'edit') {
        setOutputScript(generateEditBindingScript(editBindings));
        setCopied(false);
      } else if (bindingSubTab === 'hapus') {
        setOutputScript(generateHapusBindingScript(hapusBindings));
        setCopied(false);
      }
    } else if (activeTab === 'queue') {
      setOutputScript(generateQueueScript(queues));
      setCopied(false);
    } else if (activeTab === 'loadbalance') {
      setOutputScript(generatePCCScript(modems, rosVersion));
      setCopied(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚡</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            MikroTik Script Generator
          </h1>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition text-xs font-semibold"
        >
          {darkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Navigation Tabs Utama */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: 'binding', label: '🔗 IP Binding' },
            { id: 'queue', label: '📊 Simple Queue' },
            { id: 'loadbalance', label: '⚡ PCC Load Balance' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOutputScript(''); }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition text-sm ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card Form Utama */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">

          {/* TAB 1: IP BINDING */}
          {activeTab === 'binding' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-2">IP Binding & Queue Configuration</h2>

              {/* Sub-Tab Navigation (Tambah / Edit / Hapus) */}
              <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl w-fit">
                {[
                  { id: 'tambah', label: '➕ Tambah' },
                  { id: 'edit', label: '✏️ Edit MAC' },
                  { id: 'hapus', label: '🗑️ Hapus' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => { setBindingSubTab(sub.id); setOutputScript(''); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${bindingSubTab === sub.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* SUB TAB: TAMBAH */}
              {bindingSubTab === 'tambah' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-xl text-xs">
                    ℹ️ Digunakan untuk menambah perangkat baru dengan cara membinding IP & MAC Address di MikroTik.
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

              {/* SUB TAB: EDIT MAC */}
              {bindingSubTab === 'edit' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-xs">
                    ℹ️ Digunakan untuk mengganti MAC Address lama dengan MAC Address baru berdasarkan IP Address perangkat.
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

              {/* SUB TAB: HAPUS */}
              {bindingSubTab === 'hapus' && (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl text-xs">
                    ℹ️ Digunakan untuk menghapus perangkat dari ARP, DHCP Lease, Hotspot Binding, dan Simple Queue berdasarkan IP Address.
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
              <h2 className="text-lg font-bold mb-2">Simple Queue Generator</h2>
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
                <h2 className="text-lg font-bold">PCC Load Balance Generator</h2>
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

        {/* Console Output Script MikroTik */}
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

      {/* MODAL PILIHAN SUB MENU BINDING (HANYA MUNCUL DI SUB-TAB TAMBAH) */}
      {showBindingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Pilih Tipe Binding MikroTik</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Silahkan pilih metode generator yang ingin diterapkan:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => executeGenerateBinding('dhcp')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition group"
              >
                <div className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  1. Binding DHCP Only
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Membuat ARP & DHCP Server Lease saja (Tanpa IP Binding Hotspot).
                </div>
              </button>

              <button
                onClick={() => executeGenerateBinding('hotspot')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition group"
              >
                <div className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  2. Binding Hotspot + DHCP
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Membuat ARP, DHCP Lease, dan Bypassed Hotspot IP Binding lengkap.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBindingModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}