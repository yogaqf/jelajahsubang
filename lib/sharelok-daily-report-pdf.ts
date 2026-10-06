export interface DailyPdfReport {
  date: string;
  totals: {
    orders: number;
    customerPayments: number;
    merchantPayouts: number;
    driverCommissions: number;
    platformRevenue: number;
  };
  menus: { productName: string; merchantName: string; orders: number; quantity: number; sales: number }[];
  drivers: { driverName: string; orders: number; deliveryFees: number; commission: number }[];
  merchants: { merchantName: string; orders: number; payout: number }[];
  areas: { areaName: string; orders: number; customerPayments: number; platformRevenue: number }[];
}

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const MARGIN = 72;

function money(value: number) {
  return `Rp ${Math.round(Number(value || 0)).toLocaleString("id-ID")}`;
}

function reportDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T12:00:00+07:00`));
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function truncate(context: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (context.measureText(value).width <= maxWidth) return value;
  let result = value;
  while (result.length > 1 && context.measureText(`${result}...`).width > maxWidth) result = result.slice(0, -1);
  return `${result}...`;
}

function createPage(title: string, subtitle: string, page: number, totalPages: number) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak mendukung pembuatan PDF.");

  context.fillStyle = "#f4f7f5";
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  const header = context.createLinearGradient(0, 0, PAGE_WIDTH, 245);
  header.addColorStop(0, "#052e16");
  header.addColorStop(1, "#047857");
  context.fillStyle = header;
  context.fillRect(0, 0, PAGE_WIDTH, 250);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.beginPath(); context.arc(1110, 0, 260, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#ffffff";
  context.font = "900 42px Arial, sans-serif";
  context.fillText("Share", MARGIN, 72);
  const shareWidth = context.measureText("Share").width;
  context.fillStyle = "#fb7185";
  context.fillText("lok", MARGIN + shareWidth, 72);
  context.fillStyle = "#a7f3d0";
  context.font = "700 17px Arial, sans-serif";
  context.fillText("DAILY BUSINESS REPORT", MARGIN + 2, 103);

  context.fillStyle = "#ffffff";
  context.font = "900 40px Arial, sans-serif";
  context.fillText(title, MARGIN, 169, 920);
  context.fillStyle = "rgba(255,255,255,0.72)";
  context.font = "600 22px Arial, sans-serif";
  context.fillText(subtitle, MARGIN, 210, 900);

  context.textAlign = "right";
  context.fillStyle = "rgba(255,255,255,0.8)";
  context.font = "800 17px Arial, sans-serif";
  context.fillText(`HALAMAN ${page} / ${totalPages}`, PAGE_WIDTH - MARGIN, 205);
  context.textAlign = "left";
  return { canvas, context };
}

function sectionTitle(context: CanvasRenderingContext2D, title: string, subtitle: string, y: number) {
  context.fillStyle = "#18181b";
  context.font = "900 27px Arial, sans-serif";
  context.fillText(title, MARGIN, y);
  context.fillStyle = "#71717a";
  context.font = "500 17px Arial, sans-serif";
  context.fillText(subtitle, MARGIN, y + 29);
}

function footer(context: CanvasRenderingContext2D, page: number) {
  const y = PAGE_HEIGHT - 80;
  context.strokeStyle = "#d4d4d8";
  context.lineWidth = 1;
  context.beginPath(); context.moveTo(MARGIN, y - 28); context.lineTo(PAGE_WIDTH - MARGIN, y - 28); context.stroke();
  context.fillStyle = "#71717a";
  context.font = "500 15px Arial, sans-serif";
  context.fillText(`Dibuat otomatis oleh Sharelok - ${new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(new Date())} WIB`, MARGIN, y);
  context.textAlign = "right";
  context.fillText(`Laporan internal - halaman ${page}`, PAGE_WIDTH - MARGIN, y);
  context.textAlign = "left";
}

function drawKpi(context: CanvasRenderingContext2D, x: number, y: number, width: number, label: string, value: string, color: string) {
  roundRect(context, x, y, width, 150, 22);
  context.fillStyle = "#ffffff";
  context.fill();
  context.strokeStyle = "#e4e4e7";
  context.lineWidth = 1.5;
  context.stroke();
  context.fillStyle = "#a1a1aa";
  context.font = "800 16px Arial, sans-serif";
  context.fillText(label, x + 24, y + 43, width - 48);
  context.fillStyle = color;
  context.font = "900 28px Arial, sans-serif";
  context.fillText(truncate(context, value, width - 48), x + 24, y + 99);
}

function drawRanking(
  context: CanvasRenderingContext2D,
  rows: { title: string; subtitle: string; metric: number; value: string }[],
  startY: number,
  rowHeight: number,
  accent: string
) {
  const maxMetric = Math.max(1, ...rows.map((row) => row.metric));
  rows.forEach((row, index) => {
    const y = startY + index * rowHeight;
    roundRect(context, MARGIN, y, PAGE_WIDTH - MARGIN * 2, rowHeight - 12, 18);
    context.fillStyle = "#ffffff";
    context.fill();
    context.strokeStyle = "#e4e4e7";
    context.stroke();

    context.fillStyle = accent;
    context.font = "900 22px Arial, sans-serif";
    context.fillText(`#${index + 1}`, MARGIN + 22, y + 34);
    context.fillStyle = "#18181b";
    context.font = "800 20px Arial, sans-serif";
    context.fillText(truncate(context, row.title, 525), MARGIN + 80, y + 31);
    context.fillStyle = "#a1a1aa";
    context.font = "600 14px Arial, sans-serif";
    context.fillText(truncate(context, row.subtitle, 540), MARGIN + 80, y + 55);

    const barX = MARGIN + 650;
    const barWidth = 245;
    roundRect(context, barX, y + 27, barWidth, 12, 6);
    context.fillStyle = "#e4e4e7";
    context.fill();
    roundRect(context, barX, y + 27, Math.max(12, barWidth * row.metric / maxMetric), 12, 6);
    context.fillStyle = accent;
    context.fill();

    context.textAlign = "right";
    context.fillStyle = accent;
    context.font = "900 20px Arial, sans-serif";
    context.fillText(row.value, PAGE_WIDTH - MARGIN - 22, y + 40);
    context.textAlign = "left";
  });
}

