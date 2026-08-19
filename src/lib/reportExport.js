const LOGO_SVG = `<svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="87" rx="15" ry="3.5" fill="#b8863b" opacity="0.9" />
  <rect x="47" y="52" width="6" height="34" rx="2" fill="#b8863b" />
  <path d="M28 33 C28 33 27 48 33 54 C38 59 45 60 50 60 C55 60 62 59 67 54 C73 48 72 33 72 33 Z" fill="#b8863b" />
  <ellipse cx="50" cy="33" rx="22" ry="6.5" fill="#b8863b" />
  <path d="M38 84 C30 80 30 72 38 68 C48 63 48 56 39 52 C29 48 30 40 40 37 C50 34 51 27 44 23" stroke="#1f5f5b" stroke-width="4.2" stroke-linecap="round" fill="none" />
  <path d="M44 23 C41 20 41 15 45 13 C49 11 54 13 54 17 C54 20 51 22 47 22 Z" fill="#1f5f5b" />
</svg>`

// Çap edilə bilən hesabat açır (window.print() ilə brauzerdən "PDF olaraq saxla" da mümkündür)
export function printReport(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #16241f; }
          .letterhead { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
          .brand { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #1f5f5b; font-weight: 600; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e5e5; }
          th { color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
          tfoot td { font-weight: 700; border-top: 2px solid #16241f; border-bottom: none; }
          .section-title { font-size: 15px; font-weight: 600; margin: 28px 0 8px; }
          .stat-row { display: flex; gap: 24px; margin: 16px 0; }
          .stat { background: #f2f4f3; border-radius: 10px; padding: 12px 16px; }
          .stat .label { font-size: 11px; color: #666; text-transform: uppercase; }
          .stat .value { font-size: 18px; font-weight: 700; margin-top: 2px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="letterhead">${LOGO_SVG}<span class="brand">Klinika CRM</span></div>
        <h1>${escapeHtml(title)}</h1>
        ${bodyHtml}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

export function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

// CSV faylı yükləyir (Excel-də düzgün açılsın deyə BOM əlavə olunur)
export function downloadCsv(filename, headers, rows) {
  const escapeCsv = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))]
  const csv = '\uFEFF' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
