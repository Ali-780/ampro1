import { License } from './types';

// Format date for export
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Get license status
const getStatus = (license: License): string => {
  const now = new Date();
  const expiresAt = new Date(license.expiresAt);
  
  if (expiresAt < now) return 'منتهي';
  if (license.used) return 'مستخدم';
  return 'نشط';
};

// Export to CSV
export const exportToCSV = (licenses: License[], filename: string = 'licenses'): void => {
  const headers = ['المفتاح', 'اسم المستخدم', 'تاريخ الانتهاء', 'HWID', 'الحالة', 'الملاحظات', 'تاريخ الإنشاء'];
  
  const rows = licenses.map(license => [
    license.key,
    license.userName,
    formatDate(license.expiresAt),
    license.hwid || '',
    getStatus(license),
    license.notes || '',
    formatDate(license.createdAt)
  ]);

  // Add BOM for Arabic support in Excel
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
};

// Export to Excel (using simple HTML table format that Excel can read)
export const exportToExcel = (licenses: License[], filename: string = 'licenses'): void => {
  const headers = ['المفتاح', 'اسم المستخدم', 'تاريخ الانتهاء', 'HWID', 'الحالة', 'الملاحظات', 'تاريخ الإنشاء'];
  
  const rows = licenses.map(license => [
    license.key,
    license.userName,
    formatDate(license.expiresAt),
    license.hwid || '',
    getStatus(license),
    license.notes || '',
    formatDate(license.createdAt)
  ]);

  const tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; direction: rtl; }
        th, td { border: 1px solid #000; padding: 8px; text-align: right; }
        th { background-color: #4f46e5; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f3f4f6; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  downloadFile(tableHtml, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8');
};

// Helper function to download file
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
