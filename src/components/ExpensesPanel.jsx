import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Button, EmptyState, TealCard } from './ui'
import { Plus, Wallet, Gift, Receipt, Printer, FileDown } from 'lucide-react'
import { printReport, downloadCsv, escapeHtml } from '../lib/reportExport'

const TYPE_LABELS = { salary: 'Əmək haqqı', expense: 'Xərc', bonus: 'Mükafat' }
const TYPE_ICONS = { salary: Wallet, expense: Receipt, bonus: Gift }

export default function ExpensesPanel() {
  const [entries, setEntries] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [entriesData, employeesData] = await Promise.all([
        apiRequest(`/finance-entries${filterType ? `?type=${filterType}` : ''}`),
        apiRequest('/employees'),
      ])
      setEntries(entriesData.entries)
      setEmployees(employeesData.employees)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    load()
  }, [load])

  async function handleFullReport() {
    setExporting(true)
    try {
      const [statsData, allEntries] = await Promise.all([
        apiRequest('/stats/summary'),
        apiRequest('/finance-entries'),
      ])
      printFinancialReport(statsData, allEntries.entries)
    } finally {
      setExporting(false)
    }
  }

  function handleSalaryPrint() {
    printSalaryList(entries.filter((e) => e.type === 'salary'))
  }

  function handleSalaryCsv() {
    exportEntriesCsv(entries.filter((e) => e.type === 'salary'), 'emek-haqqi')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-display text-xl font-semibold text-ink">Xərclər · Əmək haqqı · Mükafat</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-1.5">
          <Plus size={15} /> Yeni qeyd
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={handleFullReport}
          disabled={exporting}
          className="flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink rounded-lg px-3 py-1.5 border border-black/10 bg-surface transition-colors disabled:opacity-50"
        >
          <Printer size={14} /> {exporting ? 'Hazırlanır…' : 'Tam maliyyə hesabatı'}
        </button>
        <button
          onClick={handleSalaryPrint}
          className="flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink rounded-lg px-3 py-1.5 border border-black/10 bg-surface transition-colors"
        >
          <Printer size={14} /> Əmək haqqı siyahısı
        </button>
        <button
          onClick={handleSalaryCsv}
          className="flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink rounded-lg px-3 py-1.5 border border-black/10 bg-surface transition-colors"
        >
          <FileDown size={14} /> Excel (CSV)
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <FilterChip active={filterType === ''} onClick={() => setFilterType('')}>Hamısı</FilterChip>
        <FilterChip active={filterType === 'salary'} onClick={() => setFilterType('salary')}>Əmək haqqı</FilterChip>
        <FilterChip active={filterType === 'expense'} onClick={() => setFilterType('expense')}>Xərc</FilterChip>
        <FilterChip active={filterType === 'bonus'} onClick={() => setFilterType('bonus')}>Mükafat</FilterChip>
      </div>

      {showForm && <NewEntryForm employees={employees} onClose={() => setShowForm(false)} onCreated={load} />}

      {error ? (
        <p className="text-danger text-sm">{error}</p>
      ) : loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : entries.length === 0 ? (
        <EmptyState title="Hələ qeyd yoxdur" />
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
            const Icon = TYPE_ICONS[e.type]
            return (
              <TealCard key={e.id} className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {e.employee_name || e.category || TYPE_LABELS[e.type]}
                  </div>
                  <div className="text-sm text-white/70 truncate">
                    {TYPE_LABELS[e.type]}
                    {e.category && e.employee_name && ` · ${e.category}`}
                    {' · '}{new Date(e.entry_date).toLocaleDateString('az-AZ')}
                    {e.description && ` · ${e.description}`}
                  </div>
                </div>
                <div className="font-semibold shrink-0 tabular-nums">{Number(e.amount).toFixed(2)} ₼</div>
              </TealCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

function printFinancialReport(stats, entries) {
  const salaryTotal = entries.filter((e) => e.type === 'salary').reduce((s, e) => s + Number(e.amount), 0)
  const expenseTotal = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
  const bonusTotal = entries.filter((e) => e.type === 'bonus').reduce((s, e) => s + Number(e.amount), 0)

  const entryRows = entries
    .map(
      (e) => `<tr>
        <td>${new Date(e.entry_date).toLocaleDateString('az-AZ')}</td>
        <td>${escapeHtml(TYPE_LABELS[e.type])}</td>
        <td>${escapeHtml(e.employee_name || e.category || '—')}</td>
        <td>${escapeHtml(e.description || '')}</td>
        <td style="text-align:right">${Number(e.amount).toFixed(2)} ₼</td>
      </tr>`
    )
    .join('')

  printReport(
    'Tam maliyyə hesabatı',
    `<div class="meta">Tarix: ${new Date().toLocaleDateString('az-AZ')}</div>
    <div class="stat-row">
      <div class="stat"><div class="label">Aylıq dövriyyə</div><div class="value">${stats.month_total.toFixed(2)} ₼</div></div>
      <div class="stat"><div class="label">Aylıq xərc</div><div class="value">-${stats.month_expenses.toFixed(2)} ₼</div></div>
      <div class="stat"><div class="label">Xalis qazanc</div><div class="value">${stats.month_net.toFixed(2)} ₼</div></div>
    </div>
    <div class="section-title">Xərc bölgüsü</div>
    <table>
      <thead><tr><th>Növ</th><th style="text-align:right">Məbləğ</th></tr></thead>
      <tbody>
        <tr><td>Əmək haqqı</td><td style="text-align:right">${salaryTotal.toFixed(2)} ₼</td></tr>
        <tr><td>Xərc</td><td style="text-align:right">${expenseTotal.toFixed(2)} ₼</td></tr>
        <tr><td>Mükafat</td><td style="text-align:right">${bonusTotal.toFixed(2)} ₼</td></tr>
      </tbody>
    </table>
    <div class="section-title">Bütün qeydlər</div>
    <table>
      <thead><tr><th>Tarix</th><th>Növ</th><th>Kim/Kateqoriya</th><th>Qeyd</th><th style="text-align:right">Məbləğ</th></tr></thead>
      <tbody>${entryRows}</tbody>
    </table>`
  )
}

function printSalaryList(salaryEntries) {
  const rows = salaryEntries
    .map(
      (e) => `<tr>
        <td>${escapeHtml(e.employee_name || '—')}</td>
        <td>${new Date(e.entry_date).toLocaleDateString('az-AZ')}</td>
        <td>${escapeHtml(e.description || '')}</td>
        <td style="text-align:right">${Number(e.amount).toFixed(2)} ₼</td>
      </tr>`
    )
    .join('')
  const total = salaryEntries.reduce((s, e) => s + Number(e.amount), 0)

  printReport(
    'Əmək haqqı siyahısı',
    `<div class="meta">Tarix: ${new Date().toLocaleDateString('az-AZ')} · ${salaryEntries.length} qeyd</div>
    <table>
      <thead><tr><th>Əməkdaş</th><th>Tarix</th><th>Qeyd</th><th style="text-align:right">Məbləğ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3">Cəmi</td><td style="text-align:right">${total.toFixed(2)} ₼</td></tr></tfoot>
    </table>`
  )
}

function exportEntriesCsv(entries, prefix) {
  const rows = entries.map((e) => [
    new Date(e.entry_date).toLocaleDateString('az-AZ'),
    TYPE_LABELS[e.type],
    e.employee_name || e.category || '',
    e.description || '',
    Number(e.amount).toFixed(2),
  ])
  downloadCsv(
    `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Tarix', 'Növ', 'Kim/Kateqoriya', 'Qeyd', 'Məbləğ'],
    rows
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'bg-surface text-ink/70 border border-black/10'
      }`}
    >
      {children}
    </button>
  )
}

const EXPENSE_CATEGORIES = ['İcarə', 'Kommunal', 'Ləvazimat', 'Təmir', 'Reklam', 'Nəqliyyat', 'Digər']

function NewEntryForm({ employees, onClose, onCreated }) {
  const [type, setType] = useState('expense')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function selectEmployee(id) {
    setEmployeeId(id)
    const emp = employees.find((x) => x.id === id)
    if (emp) setEmployeeName(emp.full_name)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/finance-entries', {
        method: 'POST',
        body: {
          type,
          employee_id: type !== 'expense' ? employeeId || null : null,
          employee_name: type !== 'expense' ? employeeName : null,
          category: type === 'expense' ? category : null,
          amount: Number(amount),
          description: description || null,
          entry_date: entryDate,
        },
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-5 z-20">
      <div className="bg-surface rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-5 animate-fade-in">
        <h3 className="font-display text-lg font-semibold text-ink mb-4">Yeni qeyd</h3>
        <form onSubmit={handleSubmit}>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3">
            <option value="expense">Xərc</option>
            <option value="salary">Əmək haqqı</option>
            <option value="bonus">Mükafat</option>
          </select>

          {type === 'expense' ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <select
              required
              value={employeeId}
              onChange={(e) => selectEmployee(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3"
            >
              <option value="">Əməkdaş seç…</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Məbləğ (₼)" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qeyd (opsional)" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />

          {error && <p className="text-danger text-sm mb-3">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Yadda saxlanılır…' : 'Əlavə et'}</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
