import { AdminProductItem, CSV_HEADER } from "@/data/admin-products-data";

/**
 * Parses CSV text with semicolon delimiter matching Nuvemshop format:
 * "Identificador URL";Nome;Categorias;"Nome da variação 1";"Valor da variação 1";"Nome da variação 2";"Valor da variação 2";"Nome da variação 3";"Valor da variação 3";Preço;"Preço promocional";"Peso (kg)";"Altura (cm)";"Largura (cm)";"Comprimento (cm)";Estoque;SKU;"Código de barras";"Exibir na loja";"Frete gratis";Descrição;Tags;"Título para SEO";"Descrição para SEO";Marca;"Produto Físico";"MPN (Cód. Exclusivo Modelo Fabricante)";Sexo;"Faixa etária";Custo;Visibilidade
 */
export function parseNuvemshopCsv(csvText: string): AdminProductItem[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const items: AdminProductItem[] = [];

  // Line 0 is header, parse from line 1
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = parseCsvLine(line, ";");
    if (columns.length < 2) continue;

    const urlSlug = cleanField(columns[0]) || `produto-${i}`;
    const name = cleanField(columns[1]);
    if (!name) continue;

    const categories = cleanField(columns[2]) || "Geral";
    const priceStr = cleanField(columns[10]).replace(",", ".");
    const promoStr = cleanField(columns[11]).replace(",", ".");
    const weightStr = cleanField(columns[12]).replace(",", ".");
    const heightStr = cleanField(columns[13]).replace(",", ".");
    const widthStr = cleanField(columns[14]).replace(",", ".");
    const lengthStr = cleanField(columns[15]).replace(",", ".");
    const stockStr = cleanField(columns[16]);
    const sku = cleanField(columns[17]);
    const barcode = cleanField(columns[18]);
    const displayInStoreStr = cleanField(columns[19]).toUpperCase();
    const freeShippingStr = cleanField(columns[20]).toUpperCase();
    const description = cleanField(columns[21]);
    const tags = cleanField(columns[22]);
    const seoTitle = cleanField(columns[23]);
    const seoDescription = cleanField(columns[24]);
    const brand = cleanField(columns[25]) || "Projeto Viva com Saúde";
    const isPhysicalStr = cleanField(columns[26]).toUpperCase();
    const mpn = cleanField(columns[27]);
    const gender = cleanField(columns[28]);
    const ageGroup = cleanField(columns[29]);
    const costStr = cleanField(columns[30]).replace(",", ".");
    const visibilityStr = cleanField(columns[31]);

    const price = parseFloat(priceStr) || 0;
    const promotionalPrice = parseFloat(promoStr) || 0;
    const weightKg = parseFloat(weightStr) || 0;
    const heightCm = parseFloat(heightStr) || 1;
    const widthCm = parseFloat(widthStr) || 1;
    const lengthCm = parseFloat(lengthStr) || 1;
    const cost = parseFloat(costStr) || 0;

    let stock: string | number = "Infinito";
    if (stockStr && !isNaN(Number(stockStr))) {
      stock = Number(stockStr);
    } else if (stockStr.toLowerCase() === "infinito" || !stockStr) {
      stock = "Infinito";
    }

    let visibility: "Visível" | "Não listado" | "Oculto" = "Visível";
    if (visibilityStr.toLowerCase().includes("oculto")) {
      visibility = "Oculto";
    } else if (visibilityStr.toLowerCase().includes("não listado")) {
      visibility = "Não listado";
    }

    items.push({
      id: urlSlug,
      urlSlug,
      name,
      categories,
      price,
      promotionalPrice,
      weightKg,
      heightCm,
      widthCm,
      lengthCm,
      stock,
      sku,
      barcode,
      displayInStore: displayInStoreStr !== "NÃO" && displayInStoreStr !== "NAO",
      freeShipping: freeShippingStr === "SIM",
      description,
      tags,
      seoTitle,
      seoDescription,
      brand,
      isPhysical: isPhysicalStr !== "NÃO" && isPhysicalStr !== "NAO",
      mpn,
      gender,
      ageGroup,
      cost,
      visibility,
      imagePositionIndex: i % 6,
    });
  }

  return items;
}

function cleanField(val?: string): string {
  if (!val) return "";
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  return s.replace(/""/g, '"').trim();
}

function parseCsvLine(line: string, delimiter: string = ";"): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Generates Nuvemshop-compatible CSV format matching user's spreadsheet export
 */
export function exportToNuvemshopCsv(products: AdminProductItem[]): string {
  const rows: string[] = [CSV_HEADER];

  for (const p of products) {
    const fields = [
      escapeCsv(p.urlSlug),
      escapeCsv(p.name),
      escapeCsv(p.categories),
      "", // Nome da variação 1
      "", // Valor da variação 1
      "", // Nome da variação 2
      "", // Valor da variação 2
      "", // Nome da variação 3
      "", // Valor da variação 3
      p.price.toFixed(2),
      p.promotionalPrice > 0 ? p.promotionalPrice.toFixed(2) : "",
      p.weightKg.toFixed(2),
      p.heightCm.toFixed(2),
      p.widthCm.toFixed(2),
      p.lengthCm.toFixed(2),
      typeof p.stock === "number" ? p.stock.toString() : "",
      escapeCsv(p.sku),
      escapeCsv(p.barcode),
      p.displayInStore ? "SIM" : "NÃO",
      p.freeShipping ? "SIM" : "NÃO",
      escapeCsv(p.description),
      escapeCsv(p.tags),
      escapeCsv(p.seoTitle),
      escapeCsv(p.seoDescription),
      escapeCsv(p.brand),
      p.isPhysical ? "SIM" : "NÃO",
      escapeCsv(p.mpn),
      escapeCsv(p.gender),
      escapeCsv(p.ageGroup),
      p.cost > 0 ? p.cost.toFixed(2) : "",
      escapeCsv(p.visibility),
    ];
    rows.push(fields.join(";"));
  }

  return rows.join("\r\n");
}

function escapeCsv(val?: string | number): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes(",")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
