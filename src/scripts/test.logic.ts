
// 1. Transactions harus berupa ARRAY yang berisi daftar objek transaksi
const transactions = [
  { id: 1, type: 'INCOME', amount: 1000, createdAt: '2026-07-10' },
  { id: 2, type: 'EXPENSE', amount: 2500, createdAt: '2026-07-12' },
  { id: 3, type: 'INCOME', amount: 6000, createdAt: '2026-07-15' },
  { id: 4, type: 'EXPENSE', amount: 1000, createdAt: '2026-07-20' },
];

// 2. Logic menghitung Total Pemasukan
const totalPemasukan = transactions
  .filter(t => t.type === 'INCOME')
  .reduce((acc, curr) => acc + curr.amount, 0);

// 3. Logic menghitung Total Pengeluaran
const totalPengeluaran = transactions
  .filter(t => t.type === 'EXPENSE')
  .reduce((acc, curr) => acc + curr.amount, 0);

// 3.5 saldo sekarang
const currentSaldo = 12500;
// 4. Saldo Akhir
const saldoSekarang = (currentSaldo + totalPemasukan) - totalPengeluaran;

// Cetak hasil untuk testing
console.log("Saldo sebelum ada pemasukan dan pengeluaran:", currentSaldo)
console.log("Total Pemasukan   :", totalPemasukan);   // Hasil: 1500000
console.log("Total Pengeluaran :", totalPengeluaran); // Hasil: 350000
console.log("Saldo Sekarang    :", saldoSekarang);    // Hasil: 1150000
