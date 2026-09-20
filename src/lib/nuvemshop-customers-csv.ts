import { AdminCustomerItem, CUSTOMER_CSV_HEADER } from "@/data/admin-customers-data";

/**
 * Parses customers CSV matching Nuvemshop format:
 * "Nome completo";CPF/CNPJ;E-mail;"Telefone de Contato";Gênero;"Data de nascimento";Endereço;Número;Complemento;Cidade;Bairro;Estado;CEP;País;"Total Consumido (BRL)";"Número de Compras";"Última Compra";Data;Cadastrado;"Inscrição para newsletter";Marketing;"Marketing (atualização)";Tags
 */
export function parseCustomersCsv(csvText: string): AdminCustomerItem[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const items: AdminCustomerItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = parseCsvLine(line, ";");
    if (columns.length < 3) continue;

    const fullName = cleanField(columns[0]) || "Sem nome";
    const cpfCnpj = cleanField(columns[1]);
    const email = cleanField(columns[2]);
    const phone = cleanField(columns[3]);
    const gender = cleanField(columns[4]);
    const birthDate = cleanField(columns[5]);
    const address = cleanField(columns[6]);
    const number = cleanField(columns[7]);
    const complement = cleanField(columns[8]);
    const city = cleanField(columns[9]);
    const neighborhood = cleanField(columns[10]);
    const state = cleanField(columns[11]);
    const cep = cleanField(columns[12]);
    const country = cleanField(columns[13]) || "Brasil";

    const totalSpentStr = cleanField(columns[14]).replace(",", ".");
    const purchasesCountStr = cleanField(columns[15]);
    const lastPurchaseDate = cleanField(columns[16]);
    const registrationDate = cleanField(columns[17]);
    const registeredStr = cleanField(columns[18]).toUpperCase();
    const newsletterStr = cleanField(columns[19]).toUpperCase();
    const marketingStr = cleanField(columns[20]);
    const marketingUpdateDate = cleanField(columns[21]);
    const tags = cleanField(columns[22]);

    const totalSpent = parseFloat(totalSpentStr) || 0;
    const purchasesCount = parseInt(purchasesCountStr, 10) || 0;

    const id =
      (email || cpfCnpj || fullName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 40) || `cliente-${i}`;

    items.push({
      id,
      fullName,
      cpfCnpj,
      email,
      phone,
      gender,
      birthDate,
      address,
      number,
      complement,
      city,
      neighborhood,
      state,
      cep,
      country,
      totalSpent,
      purchasesCount,
      lastPurchaseDate,
      lastOrderNumber: `#${100 + i}`,
      registrationDate,
      registered: registeredStr === "SIM",
      newsletter: newsletterStr === "SIM" || newsletterStr.includes("-"),
      marketing:
        marketingStr.toLowerCase().includes("aceita") && !marketingStr.toLowerCase().includes("não")
          ? "Aceita"
          : "Não aceita",
      marketingUpdateDate,
      tags,
      notes: "",
      priceTable: "",
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
 * Generates Nuvemshop-compatible Customers CSV format matching user's spreadsheet export
 */
export function exportToCustomersCsv(customers: AdminCustomerItem[]): string {
  const rows: string[] = [CUSTOMER_CSV_HEADER];

  for (const c of customers) {
    const fields = [
      escapeCsv(c.fullName),
      escapeCsv(c.cpfCnpj),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.gender),
      escapeCsv(c.birthDate),
      escapeCsv(c.address),
      escapeCsv(c.number),
      escapeCsv(c.complement),
      escapeCsv(c.city),
      escapeCsv(c.neighborhood),
      escapeCsv(c.state),
      escapeCsv(c.cep),
      escapeCsv(c.country),
      c.totalSpent.toFixed(2),
      c.purchasesCount.toString(),
      escapeCsv(c.lastPurchaseDate),
      escapeCsv(c.registrationDate),
      c.registered ? "SIM" : "NÃO",
      c.newsletter ? "SIM" : "NÃO",
      escapeCsv(c.marketing),
      escapeCsv(c.marketingUpdateDate),
      escapeCsv(c.tags),
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
