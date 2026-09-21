import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUpDown,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Layers,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
  Cloud,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminProductItem,
  getCachedAdminProducts,
  subscribeAdminProducts,
  saveAdminProductToFirestore,
  deleteAdminProductFromFirestore,
  saveAllAdminProductsToFirestore,
} from "@/data/admin-products-data";
import { exportToNuvemshopCsv, parseNuvemshopCsv } from "@/lib/nuvemshop-csv";
import productsImage from "@/assets/viva-products.jpg";
import { ProductDetail } from "@/components/admin/product-detail";

export function ProductsList() {
  const [products, setProducts] = useState<AdminProductItem[]>(() => getCachedAdminProducts());

  useEffect(() => {
    const unsubscribe = subscribeAdminProducts((loaded) => {
      setProducts(loaded);
    });
    return () => unsubscribe();
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<
    "mais-novo" | "nome" | "menor-preco" | "maior-preco"
  >("mais-novo");
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);

  // Modals
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<AdminProductItem | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("todas");
  const [productToDelete, setProductToDelete] = useState<AdminProductItem | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveProductsState = (updated: AdminProductItem[]) => {
    setProducts(updated);
  };

  // Inline price editing
  const handlePriceChange = (id: string, field: "price" | "promotionalPrice", val: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const updatedProd = { ...target, [field]: val };
    const updatedList = products.map((p) => (p.id === id ? updatedProd : p));
    setProducts(updatedList);
    saveAdminProductToFirestore(updatedProd).catch((err) => {
      console.error("Erro ao salvar preço no Firestore:", err);
    });
  };

  // Delete product directly
  const confirmDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setProductToDelete(null);
    deleteAdminProductFromFirestore(id)
      .then(() => toast.success("Produto excluído do Firestore com sucesso!"))
      .catch((err) => {
        console.error("Erro ao excluir do Firestore:", err);
        toast.error("Erro ao excluir produto no Firestore.");
      });
  };

  // Bulk delete
  const confirmBulkDelete = () => {
    const count = selectedIds.length;
    const idsToDelete = [...selectedIds];
    const updated = products.filter((p) => !selectedIds.includes(p.id));
    setProducts(updated);
    setSelectedIds([]);
    setShowBulkDeleteModal(false);

    Promise.all(idsToDelete.map((id) => deleteAdminProductFromFirestore(id)))
      .then(() => toast.success(`${count} produto(s) excluído(s) do Firestore!`))
      .catch(() => toast.error("Erro ao excluir alguns produtos do Firestore."));
  };

  // Duplicate product
  const handleDuplicateProduct = (prod: AdminProductItem) => {
    const newProduct: AdminProductItem = {
      ...prod,
      id: `${prod.urlSlug}-copia-${Date.now().toString().slice(-4)}`,
      urlSlug: `${prod.urlSlug}-copia-${Date.now().toString().slice(-4)}`,
      name: `${prod.name} (Cópia)`,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveAdminProductToFirestore(newProduct)
      .then(() => toast.success(`Produto "${prod.name}" duplicado no Firestore!`))
      .catch(() => toast.error("Erro ao salvar produto duplicado no Firestore."));
  };

  // Bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const csvData = exportToNuvemshopCsv(products);
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `produtos_nuvemshop_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportImportModal(false);
  };

  // CSV Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const imported = parseNuvemshopCsv(text);
        if (imported.length === 0) {
          setImportStatusMessage("Nenhum produto válido encontrado no arquivo CSV.");
          return;
        }

        // Merge or replace
        const existingMap = new Map(products.map((p) => [p.urlSlug, p]));
        for (const item of imported) {
          existingMap.set(item.urlSlug, item);
        }

        const merged = Array.from(existingMap.values());
        setProducts(merged);
        saveAllAdminProductsToFirestore(merged)
          .then(() => {
            setImportStatusMessage(
              `Sucesso! ${imported.length} produtos importados e salvos no Firestore com êxito.`,
            );
            setTimeout(() => {
              setImportStatusMessage(null);
              setShowExportImportModal(false);
            }, 2500);
          })
          .catch((err) => {
            console.error("Erro ao salvar CSV no Firestore:", err);
            setImportStatusMessage("Erro ao sincronizar produtos com o Firestore.");
          });
      } catch {
        setImportStatusMessage(
          "Erro ao processar o arquivo. Verifique se o formato coincide com o modelo Nuvemshop.",
        );
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // New product
  const handleCreateNewProduct = () => {
    const newId = `produto-${Date.now().toString().slice(-6)}`;
    const newProd: AdminProductItem = {
      id: newId,
      urlSlug: newId,
      name: "",
      categories: "",
      price: 0,
      promotionalPrice: 0,
      weightKg: 0,
      heightCm: 0,
      widthCm: 0,
      lengthCm: 0,
      stock: "Infinito",
      sku: "",
      barcode: "",
      displayInStore: true,
      freeShipping: false,
      description: "",
      tags: "",
      seoTitle: "",
      seoDescription: "",
      brand: "",
      isPhysical: true,
      mpn: "",
      gender: "",
      ageGroup: "",
      cost: 0,
      visibility: "Visível",
      imagePositionIndex: 0,
      benefits: "",
      composition: "",
      usage: "",
      customTabs: [],
    };
    setEditingProduct(newProd);
  };

  // Categories for filter
  const allCategories = Array.from(
    new Set(
      products
        .flatMap((p) => p.categories.split(","))
        .map((c) => c.trim())
        .filter(Boolean),
    ),
  );

  // Filtering & Sorting
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categories.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "todas" ||
      p.categories.toLowerCase().includes(filterCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "nome") return a.name.localeCompare(b.name);
    if (sortOption === "menor-preco") return a.promotionalPrice - b.promotionalPrice;
    if (sortOption === "maior-preco") return b.promotionalPrice - a.promotionalPrice;
    return 0; // "mais-novo" default
  });

  const bgPositions = ["0%", "20%", "40%", "60%", "80%", "100%"];

  // If in edit view
  if (editingProduct) {
    return (
      <ProductDetail
        product={editingProduct}
        onBack={() => setEditingProduct(null)}
        onSave={(updated, andExit = false) => {
          const index = products.findIndex((p) => p.id === updated.id);
          let updatedList: AdminProductItem[];
          if (index >= 0) {
            updatedList = [...products];
            updatedList[index] = updated;
          } else {
            updatedList = [updated, ...products];
          }
          setProducts(updatedList);
          saveAdminProductToFirestore(updated)
            .then(() => toast.success("Produto salvo no Firestore com sucesso!"))
            .catch((err) => {
              console.error("Erro ao salvar no Firestore:", err);
              toast.error("Erro ao salvar produto no Firestore.");
            });
          if (andExit) {
            setEditingProduct(null);
          } else {
            setEditingProduct(updated);
          }
        }}
        onDelete={(id) => {
          confirmDeleteProduct(id);
          setEditingProduct(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header matching Nuvemshop screenshot */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Produtos</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              Firestore Ativo
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const cycleMap: Record<
                  string,
                  "mais-novo" | "nome" | "menor-preco" | "maior-preco"
                > = {
                  "mais-novo": "nome",
                  nome: "menor-preco",
                  "menor-preco": "maior-preco",
                  "maior-preco": "mais-novo",
                };
                const next = cycleMap[sortOption] || "mais-novo";
                setSortOption(next);
                const labels = {
                  "mais-novo": "Mais novo",
                  nome: "Nome (A - Z)",
                  "menor-preco": "Menor preço",
                  "maior-preco": "Maior preço",
                };
                toast.info(`Ordenado por: ${labels[next]}`);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
              title="Alternar critério de ordenação"
            >
              <Layers className="h-3.5 w-3.5 text-gray-500" />
              <span>Organizar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportImportModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-gray-500" />
              <span>Exportar e Importar</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewProduct}
              className="flex items-center gap-1.5 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar produto</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos por nome, SKU ou tags"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6] shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Category filter select */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-2xs focus:border-[#0066d6] focus:outline-hidden"
            >
              <option value="todas">Todas as categorias</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort options */}
            <div className="flex items-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(
                    e.target.value as "mais-novo" | "nome" | "menor-preco" | "maior-preco",
                  )
                }
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-hidden cursor-pointer"
              >
                <option value="mais-novo">Mais novo</option>
                <option value="nome">Nome (A - Z)</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter and Bulk Action */}
        <div className="flex items-center justify-between py-2 text-xs text-gray-500 font-medium">
          <span>{sortedProducts.length} produtos</span>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">
                {selectedIds.length} selecionado(s)
              </span>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50 text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir selecionados
              </button>
            </div>
          )}
        </div>

        {/* Products Table matching screenshot */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 && selectedIds.length === filteredProducts.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                    />
                  </th>
                  <th className="px-4 py-3 min-w-[320px]">Produto</th>
                  <th className="px-4 py-3 min-w-[120px]">Estoque</th>
                  <th className="px-4 py-3 min-w-[130px]">Preço</th>
                  <th className="px-4 py-3 min-w-[130px]">Promocional</th>
                  <th className="px-4 py-3 text-right min-w-[130px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedProducts.map((prod) => {
                  const isSelected = selectedIds.includes(prod.id);
                  const imgBg = bgPositions[prod.imagePositionIndex % bgPositions.length];

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(prod.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                        />
                      </td>

                      {/* Product Thumbnail + Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div
                            onClick={() => setEditingProduct(prod)}
                            className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden cursor-pointer shadow-2xs hover:border-[#0066d6]"
                          >
                            <img
                              src={
                                (prod.images && prod.images[0]) || prod.imageUrl || productsImage
                              }
                              alt={prod.name}
                              className="h-full w-full object-cover"
                              style={
                                (prod.images && prod.images[0]) || prod.imageUrl
                                  ? undefined
                                  : { objectPosition: imgBg }
                              }
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(prod)}
                              className="font-bold text-[#0066d6] hover:underline text-left text-xs line-clamp-1"
                            >
                              {prod.name}
                            </button>
                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                              {prod.categories}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          {typeof prod.stock === "number" ? (
                            `${prod.stock} un.`
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="text-base leading-none">∞</span> Infinito
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Preço (Editable input) */}
                      <td className="px-4 py-3.5">
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-medium">
                            R$
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={prod.price === 0 ? "" : prod.price}
                            placeholder="0,00"
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              const num = val === "" ? 0 : parseFloat(val.replace(",", ".")) || 0;
                              handlePriceChange(prod.id, "price", num);
                            }}
                            className="w-full rounded-md border border-gray-300 pl-7 pr-2 py-1 text-xs font-semibold text-gray-900 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6]"
                          />
                        </div>
                      </td>

                      {/* Preço Promocional (Editable input) */}
                      <td className="px-4 py-3.5">
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-medium">
                            R$
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={prod.promotionalPrice === 0 ? "" : prod.promotionalPrice}
                            placeholder="0,00"
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              const num = val === "" ? 0 : parseFloat(val.replace(",", ".")) || 0;
                              handlePriceChange(prod.id, "promotionalPrice", num);
                            }}
                            className="w-full rounded-md border border-gray-300 pl-7 pr-2 py-1 text-xs font-semibold text-gray-900 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6]"
                          />
                        </div>
                      </td>

                      {/* Ações: Share, Duplicate, Delete */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 text-gray-500">
                          <button
                            type="button"
                            onClick={() => {
                              setShowShareModal(prod);
                              setShareCopied(false);
                            }}
                            className="rounded-md p-1.5 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Compartilhar produto"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateProduct(prod)}
                            className="rounded-md p-1.5 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Duplicar produto"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Exportar e Importar */}
      {showExportImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#0066d6]" />
                <h3 className="text-base font-bold text-gray-900">Exportar e Importar Produtos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportImportModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {importStatusMessage && (
              <div className="rounded-lg bg-blue-50 p-3 text-xs font-medium text-[#0066d6] border border-blue-200">
                {importStatusMessage}
              </div>
            )}

            {/* Export section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                1. Exportar planilha Nuvemshop
              </h4>
              <p className="text-xs text-gray-500">
                Baixe o arquivo CSV exatamente no formato oficial da Nuvemshop (delimitador ponto e
                vírgula com todas as 32 colunas).
              </p>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4 text-[#0066d6]" />
                Baixar planilha CSV ({products.length} produtos)
              </button>
            </div>

            {/* Import section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                2. Importar planilha atualizada
              </h4>
              <p className="text-xs text-gray-500">
                Selecione o arquivo CSV editado no Excel ou Bloco de Notas para atualizar preços,
                estoques e descrições instantaneamente.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileImport}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
              >
                <Upload className="h-4 w-4" />
                Selecionar arquivo CSV para importar
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExportImportModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Compartilhar Produto */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Compartilhar produto</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800">{showShareModal.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Copie o link direto da página do produto para enviar aos clientes ou redes sociais:
              </p>

              <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-600">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/produto/${showShareModal.urlSlug}`}
                  className="w-full bg-transparent text-xs text-gray-800 focus:outline-hidden truncate"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const url = `${window.location.origin}/produto/${showShareModal.urlSlug}`;
                    try {
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(url);
                      } else {
                        const textarea = document.createElement("textarea");
                        textarea.value = url;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand("copy");
                        document.body.removeChild(textarea);
                      }
                      setShareCopied(true);
                      toast.success("Link do produto copiado!");
                      setTimeout(() => setShareCopied(false), 2000);
                    } catch {
                      toast.error("Não foi possível copiar automaticamente.");
                    }
                  }}
                  className="flex shrink-0 items-center gap-1 rounded bg-[#0066d6] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#0052ad]"
                >
                  {shareCopied ? (
                    <>
                      <Check className="h-3 w-3" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <a
                href={`/produto/${showShareModal.urlSlug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-[#0066d6] hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir na loja
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de exclusão individual */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Excluir produto</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Tem certeza de que deseja excluir o produto{" "}
                  <strong className="text-gray-800 font-semibold">"{productToDelete.name}"</strong>?
                  Ele será removido permanentemente da loja e do catálogo.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteProduct(productToDelete.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Sim, excluir produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de exclusão em massa */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Excluir {selectedIds.length} produto{selectedIds.length > 1 ? "s" : ""}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Tem certeza de que deseja excluir todos os{" "}
                  <strong className="text-gray-800 font-semibold">{selectedIds.length}</strong>{" "}
                  produtos selecionados? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Sim, excluir selecionados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