function buildPages(report: DailyPdfReport) {
  const subtitle = reportDate(report.date);
  const pages: HTMLCanvasElement[] = [];
  const averageOrder = report.totals.orders > 0 ? report.totals.customerPayments / report.totals.orders : 0;
  const topMenu = report.menus[0];
  const topDriver = report.drivers[0];
  const topMerchant = report.merchants[0];
  const topArea = report.areas[0];

  const first = createPage("Ringkasan Closing Harian", subtitle, 1, 3);
  sectionTitle(first.context, "Statistik utama", "Angka closing yang sudah selesai dan terkunci.", 310);
  const kpiWidth = 340;
  const kpiGap = 38;
  [
    ["ORDER SELESAI", `${report.totals.orders} order`, "#18181b"],
    ["PEMBAYARAN CUSTOMER", money(report.totals.customerPayments), "#2563eb"],
    ["RATA-RATA ORDER", money(averageOrder), "#0891b2"],
    ["BAYAR MITRA", money(report.totals.merchantPayouts), "#d97706"],
    ["KOMISI DRIVER", money(report.totals.driverCommissions), "#7e22ce"],
    ["PENDAPATAN SHARELOK", money(report.totals.platformRevenue), "#047857"],
  ].forEach((item, index) => drawKpi(first.context, MARGIN + (index % 3) * (kpiWidth + kpiGap), 365 + Math.floor(index / 3) * 180, kpiWidth, item[0], item[1], item[2]));

  sectionTitle(first.context, "Distribusi pembayaran", "Pembagian dari total pembayaran customer.", 785);
  const distribution = [
    { label: "Mitra", value: report.totals.merchantPayouts, color: "#f59e0b" },
    { label: "Driver", value: report.totals.driverCommissions, color: "#9333ea" },
    { label: "Sharelok", value: report.totals.platformRevenue, color: "#059669" },
  ];
  const totalDistribution = Math.max(1, distribution.reduce((sum, item) => sum + item.value, 0));
  let barX = MARGIN;
  distribution.forEach((item) => {
    const width = (PAGE_WIDTH - MARGIN * 2) * item.value / totalDistribution;
    first.context.fillStyle = item.color;
    first.context.fillRect(barX, 840, width, 34);
    barX += width;
  });
  distribution.forEach((item, index) => {
    const x = MARGIN + index * 365;
    first.context.fillStyle = item.color;
    first.context.fillRect(x, 905, 15, 15);
    first.context.fillStyle = "#52525b";
    first.context.font = "700 16px Arial, sans-serif";
    first.context.fillText(`${item.label} ${money(item.value)}`, x + 25, 919);
  });

  sectionTitle(first.context, "Highlight hari ini", "Peringkat teratas berdasarkan order yang selesai.", 1030);
  const highlights = [
    { label: "MENU TERATAS", title: topMenu?.productName || "Belum ada data", detail: topMenu ? `${topMenu.orders} order - ${topMenu.quantity} item` : "-", color: "#dc2626" },
    { label: "DRIVER TERATAS", title: topDriver?.driverName || "Belum ada data", detail: topDriver ? `${topDriver.orders} order - ${money(topDriver.commission)}` : "-", color: "#7e22ce" },
    { label: "MITRA TERATAS", title: topMerchant?.merchantName || "Belum ada data", detail: topMerchant ? `${topMerchant.orders} order - dibayar ${money(topMerchant.payout)}` : "-", color: "#d97706" },
    { label: "AREA TERATAS", title: topArea?.areaName || "Belum ada data", detail: topArea ? `${topArea.orders} order - ${money(topArea.customerPayments)}` : "-", color: "#047857" },
  ];
  highlights.forEach((item, index) => {
    const x = MARGIN + (index % 2) * 558;
    const y = 1085 + Math.floor(index / 2) * 175;
    roundRect(first.context, x, y, 530, 145, 22);
    first.context.fillStyle = "#ffffff"; first.context.fill();
    first.context.strokeStyle = "#e4e4e7"; first.context.stroke();
    first.context.fillStyle = item.color; first.context.font = "900 15px Arial, sans-serif"; first.context.fillText(item.label, x + 24, y + 36);
    first.context.fillStyle = "#18181b"; first.context.font = "900 23px Arial, sans-serif"; first.context.fillText(truncate(first.context, item.title, 475), x + 24, y + 77);
    first.context.fillStyle = "#71717a"; first.context.font = "600 16px Arial, sans-serif"; first.context.fillText(item.detail, x + 24, y + 108);
  });
  footer(first.context, 1);
  pages.push(first.canvas);

  const second = createPage("Ranking Menu", subtitle, 2, 3);
  sectionTitle(second.context, "Menu berdasarkan order", "Urutan dihitung dari jumlah order selesai, lalu jumlah item terjual.", 310);
  const menuRows = report.menus.slice(0, 15).map((menu) => ({
    title: menu.productName,
    subtitle: `${menu.merchantName} - ${menu.quantity} item - penjualan ${money(menu.sales)}`,
    metric: menu.orders,
    value: `${menu.orders} order`,
  }));
  if (menuRows.length) drawRanking(second.context, menuRows, 365, 82, "#dc2626");
  else { second.context.fillStyle = "#71717a"; second.context.font = "600 22px Arial, sans-serif"; second.context.fillText("Belum ada menu dari order yang selesai pada tanggal ini.", MARGIN, 410); }
  footer(second.context, 2);
  pages.push(second.canvas);

  const third = createPage("Ranking Driver dan Mitra", subtitle, 3, 3);
  sectionTitle(third.context, "Driver berdasarkan order", "Komisi hanya ditampilkan sebagai nominal, tanpa persentase.", 310);
  const driverRows = report.drivers.slice(0, 10).map((driver) => ({
    title: driver.driverName,
    subtitle: `Komisi closing ${money(driver.commission)}`,
    metric: driver.orders,
    value: `${driver.orders} order`,
  }));
  if (driverRows.length) drawRanking(third.context, driverRows, 365, 76, "#7e22ce");
  else { third.context.fillStyle = "#71717a"; third.context.font = "600 20px Arial, sans-serif"; third.context.fillText("Belum ada driver pada closing tanggal ini.", MARGIN, 410); }

  const merchantTitleY = 365 + Math.max(1, driverRows.length) * 76 + 65;
  sectionTitle(third.context, "Mitra berdasarkan order", "Total dibayarkan ditampilkan tanpa total penjualan.", merchantTitleY);
  const availableHeight = PAGE_HEIGHT - 115 - (merchantTitleY + 55);
  const merchantLimit = Math.max(1, Math.min(8, Math.floor(availableHeight / 68)));
  const merchantRows = report.merchants.slice(0, merchantLimit).map((merchant) => ({
    title: merchant.merchantName,
    subtitle: `Total dibayarkan ${money(merchant.payout)}`,
    metric: merchant.orders,
    value: `${merchant.orders} order`,
  }));
  if (merchantRows.length) drawRanking(third.context, merchantRows, merchantTitleY + 55, 68, "#d97706");
  footer(third.context, 3);
  pages.push(third.canvas);

  return pages;
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error("Gagal merender halaman PDF."));
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/jpeg", 0.94);
  });
}

