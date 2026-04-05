import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FormEvent } from 'react';
import {
  FileUp, Loader2, LogOut, Pencil, Trash2,
  UtensilsCrossed, DoorOpen, TrendingUp, Layers, Archive,
  Moon, Smile, Shirt, LayoutGrid, TreePine, Square,
  Plus, X, ImagePlus, AlertCircle, ChevronLeft, Menu, CheckCircle2,
  Search,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCategoryName } from '../../constants/services';
import { LEGACY_MATERIAL_CATEGORY_SLUG } from '../../constants/materialsLegacy';
import { isPortfolioMaterialRow } from '../../utils/portfolioRow';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { usePortfolioImages } from '../../hooks/usePortfolioImages';
import { formatMoneyInput, makeStoragePath, parseProductName, encodeProductName, decodeProductName } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';
import { LangSwitcher } from '../ui/LangSwitcher';
import { AdminLoginForm } from './AdminLoginForm';
import type { Category } from '../../types';

// ─── Category Icons (slug → icon) ────────────────────────────────────────────
const CAT_ICONS: Record<string, ReactNode> = {
  kitchens:        <UtensilsCrossed size={16} strokeWidth={1.6} />,
  hallways:        <DoorOpen size={16} strokeWidth={1.6} />,
  bedrooms:        <Moon size={16} strokeWidth={1.6} />,
  kids:            <Smile size={16} strokeWidth={1.6} />,
  wardrobes:       <Archive size={16} strokeWidth={1.6} />,
  'dressing-rooms':<Shirt size={16} strokeWidth={1.6} />,
  stairs:          <TrendingUp size={16} strokeWidth={1.6} />,
  doors:           <DoorOpen size={16} strokeWidth={1.6} />,
  panels:          <Square size={16} strokeWidth={1.6} />,
  cladding:        <Layers size={16} strokeWidth={1.6} />,
  'wood-products': <TreePine size={16} strokeWidth={1.6} />,
  // eski sluglar uchun fallback
  windows:         <LayoutGrid size={16} strokeWidth={1.6} />,
  furniture:       <Archive size={16} strokeWidth={1.6} />,
  flooring:        <LayoutGrid size={16} strokeWidth={1.6} />,
  metal:           <Square size={16} strokeWidth={1.6} />,
};
const DEFAULT_ICON = <LayoutGrid size={16} strokeWidth={1.6} />;

/** Sidebar: katalogdan tashqari «Materiallar» bo'limi (DB dagi slug emas) */
const MATERIALS_SIDEBAR_SLUG = '__materials__';

// ─── Shared input class ──────────────────────────────────────────────────────
const INPUT_CLS =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm ' +
  'placeholder:text-white/25 focus:border-gold/70 focus:ring-2 focus:ring-gold/10 ' +
  'focus:outline-none hover:border-white/20 transition-all duration-200';

// ─── Skeleton card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/5 animate-pulse">
      <div className="h-56 bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/8 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
type AdminPageProps = {
  isEditPage: boolean;
  editImageId?: string;
};

