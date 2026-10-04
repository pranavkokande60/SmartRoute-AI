import React, { useState, useEffect } from 'react';
import {
  PackagePlus, Search, Filter, RefreshCw, Plus, CheckCircle2,
  AlertTriangle, Clock, Truck, ShieldAlert, MapPin, Factory,
  ChevronRight, X, ExternalLink, Calendar, DollarSign, ArrowRight,
  Sparkles, Trash2, Edit3, User, Mail, FileText
} from 'lucide-react';
import { api } from '../api';

export const NewOrdersTab: React.FC = () => {
  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_new_orders: 0,
    pending_orders: 0,
    low_risk_count: 0,
    medium_risk_count: 0,
    high_risk_count: 0
  });
  const [refData, setRefData] = useState<{ products: any[]; states: any[]; ship_modes: string[] }>({
    products: [],
    states: [],
    ship_modes: []
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [factoryFilter, setFactoryFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Order Form State
  const generateOrderId = () => `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;

  const [formData, setFormData] = useState({
    order_id: generateOrderId(),
    order_date: new Date().toISOString().slice(0, 10),
    customer_id: 104250,
    customer_name: '',
    customer_email: '',
    product_name: '',
    units: 5,
    city: '',
    state_province: 'Texas',
    postal_code: '75001',
    ship_mode: 'Standard Class',
    notes: ''
  });

  // Fetch orders and summary
  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, sumRes, refRes] = await Promise.all([
        api.getNewOrders({
          search: search || undefined,
          status: statusFilter,
          delay_risk: riskFilter,
          factory: factoryFilter,
          ship_mode: modeFilter
        }),
        api.getNewOrdersSummary(),
        api.getNewOrdersReferenceData()
      ]);
      setOrders(ordersRes);
      setSummary(sumRes);
      setRefData(refRes);
      if (refRes.products?.length > 0 && !formData.product_name) {
        setFormData(prev => ({ ...prev, product_name: refRes.products[0].product_name }));
      }
    } catch (err) {
      console.error('Failed to load new orders data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, riskFilter, factoryFilter, modeFilter]);

  // Derived current factory preview for Add Modal
  const selectedProductMeta = refData.products?.find(p => p.product_name === formData.product_name);

  // Submit New Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.product_name) {
      setFormError('Please select a product.');
      return;
    }
    if (!formData.city.trim()) {
      setFormError('Please enter a destination city.');
      return;
    }
    if (!formData.postal_code.trim()) {
      setFormError('Please enter a postal code.');
      return;
    }
    if (formData.units < 1) {
      setFormError('Units must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createNewOrder(formData);
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        order_id: generateOrderId(),
        order_date: new Date().toISOString().slice(0, 10),
        customer_id: Math.floor(100000 + Math.random() * 90000),
        customer_name: '',
        customer_email: '',
        product_name: refData.products?.[0]?.product_name || '',
        units: 5,
        city: '',
        state_province: 'Texas',
        postal_code: '75001',
        ship_mode: 'Standard Class',
        notes: ''
      });
      // Refresh list and auto open detail to show predictions
      await loadData();
      setSelectedOrder(created);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to create new order.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Status
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updated = await api.updateNewOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      const sumRes = await api.getNewOrdersSummary();
      setSummary(sumRes);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.deleteNewOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setIsDetailModalOpen(false);
        setSelectedOrder(null);
      }
      const sumRes = await api.getNewOrdersSummary();
      setSummary(sumRes);
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low Risk':
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">Low Risk</span>;
      case 'Moderate Risk':
        return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">Medium Risk</span>;
      case 'High Risk':
        return <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">High Risk</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[11px] font-medium">{risk || 'N/A'}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">NEW</span>;
      case 'PROCESSING':
        return <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">PROCESSING</span>;
      case 'SHIPPED':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">SHIPPED</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-semibold text-[10px]">CANCELLED</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Primary CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <PackagePlus className="w-4 h-4" />
            <span>Order Logistics Execution</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🆕 New Order Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Input newly received customer orders, trigger automatic product-to-factory routing, and evaluate machine learning delivery ETA and delay risk predictions before dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            onClick={() => { setFormError(null); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total New Orders</span>
            <PackagePlus className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{summary.total_new_orders}</div>
          <span className="text-[10px] text-slate-500">Live entered orders</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Orders</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 mt-1.5">{summary.pending_orders}</div>
          <span className="text-[10px] text-slate-500">New & In-Processing</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Low Delay Risk</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">{summary.low_risk_count}</div>
          <span className="text-[10px] text-emerald-500/80">ETA on schedule</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Medium Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5">{summary.medium_risk_count}</div>
          <span className="text-[10px] text-amber-500/80">Monitor transit closely</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High Delay Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1.5">{summary.high_risk_count}</div>
          <span className="text-[10px] text-rose-500/80">Expedite or re-route</span>
        </div>
      </div>

      {/* Logical Separation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>
            <strong>Logical Architecture: </strong>
            Newly entered orders are stored in the isolated <code className="bg-slate-950 px-1 py-0.5 rounded text-sky-400 text-[11px]">new_orders</code> table. Historical dataset (10,194 records) remains completely unchanged.
          </span>
        </div>
        <span className="hidden sm:inline text-[11px] text-slate-400">Active ML Predictions: Random Forest (ETA + Delay)</span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, destination city, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* Delay Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Moderate Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
          </select>

          {/* Carrier Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Ship Modes</option>
            <option value="Standard Class">Standard Class</option>
            <option value="Second Class">Second Class</option>
            <option value="First Class">First Class</option>
            <option value="Same Day">Same Day</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID & Customer</th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Factory (Origin)</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Ship Mode</th>
                <th className="py-3 px-3">Predicted ETA</th>
                <th className="py-3 px-3">Delay Risk</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-sky-400 mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <PackagePlus className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">No new orders found matching criteria</p>
                    <p className="text-[11px] mt-1 text-slate-500">Click "Add New Order" above to enter a customer order and get AI predictions.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-sky-400">{o.order_id}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {o.customer_name || `Customer #${o.customer_id}`}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200 truncate max-w-[180px]">{o.product_name}</div>
                      <span className="text-[10px] text-slate-500">{o.division} • {o.units} units</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-medium text-slate-300">
                        <Factory className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{o.factory_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{o.factory_city}, {o.factory_state}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{o.city}, {o.state_province}</div>
                      <span className="text-[10px] text-slate-500">{o.postal_code} • {o.route_distance_miles ? `${Math.round(o.route_distance_miles)} mi` : ''}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-medium">
                        {o.ship_mode}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-sky-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>{o.predicted_lead_time_days ? `${o.predicted_lead_time_days} days` : 'Calculating'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{o.expected_range_days || 'Estimated'}</span>
                    </td>

                    <td className="py-3 px-3">
                      {getRiskBadge(o.delay_risk)}
                      {o.delay_probability_pct !== undefined && (
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{o.delay_probability_pct}% delay prob</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="NEW">NEW</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {o.order_date}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedOrder(o); setIsDetailModalOpen(true); }}
                          className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold transition-all"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD NEW ORDER MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <PackagePlus className="w-4 h-4" />
              <span>Logistics Intake</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Add New Customer Order</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter order specifications. The system automatically designates the supplying factory, calculates route geography, and invokes machine learning predictions.
            </p>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
              {/* Order ID & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Order ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.order_id}
                    onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Customer ID, Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Candies Co."
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="buyer@client.com"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Product & Units */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product Name *</label>
                  <select
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                  >
                    {refData.products?.map((p) => (
                      <option key={p.product_name} value={p.product_name}>
                        {p.product_name} ({p.division})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Units (Quantity) *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* AUTOMATIC FACTORY & ROUTE PREVIEW CARD */}
              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5" />
                    Automatic Factory Assignment
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Rule-Based Knowledge Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500">Origin Manufacturing Plant</span>
                    <div className="font-bold text-white text-xs mt-0.5">{selectedProductMeta?.factory_name || 'Loading...'}</div>
                    <div className="text-[10px] text-slate-400">{selectedProductMeta?.factory_city}, {selectedProductMeta?.factory_state}</div>
                    <div className="text-[10px] text-sky-400 mt-1 italic">{selectedProductMeta?.factory_specialization}</div>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500">Automated Logistics Corridor</span>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {selectedProductMeta?.factory_name} &rarr; {formData.state_province}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Target: {formData.city || '[City]'}, {formData.state_province}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                      Estimated Volume: ${(formData.units * 3.50).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Geography */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dallas, Seattle, Chicago"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">State/Province *</label>
                  <select
                    value={formData.state_province}
                    onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    {refData.states?.map((s) => (
                      <option key={s.state_name} value={s.state_name}>
                        {s.state_name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 75201"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Ship Mode */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Carrier Shipping Mode *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Standard Class', 'Second Class', 'First Class', 'Same Day'].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setFormData({ ...formData, ship_mode: mode })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                        formData.ship_mode === mode
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions, gate codes, temperature preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Generating AI Predictions...' : 'Save Order & Predict ETA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ORDER DETAILS MODAL */}
      {/* ============================================================== */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pr-8">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Order Intelligence Dossier</span>
                <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2 mt-0.5">
                  {selectedOrder.order_id}
                </h2>
                <span className="text-xs text-slate-400">Order Placed: {selectedOrder.order_date}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="NEW">NEW</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* AI PREDICTION HIGHLIGHT BOX */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 mb-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Machine Learning Prediction Summary
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Trained Random Forest Suite</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500">Predicted Delivery Lead Time</span>
                  <div className="text-xl font-black text-sky-400 mt-0.5">
                    {selectedOrder.predicted_lead_time_days} days
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Expected Window: {selectedOrder.expected_range_days || '3-5 days'}</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500">Delay Risk Level</span>
                  <div className="mt-1">{getRiskBadge(selectedOrder.delay_risk)}</div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {selectedOrder.delay_probability_pct}% SLA breach probability
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500">Transit Recommendation</span>
                  <div className="text-xs font-semibold text-slate-200 mt-1">
                    {selectedOrder.recommendation || `${selectedOrder.ship_mode} is appropriate for this distance.`}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 text-[11px] text-slate-400">
                * Note: These are predictive analytics derived from historical routing patterns, transit distance, and product attributes.
              </div>
            </div>

            {/* 4-Column Structured Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-5">
              {/* Product Info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  Product Information
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product:</span>
                  <span className="font-semibold text-slate-200">{selectedOrder.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Division:</span>
                  <span className="text-slate-300">{selectedOrder.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="font-bold text-sky-400">{selectedOrder.units} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Sales:</span>
                  <span className="font-mono text-emerald-400 font-bold">${selectedOrder.estimated_sales?.toFixed(2)}</span>
                </div>
              </div>

              {/* Factory Info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  Supplying Factory (Origin)
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Factory Name:</span>
                  <span className="font-bold text-sky-400">{selectedOrder.factory_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Origin Facility:</span>
                  <span className="text-slate-300">{selectedOrder.factory_city}, {selectedOrder.factory_state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-slate-500 text-[10px]">{selectedOrder.origin_lat?.toFixed(3)}, {selectedOrder.origin_lng?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assignment:</span>
                  <span className="text-emerald-400 font-medium">Automatic (Knowledge Rule)</span>
                </div>
              </div>

              {/* Destination Customer Info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  Customer & Destination
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer ID:</span>
                  <span className="font-mono text-slate-200">#{selectedOrder.customer_id}</span>
                </div>
                {selectedOrder.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer Name:</span>
                    <span className="text-slate-200">{selectedOrder.customer_name}</span>
                  </div>
                )}
                {selectedOrder.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-300">{selectedOrder.customer_email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Address / City:</span>
                  <span className="font-semibold text-slate-200">{selectedOrder.city}, {selectedOrder.state_province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Postal / Region:</span>
                  <span className="text-slate-400">{selectedOrder.postal_code} • {selectedOrder.region}</span>
                </div>
              </div>

              {/* Route & Carrier Transit */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  Corridor & Transit Info
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route Name:</span>
                  <span className="font-semibold text-slate-200">{selectedOrder.route_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance:</span>
                  <span className="font-mono text-slate-200">{selectedOrder.route_distance_miles ? `${Math.round(selectedOrder.route_distance_miles)} miles` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier Mode:</span>
                  <span className="font-semibold text-sky-400">{selectedOrder.ship_mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Source:</span>
                  <span className="text-slate-400 font-mono text-[10px]">smartroute.db (new_orders)</span>
                </div>
              </div>
            </div>

            {/* Notes Section if available */}
            {selectedOrder.notes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Customer / Logistics Notes
                </span>
                <p className="text-slate-300 italic">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