function ascii(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(chunks: Uint8Array[]) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

async function canvasesToPdf(canvases: HTMLCanvasElement[]) {
  const images = await Promise.all(canvases.map(canvasToJpeg));
  const objectCount = 2 + images.length * 3;
  const objects: Uint8Array[] = new Array(objectCount + 1);
  objects[1] = ascii("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds = images.map((_, index) => 3 + index * 3);
  objects[2] = ascii(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${images.length} >>`);

  images.forEach((image, index) => {
    const pageId = 3 + index * 3;
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    objects[pageId] = ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im${index} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects[imageId] = concatBytes([
      ascii(`<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`),
      image,
      ascii("\nendstream"),
    ]);
    const commands = `q\n595 0 0 842 0 0 cm\n/Im${index} Do\nQ`;
    objects[contentId] = ascii(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`);
  });

  const header = ascii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const chunks: Uint8Array[] = [header];
  const offsets: number[] = new Array(objectCount + 1).fill(0);
  let cursor = header.length;
  for (let id = 1; id <= objectCount; id += 1) {
    const object = concatBytes([ascii(`${id} 0 obj\n`), objects[id], ascii("\nendobj\n")]);
    offsets[id] = cursor;
    chunks.push(object);
    cursor += object.length;
  }

  const xrefOffset = cursor;
  const xref = ["xref", `0 ${objectCount + 1}`, "0000000000 65535 f "];
  for (let id = 1; id <= objectCount; id += 1) xref.push(`${String(offsets[id]).padStart(10, "0")} 00000 n `);
  xref.push("trailer", `<< /Size ${objectCount + 1} /Root 1 0 R >>`, "startxref", String(xrefOffset), "%%EOF");
  chunks.push(ascii(`${xref.join("\n")}\n`));
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}

export async function downloadDailyReportPdf(report: DailyPdfReport) {
  const pages = buildPages(report);
  const blob = await canvasesToPdf(pages);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sharelok-daily-report-${report.date}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