export function AdminPage({ isEditPage, editImageId }: AdminPageProps) {
  const { portfolioImages, fetchPortfolioImages, loadingPortfolio } = usePortfolioImages();
  const { categories, loadingCategories } = useCategories();
  const { user, authLoading, signOut } = useAuth(true);
  const { t, lang } = useLanguage();

  const mapDbError = (msg: string) => {
    if (/is_material/i.test(msg) && (/schema|column|Could not find/i.test(msg))) {
      return t.admin.errors.isMaterialColumnMissing;
    }
    return msg;
  };

  const isLegacyMaterialSchemaError = (msg: string) =>
    /is_material/i.test(msg) && (/schema|column|Could not find/i.test(msg));

  const formatPrice = (price: number | null) =>
    price === null
      ? t.formatters.noPriceLabel
      : `${price.toLocaleString('ru-RU')} ${t.formatters.currency}`;

  // ── State ────────────────────────────────────────────────────────────────
  const [uploadError, setUploadError]           = useState('');
  const [uploadSuccess, setUploadSuccess]       = useState('');
  const [selectedFiles, setSelectedFiles]       = useState<File[]>([]);
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<string[]>([]);
  const [imageTitleUz, setImageTitleUz]         = useState('');
  const [imageTitleRu, setImageTitleRu]         = useState('');
  const [imagePrice, setImagePrice]             = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categorySearch, setCategorySearch]     = useState('');
  const [showCreatePanel, setShowCreatePanel]   = useState(false);
  const [editNameUz, setEditNameUz]             = useState('');
  const [editNameRu, setEditNameRu]             = useState('');
  const [editPrice, setEditPrice]               = useState('');
  const [editCategory, setEditCategory]         = useState<string>('');
  const [editFile, setEditFile]                 = useState<File | null>(null);
  const [editFilePreview, setEditFilePreview]   = useState('');
  const [isEditImageRemoved, setIsEditImageRemoved] = useState(false);
  const [editFileInputKey, setEditFileInputKey] = useState(0);
  const [isUploadingCreate, setIsUploadingCreate] = useState(false);
  const [isUpdatingEdit, setIsUpdatingEdit]     = useState(false);
  const [isDeletingEdit, setIsDeletingEdit]     = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [createAsMaterial, setCreateAsMaterial] = useState(false);
  const [editIsMaterial, setEditIsMaterial] = useState(false);

  const editingImage    = isEditPage ? portfolioImages.find((i) => i.id === editImageId) ?? null : null;
  const activeCat       = selectedCategory || categories[0]?.slug || '';
  const catImages       = useMemo(() => {
    if (activeCat === MATERIALS_SIDEBAR_SLUG) {
      return portfolioImages.filter((i) => isPortfolioMaterialRow(i));
    }
    return portfolioImages.filter(
      (i) => !isPortfolioMaterialRow(i) && i.category === activeCat,
    );
  }, [portfolioImages, activeCat]);
  const materialCount   = useMemo(
    () => portfolioImages.filter((i) => isPortfolioMaterialRow(i)).length,
    [portfolioImages],
  );
  const filteredCats    = categories.filter((c) =>
    getCategoryName(c, lang).toLowerCase().includes(categorySearch.toLowerCase()),
  );

  // Kategoriyalar yuklanganda birinchisini tanlash
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].slug);
    }
  }, [categories, selectedCategory]);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedFiles.length === 0) { setSelectedFilePreviews([]); return; }
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setSelectedFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  useEffect(() => {
    if (!isEditPage || !editImageId) return;
    const img = portfolioImages.find((i) => i.id === editImageId);
    if (!img) return;
    const decoded = decodeProductName(img.product_name ?? img.title);
    setEditNameUz(decoded.uz);
    setEditNameRu(decoded.ru);
    setEditPrice(img.price ? String(img.price) : '');
    const mat = isPortfolioMaterialRow(img);
    setEditIsMaterial(mat);
    setEditCategory(!mat && img.category ? img.category : categories[0]?.slug ?? '');
    setEditFile(null);
    setIsEditImageRemoved(false);
  }, [isEditPage, editImageId, portfolioImages, categories]);

  useEffect(() => {
    if (!showCreatePanel) return;
    setCreateAsMaterial(selectedCategory === MATERIALS_SIDEBAR_SLUG);
  }, [showCreatePanel, selectedCategory]);

  useEffect(() => {
    if (!editFile) { setEditFilePreview(''); return; }
    const url = URL.createObjectURL(editFile);
    setEditFilePreview(url);
    setIsEditImageRemoved(false);
    return () => URL.revokeObjectURL(url);
  }, [editFile]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const backToAdminPage = () => { window.location.href = '/login'; };
  const openEditPage    = (id: string) => { window.location.href = `/login/edit/${id}`; };
  const clearEditImage  = () => { setEditFile(null); setEditFilePreview(''); setIsEditImageRemoved(true); setEditFileInputKey((p) => p + 1); };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    const ae = t.admin.errors;
    if (!supabase)    { setUploadError(ae.supabaseNotConfigured); return; }
    if (!createAsMaterial) {
      if (!selectedCategory || selectedCategory === MATERIALS_SIDEBAR_SLUG) {
        setUploadError(ae.categoryRequired);
        return;
      }
    }
    if (selectedFiles.length === 0)           { setUploadError(ae.imageRequired); return; }
    if (!imageTitleUz.trim())                 { setUploadError(ae.nameRequired); return; }
    let createPrice: number | null = null;
    if (imagePrice.trim()) {
      const numPrice = Number(imagePrice.replace(/\s+/g, ''));
      if (isNaN(numPrice) || numPrice <= 0) { setUploadError(ae.priceRequired); return; }
      createPrice = numPrice;
    }
    const encodedName = encodeProductName(imageTitleUz, imageTitleRu);

    setUploadError(''); setUploadSuccess(''); setIsUploadingCreate(true);

    const rows: {
      title: string | null;
      product_name: string;
      price: number | null;
      image_url: string;
      category: string | null;
      is_material: boolean;
    }[] = [];
    const rowCategory = createAsMaterial ? null : selectedCategory;
    const rowIsMaterial = createAsMaterial;
    for (const file of selectedFiles) {
      const path = makeStoragePath(file);
      const { error: sErr } = await supabase.storage.from('portfolio').upload(path, file);
      if (sErr) { setUploadError(sErr.message); setIsUploadingCreate(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path);
      rows.push({
        title: encodedName,
        product_name: encodedName,
        price: createPrice,
        image_url: publicUrl,
        category: rowCategory,
        is_material: rowIsMaterial,
      });
    }

    let insertErr = (await supabase.from('portfolio_images').insert(rows)).error;
    if (insertErr && isLegacyMaterialSchemaError(insertErr.message)) {
      const legacyRows = rows.map((r) => {
        const base = {
          title: r.title,
          product_name: r.product_name,
          price: r.price,
          image_url: r.image_url,
        };
        return r.is_material
          ? { ...base, category: LEGACY_MATERIAL_CATEGORY_SLUG }
          : { ...base, category: r.category };
      });
      insertErr = (await supabase.from('portfolio_images').insert(legacyRows)).error;
    }
    if (insertErr) { setUploadError(mapDbError(insertErr.message)); setIsUploadingCreate(false); return; }

    setSelectedFiles([]); setSelectedFilePreviews([]); setImageTitleUz(''); setImageTitleRu(''); setImagePrice('');
    setShowCreatePanel(false); setUploadSuccess(`${rows.length} ${t.admin.success.added}`);
    setIsUploadingCreate(false); await fetchPortfolioImages();
  };

  const handleUpdateImage = async () => {
    if (!supabase || !editingImage) return;
    const ae = t.admin.errors;
    if (!editNameUz.trim()) { setUploadError(ae.nameRequired); return; }
    if (!editIsMaterial && !editCategory.trim()) { setUploadError(ae.categoryRequired); return; }
    let updatePrice: number | null = null;
    if (editPrice.trim()) {
      const numPrice = Number(editPrice.replace(/\s+/g, ''));
      if (isNaN(numPrice) || numPrice <= 0) { setUploadError(ae.priceRequired); return; }
      updatePrice = numPrice;
    }
    if (isEditImageRemoved && !editFile) { setUploadError(ae.newImageRequired); return; }
    const encodedName = encodeProductName(editNameUz, editNameRu);

    setUploadError(''); setIsUpdatingEdit(true);
    let nextUrl = editingImage.image_url;
    if (editFile) {
      const path = makeStoragePath(editFile);
      const { error: sErr } = await supabase.storage.from('portfolio').upload(path, editFile);
      if (sErr) { setUploadError(sErr.message); setIsUpdatingEdit(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path);
      nextUrl = publicUrl;
    }
    let updError = (
      await supabase
        .from('portfolio_images')
        .update({
          title: encodedName,
          product_name: encodedName,
          price: updatePrice,
          category: editIsMaterial ? null : editCategory,
          is_material: editIsMaterial,
          image_url: nextUrl,
        })
        .eq('id', editingImage.id)
    ).error;
    if (updError && isLegacyMaterialSchemaError(updError.message)) {
      updError = (
        await supabase
          .from('portfolio_images')
          .update({
            title: encodedName,
            product_name: encodedName,
            price: updatePrice,
            image_url: nextUrl,
            category: editIsMaterial ? LEGACY_MATERIAL_CATEGORY_SLUG : editCategory,
          })
          .eq('id', editingImage.id)
      ).error;
    }
    if (updError) { setUploadError(mapDbError(updError.message)); setIsUpdatingEdit(false); return; }
    setUploadSuccess(t.admin.success.updated); setIsUpdatingEdit(false); backToAdminPage(); await fetchPortfolioImages();
  };

  const handleDeleteImage = async () => {
    if (!supabase || !editingImage) return;
    setIsDeletingEdit(true); setShowDeleteConfirm(false);
    const { error } = await supabase.from('portfolio_images').delete().eq('id', editingImage.id);
    if (error) { setUploadError(error.message); setIsDeletingEdit(false); return; }
    setUploadSuccess(t.admin.success.deleted); setIsDeletingEdit(false); backToAdminPage(); await fetchPortfolioImages();
  };

  // ── Loading & auth guards ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <AdminLoginForm />;

  // ─────────────────────────────────────────────────────────────────────────
  // EDIT PAGE
  // ─────────────────────────────────────────────────────────────────────────
  if (isEditPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] to-[#0f1628] text-white">
        {/* Top bar */}
        <div className="border-b border-white/[0.07] px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={backToAdminPage}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
              <ChevronLeft size={16} />
              {t.admin.dashboard.backBtn}
            </button>
            <span className="text-white/20">|</span>
            <span className="text-white/80 text-sm font-medium">{t.admin.form.editTitle}</span>
          </div>
          <LangSwitcher />
        </div>

        <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
          {!editingImage ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
              <AlertCircle className="mx-auto text-white/30 mb-3" size={40} />
              <p className="text-white/50">{t.admin.form.notFound}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-white mb-1">{t.admin.form.editTitle}</h1>
                <p className="text-white/40 text-sm">{t.admin.form.editSubtitle}</p>
              </div>

              {/* Form grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left — fields */}
                <div className="rounded-2xl border border-white/10 bg-[#111827]/80 p-6 space-y-5">
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">{t.admin.form.kindLabel}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditIsMaterial(false);
                          if (!editCategory.trim()) setEditCategory(categories[0]?.slug ?? '');
                        }}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                          !editIsMaterial
                            ? 'border-gold/50 bg-gold/15 text-gold'
                            : 'border-white/10 bg-white/5 text-white/45 hover:border-white/20 hover:text-white/80'
                        }`}
                      >
                        {t.admin.form.kindCatalog}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditIsMaterial(true)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                          editIsMaterial
                            ? 'border-gold/50 bg-gold/15 text-gold'
                            : 'border-white/10 bg-white/5 text-white/45 hover:border-white/20 hover:text-white/80'
                        }`}
                      >
                        {t.admin.form.kindMaterial}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                      {t.admin.form.nameLabel}
                    </p>
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gold/70 pointer-events-none select-none">UZ</span>
                        <input id="edit-name-uz" type="text"
                          placeholder={t.admin.form.nameUzPlaceholder}
                          value={editNameUz}
                          onChange={(e) => setEditNameUz(e.target.value)}
                          className={INPUT_CLS + ' pl-10'}
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400/70 pointer-events-none select-none">RU</span>
                        <input id="edit-name-ru" type="text"
                          placeholder={t.admin.form.nameRuPlaceholder}
                          value={editNameRu}
                          onChange={(e) => setEditNameRu(e.target.value)}
                          className={INPUT_CLS + ' pl-10'}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="edit-price" className="text-white/60 text-xs font-medium uppercase tracking-wider block mb-2">
                      {t.admin.form.priceLabel}
                    </label>
                    <div className="relative">
                      <input id="edit-price" type="text" inputMode="numeric" placeholder="0"
                        value={formatMoneyInput(editPrice)}
                        onChange={(e) => setEditPrice(e.target.value.replace(/\s+/g, ''))}
                        className={INPUT_CLS + ' pr-16'} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold text-xs font-semibold">UZS</span>
                    </div>
                  </div>
                  {!editIsMaterial && (
                    <div>
                      <label className="text-white/60 text-xs font-medium uppercase tracking-wider block mb-2">
                        {t.admin.form.categoryLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,169,110,0.2) transparent' }}>
                        {categories.map((cat) => (
                          <button key={cat.slug} type="button"
                            onClick={() => setEditCategory(cat.slug)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                              editCategory === cat.slug
                                ? 'bg-gold/15 border border-gold/50 text-gold'
                                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                            }`}
                          >
                            <span className="shrink-0">{CAT_ICONS[cat.slug] ?? DEFAULT_ICON}</span>
                            {getCategoryName(cat, lang)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right — image */}
                <div className="rounded-2xl border border-white/10 bg-[#111827]/80 p-6">
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">{t.admin.form.imageLabel}</p>
                  <label htmlFor="edit-img" className="sr-only">Rasm tanlash</label>
                  <input key={editFileInputKey} id="edit-img" type="file" accept="image/*"
                    onChange={(e) => setEditFile(e.target.files?.[0] ?? null)} className="hidden" />

                  {!isEditImageRemoved && (editFilePreview || editingImage.image_url) ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10">
                      <img src={editFilePreview || editingImage.image_url} alt="Rasm"
                        className="w-full h-56 object-contain bg-navy/60 p-2" />
                      <button type="button" onClick={clearEditImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                            title={t.admin.form.removeImage}>
                        <X size={14} />
                      </button>
                      <label htmlFor="edit-img"
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <ImagePlus size={13} /> {t.admin.form.changeImage}
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="edit-img"
                      className="flex flex-col items-center justify-center gap-3 h-56 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] cursor-pointer hover:border-gold/40 hover:bg-white/5 transition-all duration-200">
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                        <FileUp size={20} className="text-gold" />
                      </div>
                      <div className="text-center">
                          <p className="text-white/70 text-sm font-medium">{t.admin.form.dropLabel}</p>
                        <p className="text-white/30 text-xs mt-0.5">{t.admin.form.dropSub}</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Error / success */}
              {uploadError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{uploadError}</p>
                </div>
              )}
              {uploadSuccess && (
                <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                  <p className="text-green-300 text-sm">{uploadSuccess}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button                     type="button" onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeletingEdit || isUpdatingEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all disabled:opacity-50">
                  {isDeletingEdit ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  {isDeletingEdit ? t.admin.form.deleting : t.admin.form.deleteBtn}
                </button>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={backToAdminPage} disabled={isUpdatingEdit || isDeletingEdit}
                    className="px-5 py-2.5 rounded-xl text-white/50 hover:text-white text-sm transition-colors disabled:opacity-50">
                    {t.admin.form.cancelBtn}
                  </button>
                  <button type="button" onClick={handleUpdateImage}
                    disabled={isUpdatingEdit || isDeletingEdit}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gold hover:bg-[#e0b84a] text-navy font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-gold/20">
                    {isUpdatingEdit ? <><Loader2 size={15} className="animate-spin" />{t.admin.form.saving}</> : t.admin.form.saveBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete confirm modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative z-10 w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-400" size={20} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{t.admin.deleteConfirm.title}</h3>
              <p className="text-white/50 text-sm mb-6">{t.admin.deleteConfirm.body}</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white text-sm transition-colors">
                  {t.admin.deleteConfirm.cancel}
                </button>
                <button type="button" onClick={handleDeleteImage}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors">
                  {t.admin.deleteConfirm.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] to-[#0d1321] text-white flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-white/[0.06] bg-[#090d1b]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button type="button" onClick={() => setMobileSidebarOpen((v) => !v)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <img src="/logo/logo.jpg" alt="Iskandar Home" className="h-7 w-7 rounded-sm object-cover ring-1 ring-gold/40" />
          <span className="font-display text-sm text-white hidden sm:block">Iskandar Home</span>
          <span className="text-white/20 hidden sm:block">•</span>
          <span className="text-white/40 text-xs hidden sm:block">{t.admin.dashboard.panelTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">
              {user.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-white/50 text-xs max-w-[160px] truncate">{user.email}</span>
          </div>
          <LangSwitcher />
          <button type="button" onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition-all">
            <LogOut size={13} />
            <span className="hidden sm:block">{t.admin.dashboard.signOut}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-10 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-20 lg:z-auto
          w-64 flex flex-col
          bg-[#090d1b] border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-14 lg:pt-0
        `}>
          {/* Sidebar header: label */}
          <div className="shrink-0 px-4 pt-4 pb-2">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-[0.18em] px-1 mb-3">
              {t.admin.dashboard.categoriesLabel}
            </p>
            {/* Qidiruv */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Qidirish..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>
          </div>

          {/* Scrollable category list */}
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,169,110,0.2) transparent' }}>

            {loadingCategories && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            )}

            {!loadingCategories && filteredCats.length === 0 && categorySearch.trim() !== '' && (
              <p className="text-white/25 text-xs text-center py-6">Topilmadi</p>
            )}

            {!loadingCategories && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(MATERIALS_SIDEBAR_SLUG);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-1
                  transition-all duration-200 group
                  ${activeCat === MATERIALS_SIDEBAR_SLUG
                    ? 'bg-gold/12 border border-gold/35 text-gold'
                    : 'border border-transparent text-white/55 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <span className={`shrink-0 transition-colors ${activeCat === MATERIALS_SIDEBAR_SLUG ? 'text-gold' : 'text-white/25 group-hover:text-white/60'}`}>
                  <Layers size={16} strokeWidth={1.6} />
                </span>
                <span className="flex-1 text-left font-medium text-[13px] leading-snug">
                  {t.admin.dashboard.materialsSection}
                </span>
                {materialCount > 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0 ${
                    activeCat === MATERIALS_SIDEBAR_SLUG ? 'bg-gold/25 text-gold' : 'bg-white/8 text-white/35'
                  }`}>
                    {materialCount}
                  </span>
                )}
              </button>
            )}

            {!loadingCategories && filteredCats.map((cat: Category) => {
              const isActive = activeCat === cat.slug;
              const count = portfolioImages.filter(
                (i) => !isPortfolioMaterialRow(i) && i.category === cat.slug,
              ).length;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => { setSelectedCategory(cat.slug); setMobileSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gold/12 border border-gold/35 text-gold'
                      : 'border border-transparent text-white/55 hover:text-white hover:bg-white/[0.06]'
                    }
                  `}
                >
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-gold' : 'text-white/25 group-hover:text-white/60'}`}>
                    {CAT_ICONS[cat.slug] ?? DEFAULT_ICON}
                  </span>
                  <span className="flex-1 text-left font-medium text-[13px] leading-snug">
                    {getCategoryName(cat, lang)}
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0 ${
                      isActive ? 'bg-gold/25 text-gold' : 'bg-white/8 text-white/35'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom info */}
          <div className="shrink-0 p-3 border-t border-white/[0.06]">
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Admin</p>
              <p className="text-white/60 text-xs truncate">{user.email}</p>
              <button type="button" onClick={signOut}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-all">
                <LogOut size={12} />
                {t.admin.dashboard.signOut}
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-7 max-w-[1400px] mx-auto">

            {/* Content header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl lg:text-3xl text-white">
                  {activeCat === MATERIALS_SIDEBAR_SLUG
                    ? t.admin.dashboard.materialsSection
                    : (() => {
                        const c = categories.find((x) => x.slug === activeCat) ?? categories[0];
                        return c ? getCategoryName(c, lang) : '';
                      })()}
                </h1>
                <p className="text-white/35 text-sm mt-0.5">
                  {loadingPortfolio ? '...' : `${catImages.length} ${t.admin.dashboard.productCountSuffix}`}
                </p>
              </div>
              <button type="button" onClick={() => setShowCreatePanel(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-[#e0b84a] text-navy font-semibold text-sm transition-all shadow-lg shadow-gold/20">
                <Plus size={16} />
                <span className="hidden sm:block">{t.admin.dashboard.addBtn}</span>
              </button>
            </div>

            {/* Supabase warning */}
            {!supabase && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-5">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{t.admin.dashboard.supabaseWarning}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 mb-5">
                <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                <p className="text-green-300 text-sm">{uploadSuccess}</p>
              </div>
            )}

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">

              {/* Skeleton loading */}
              {loadingPortfolio && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

              {/* Product cards */}
              {!loadingPortfolio && catImages.map((item) => {
                const displayName = parseProductName(item.product_name ?? item.title, lang) || 'Nomsiz model';
                return (
                  <div key={item.id}
                    className="group relative rounded-2xl overflow-hidden bg-[#111827] border border-white/[0.07] hover:border-gold/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 cursor-pointer"
                    onClick={() => openEditPage(item.id)}
                  >
                    {/* Edit badge */}
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-gold/90 text-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <Pencil size={13} />
                    </div>

                    {/* Image */}
                    <div className="overflow-hidden h-56 bg-[#0d1424]">
                      <img src={item.image_url} alt={displayName}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" />
                    </div>

                    {/* Info */}
                    <div className="p-4 pb-3">
                      <p className="text-white font-medium text-sm leading-snug truncate">{displayName}</p>
                      <p className="text-gold text-sm mt-1.5 font-semibold">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Empty state (no items + no loading) */}
              {!loadingPortfolio && catImages.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                    {activeCat === MATERIALS_SIDEBAR_SLUG ? (
                      <Layers size={28} strokeWidth={1.4} className="text-white/25" />
                    ) : (
                      CAT_ICONS[selectedCategory] ?? DEFAULT_ICON
                    )}
                  </div>
                  <div>
                    <p className="text-white/50 font-medium">{t.admin.dashboard.emptyTitle}</p>
                    <p className="text-white/25 text-sm mt-1">{t.admin.dashboard.emptySub}</p>
                  </div>
                  <button type="button" onClick={() => setShowCreatePanel(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/15 text-sm transition-all">
                    <Plus size={15} />
                    {t.admin.dashboard.addBtn}
                  </button>
                </div>
              )}

              {/* Add new card */}
              {!loadingPortfolio && catImages.length > 0 && (
                <button type="button" onClick={() => setShowCreatePanel(true)}
                  className="group rounded-2xl border-2 border-dashed border-white/10 bg-transparent hover:border-gold/40 hover:bg-gold/[0.04] min-h-[220px] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-gold/10 group-hover:border-gold/30 flex items-center justify-center transition-all duration-300">
                    <Plus size={22} className="text-white/30 group-hover:text-gold transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 group-hover:text-white/70 text-sm font-medium transition-colors">{t.admin.dashboard.addNewLabel}</p>
                    <p className="text-white/20 text-xs mt-0.5">{t.admin.dashboard.addNewSub}</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Create modal ─────────────────────────────────────────────────────── */}
      {showCreatePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowCreatePanel(false)} />
          <form onSubmit={handleUpload}
            className="relative z-10 w-full max-w-3xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <h2 className="font-display text-xl text-white">
                  {createAsMaterial ? t.admin.form.createMaterialTitle : t.admin.form.createCatalogTitle}
                </h2>
                <p className="text-white/35 text-xs mt-0.5">
                  {createAsMaterial
                    ? t.admin.form.kindMaterial
                    : (() => {
                        const c =
                          selectedCategory && selectedCategory !== MATERIALS_SIDEBAR_SLUG
                            ? categories.find((x) => x.slug === selectedCategory)
                            : categories[0];
                        return c ? getCategoryName(c, lang) : '';
                      })()}
                </p>
              </div>
              <button type="button" onClick={() => setShowCreatePanel(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left */}
              <div className="space-y-4">
                <div>
                  <p className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2">{t.admin.form.kindLabel}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateAsMaterial(false);
                        if (selectedCategory === MATERIALS_SIDEBAR_SLUG) {
                          setSelectedCategory(categories[0]?.slug ?? '');
                        }
                      }}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                        !createAsMaterial
                          ? 'border-gold/50 bg-gold/15 text-gold'
                          : 'border-white/10 bg-white/5 text-white/45 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {t.admin.form.kindCatalog}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateAsMaterial(true)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                        createAsMaterial
                          ? 'border-gold/50 bg-gold/15 text-gold'
                          : 'border-white/10 bg-white/5 text-white/45 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {t.admin.form.kindMaterial}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2">
                    {t.admin.form.nameLabel}
                  </p>
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gold/70 pointer-events-none select-none">UZ</span>
                      <input id="c-name-uz" type="text"
                        placeholder={t.admin.form.nameUzPlaceholder}
                        value={imageTitleUz}
                        onChange={(e) => setImageTitleUz(e.target.value)}
                        className={INPUT_CLS + ' pl-10'}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400/70 pointer-events-none select-none">RU</span>
                      <input id="c-name-ru" type="text"
                        placeholder={t.admin.form.nameRuPlaceholder}
                        value={imageTitleRu}
                        onChange={(e) => setImageTitleRu(e.target.value)}
                        className={INPUT_CLS + ' pl-10'}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="c-price" className="text-white/55 text-xs font-medium uppercase tracking-wider block mb-2">
                    {t.admin.form.priceLabel}
                  </label>
                  <div className="relative">
                    <input id="c-price" type="text" inputMode="numeric" placeholder="0"
                      value={imagePrice} onChange={(e) => setImagePrice(formatMoneyInput(e.target.value))}
                      className={INPUT_CLS + ' pr-16'} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold text-xs font-semibold">UZS</span>
                  </div>
                </div>
                {!createAsMaterial && (
                  <div>
                    <p className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2">{t.admin.form.categoryLabel}</p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,169,110,0.2) transparent' }}>
                      {categories.map((cat) => (
                        <button key={cat.slug} type="button" onClick={() => setSelectedCategory(cat.slug)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                            selectedCategory === cat.slug
                              ? 'bg-gold/15 border border-gold/50 text-gold'
                              : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                          }`}>
                          <span className="shrink-0">{CAT_ICONS[cat.slug] ?? DEFAULT_ICON}</span>
                          {getCategoryName(cat, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — image upload */}
              <div>
                <p className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2">{t.admin.form.imageLabel}</p>
                <label htmlFor="c-imgs" className="sr-only">Rasmlar</label>
                <input id="c-imgs" type="file" multiple accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                  className="hidden" />
                {selectedFilePreviews.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {selectedFilePreviews.slice(0, 3).map((p, i) => (
                        <img key={i} src={p} alt={`Rasm ${i + 1}`}
                          className="w-full aspect-square rounded-xl object-cover border border-white/10" />
                      ))}
                    </div>
                    {selectedFiles.length > 3 && (
                      <p className="text-white/30 text-xs text-center">+{selectedFiles.length - 3} ta rasm</p>
                    )}
                    <label htmlFor="c-imgs"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs cursor-pointer transition-all">
                      <ImagePlus size={13} /> {t.admin.form.replaceLabel}
                    </label>
                  </div>
                ) : (
                  <label htmlFor="c-imgs"
                    className="flex flex-col items-center justify-center gap-3 h-52 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] cursor-pointer hover:border-gold/40 hover:bg-white/[0.04] transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center">
                      <FileUp size={20} className="text-gold" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-sm font-medium">{t.admin.form.dropLabel}</p>
                    <p className="text-white/25 text-xs mt-0.5">{t.admin.form.dropSub}</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Modal footer */}
            {(uploadError || uploadSuccess) && (
              <div className="px-6 pb-2">
                {uploadError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{uploadError}</p>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    <p className="text-green-300 text-sm">{uploadSuccess}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/[0.07]">
              <button type="button" onClick={() => setShowCreatePanel(false)} disabled={isUploadingCreate}
                className="px-5 py-2.5 rounded-xl text-white/50 hover:text-white text-sm transition-colors disabled:opacity-50">
                {t.admin.form.cancelBtn}
              </button>
              <button type="submit" disabled={isUploadingCreate}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gold hover:bg-[#e0b84a] text-navy font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-gold/20">
                {isUploadingCreate ? <><Loader2 size={15} className="animate-spin" />{t.admin.form.saving}</> : t.admin.form.saveBtn}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
