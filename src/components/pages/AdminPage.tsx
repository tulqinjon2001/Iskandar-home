import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FileUp, Loader2, LogOut, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SERVICES, SERVICE_KEYS } from '../../constants/services';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolioImages } from '../../hooks/usePortfolioImages';
import { formatMoneyInput, makeStoragePath } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ServiceCategoryKey } from '../../types';

type AdminPageProps = {
  isEditPage: boolean;
  editImageId?: string;
};

export function AdminPage({ isEditPage, editImageId }: AdminPageProps) {
  const { portfolioImages, fetchPortfolioImages, getImagesByCategory } = usePortfolioImages();
  const { user, authLoading, signOut } = useAuth(true);
  const { t } = useLanguage();
  const formatPrice = (price: number | null) => {
    if (price === null) return t.formatters.noPriceLabel;
    return `${price.toLocaleString('ru-RU')} ${t.formatters.currency}`;
  };
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<string[]>([]);
  const [imageTitle, setImageTitle] = useState('');
  const [imagePrice, setImagePrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryKey>('doors');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState<ServiceCategoryKey>('doors');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFilePreview, setEditFilePreview] = useState('');
  const [isEditImageRemoved, setIsEditImageRemoved] = useState(false);
  const [editFileInputKey, setEditFileInputKey] = useState(0);
  const [isUploadingCreate, setIsUploadingCreate] = useState(false);
  const [isUpdatingEdit, setIsUpdatingEdit] = useState(false);
  const [isDeletingEdit, setIsDeletingEdit] = useState(false);

  const selectedService = SERVICES.find((service) => service.key === selectedCategory) ?? SERVICES[0];
  const editingImage = isEditPage ? portfolioImages.find((item) => item.id === editImageId) ?? null : null;

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setSelectedFilePreviews([]);
      return;
    }
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedFilePreviews(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  useEffect(() => {
    if (!isEditPage || !editImageId) {
      return;
    }
    const targetImage = portfolioImages.find((item) => item.id === editImageId);
    if (!targetImage) return;
    setEditName(targetImage.product_name ?? targetImage.title ?? '');
    setEditPrice(targetImage.price ? String(targetImage.price) : '');
    setEditCategory(targetImage.category ?? 'doors');
    setEditFile(null);
    setIsEditImageRemoved(false);
  }, [isEditPage, editImageId, portfolioImages]);

  useEffect(() => {
    if (!editFile) {
      setEditFilePreview('');
      return;
    }
    const previewUrl = URL.createObjectURL(editFile);
    setEditFilePreview(previewUrl);
    setIsEditImageRemoved(false);
    return () => URL.revokeObjectURL(previewUrl);
  }, [editFile]);

  const backToAdminPage = () => {
    window.location.href = '/login';
  };

  const openEditPage = (itemId: string) => {
    window.location.href = `/login/edit/${itemId}`;
  };

  const clearEditSelectedImage = () => {
    setEditFile(null);
    setEditFilePreview('');
    setIsEditImageRemoved(true);
    setEditFileInputKey((prev) => prev + 1);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setLoginError("Supabase sozlanmagan. `.env` faylga `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` qo'shing.");
      return;
    }
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError(error.message);
  };

  const handleUpload = async (e: FormEvent) => {
    if (!SERVICE_KEYS.has(selectedCategory)) {
      setUploadError("Faqat 6 ta standart kategoriyadan birini tanlang.");
      return;
    }
    e.preventDefault();
    if (!supabase) {
      setUploadError("Supabase sozlanmagan. `.env` faylga ulanish ma'lumotlarini qo'shing.");
      return;
    }
    if (selectedFiles.length === 0) {
      setUploadError('Kamida bitta rasm tanlang.');
      return;
    }
    if (!imageTitle.trim()) {
      setUploadError("Eshik nomini kiriting.");
      return;
    }
    const numericPrice = Number(imagePrice.replace(/\s+/g, ''));
    if (!imagePrice.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setUploadError("Narxni to'g'ri kiriting (masalan: 2450000).");
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setIsUploadingCreate(true);
    const rowsToInsert: {
      title: string | null;
      product_name: string;
      price: number;
      image_url: string;
      category: ServiceCategoryKey;
    }[] = [];

    for (const file of selectedFiles) {
      const filePath = makeStoragePath(file);
      const { error: storageError } = await supabase.storage.from('portfolio').upload(filePath, file);
      if (storageError) {
        setUploadError(storageError.message);
        setIsUploadingCreate(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);
      rowsToInsert.push({
        title: imageTitle || null,
        product_name: imageTitle.trim(),
        price: numericPrice,
        image_url: publicUrlData.publicUrl,
        category: selectedCategory,
      });
    }

    const { error: insertError } = await supabase.from('portfolio_images').insert(rowsToInsert);
    if (insertError) {
      setUploadError(
        `${insertError.message}. Supabase jadvaliga 'product_name' (text) va 'price' (numeric) ustunlarini qo'shing.`,
      );
      setIsUploadingCreate(false);
      return;
    }
    setSelectedFiles([]);
    setSelectedFilePreviews([]);
    setImageTitle('');
    setImagePrice('');
    setShowCreatePanel(false);
    setUploadSuccess(`${rowsToInsert.length} ta rasm xizmat kategoriyasiga qo'shildi.`);
    setIsUploadingCreate(false);
    await fetchPortfolioImages();
  };

  const handleUpdateImage = async () => {
    if (!supabase || !editingImage) return;
    if (!editName.trim()) {
      setUploadError("Eshik nomini kiriting.");
      return;
    }
    const numericPrice = Number(editPrice.replace(/\s+/g, ''));
    if (!editPrice.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setUploadError("Narxni to'g'ri kiriting.");
      return;
    }
    if (isEditImageRemoved && !editFile) {
      setUploadError('Yangi rasm tanlang.');
      return;
    }

    setUploadError('');
    setIsUpdatingEdit(true);
    let nextImageUrl = editingImage.image_url;
    if (editFile) {
      const filePath = makeStoragePath(editFile);
      const { error: storageError } = await supabase.storage.from('portfolio').upload(filePath, editFile);
      if (storageError) {
        setUploadError(storageError.message);
        setIsUpdatingEdit(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);
      nextImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('portfolio_images')
      .update({
        title: editName.trim(),
        product_name: editName.trim(),
        price: numericPrice,
        category: editCategory,
        image_url: nextImageUrl,
      })
      .eq('id', editingImage.id);

    if (error) {
      setUploadError(error.message);
      setIsUpdatingEdit(false);
      return;
    }
    setUploadSuccess("Ma'lumotlar yangilandi.");
    setIsUpdatingEdit(false);
    backToAdminPage();
    await fetchPortfolioImages();
  };

  const handleDeleteImage = async () => {
    if (!supabase || !editingImage) return;
    setIsDeletingEdit(true);
    const { error } = await supabase.from('portfolio_images').delete().eq('id', editingImage.id);
    if (error) {
      setUploadError(error.message);
      setIsDeletingEdit(false);
      return;
    }
    setUploadSuccess("Rasm o'chirildi.");
    setIsDeletingEdit(false);
    backToAdminPage();
    await fetchPortfolioImages();
  };

  return (
    <div className="min-h-screen bg-navy px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-[1480px]">
        <h1 className="font-display text-4xl mb-2">Xizmatlar rasmlari Admin</h1>
        <p className="text-white/70 mb-8">Kirish orqali 6 ta xizmat kategoriyasi uchun rasmlarni yuklang va boshqaring.</p>

        {!supabase && (
          <div className="glass-card p-6 mb-6 border border-red-400/40">
            <p className="text-red-200">
              Supabase ulanishi topilmadi. Iltimos `.env` faylda `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` qiymatlarini to'ldiring.
            </p>
          </div>
        )}

        {authLoading ? (
          <div className="glass-card p-6">Yuklanmoqda...</div>
        ) : user ? (
          isEditPage ? (
            <div className="mx-auto w-full max-w-6xl">
              {!editingImage ? (
                <div className="glass-card p-6 text-white/70">Rasm topilmadi yoki yuklanmoqda...</div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-5xl mb-3">Eshik ma'lumotlari</h3>
                    <p className="text-white/70 text-lg">Yangi mahsulotni tizimga qo'shish yoki tahrirlash uchun quyidagi formalarni to'ldiring.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-6">
                    <div className="glass-card p-8">
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="edit-product-name" className="text-white/80 text-xl block mb-3">Eshik nomi</label>
                          <input
                            id="edit-product-name"
                            type="text"
                            placeholder="Masalan: Klassik eman eshik"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white text-xl placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-product-price" className="text-white/80 text-xl block mb-3">Narxi (so'm)</label>
                          <div className="relative">
                            <input
                              id="edit-product-price"
                              type="text"
                              inputMode="numeric"
                              placeholder="0.00"
                              value={formatMoneyInput(editPrice)}
                              onChange={(e) => setEditPrice(e.target.value.replace(/\s+/g, ''))}
                              className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 pr-20 text-white text-xl placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gold font-semibold">UZS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-card p-8">
                      <label htmlFor="edit-product-image" className="sr-only">Rasm faylini tanlang</label>
                      <input
                        key={editFileInputKey}
                        id="edit-product-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                      {!isEditImageRemoved && (editFilePreview || editingImage.image_url) ? (
                        <div className="mt-5 flex items-start gap-3">
                          <img
                            src={editFilePreview || editingImage.image_url}
                            alt="Joriy rasm"
                            className="flex-1 h-56 rounded-xl border border-white/20 object-contain bg-navy/40 p-2"
                          />
                          <button
                            type="button"
                            onClick={clearEditSelectedImage}
                            className="w-9 h-9 shrink-0 rounded-md border border-red-400/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                            title="Rasmni olib tashlash"
                            aria-label="Rasmni olib tashlash"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="edit-product-image"
                          className="mt-5 w-full min-h-[220px] rounded-xl border border-dashed border-white/20 bg-navy/60 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold/40 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                            <FileUp size={26} className="text-gold" />
                          </div>
                          <p className="text-white text-2xl font-semibold mb-1">Rasmni tanlang</p>
                          <span className="inline-flex items-center justify-center border border-gold/50 text-gold px-6 py-2 rounded-lg mt-2">
                            Fayllarni tanlash
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {uploadError && <p className="text-red-300 text-sm">{uploadError}</p>}
                  {uploadSuccess && <p className="text-green-300 text-sm">{uploadSuccess}</p>}

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      disabled={isDeletingEdit || isUpdatingEdit}
                      className="inline-flex items-center gap-2 border border-red-400/50 text-red-300 px-5 py-3 hover:bg-red-500/10 transition-colors disabled:opacity-60"
                    >
                      {isDeletingEdit ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      {isDeletingEdit ? 'Yuklanmoqda' : "O'chirish"}
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={backToAdminPage}
                        disabled={isUpdatingEdit || isDeletingEdit}
                        className="text-white/70 px-4 py-3 hover:text-white transition-colors disabled:opacity-60"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateImage}
                        disabled={isUpdatingEdit || isDeletingEdit}
                        className="btn-gold px-10 disabled:opacity-60"
                      >
                        {isUpdatingEdit ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Yuklanmoqda
                          </span>
                        ) : (
                          'Saqlash'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[280px,1fr] gap-6 xl:gap-8">
              <aside className="glass-card p-4 lg:p-5 h-fit">
                <p className="text-gold text-xs uppercase tracking-widest mb-3">Categories</p>
                <div className="space-y-2">
                  {SERVICES.map((service) => {
                    const isActive = selectedCategory === service.key;
                    return (
                      <button
                        key={`admin-cat-${service.key}`}
                        type="button"
                        onClick={() => setSelectedCategory(service.key)}
                        className={`w-full text-left px-3 py-2.5 border transition-colors ${
                          isActive
                            ? 'border-gold/60 bg-gold/10 text-white'
                            : 'border-white/10 hover:border-gold/40 text-white/80 hover:text-white'
                        }`}
                      >
                        {service.title}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white/50 text-xs mb-1">Admin</p>
                  <p className="text-white text-sm truncate">{user.email}</p>
                  <button
                    onClick={signOut}
                    className="mt-3 inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Chiqish
                  </button>
                </div>
              </aside>

              <div className="space-y-5 min-w-0">
                <div className="glass-card p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-2xl text-white">{selectedService.title}</h3>
                    <span className="text-white/60 text-sm">{getImagesByCategory(selectedCategory).length} ta rasm</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                    {getImagesByCategory(selectedCategory).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openEditPage(item.id)}
                        className="glass-card relative overflow-hidden text-left w-full hover:border-gold/40 border border-transparent transition-colors"
                      >
                        <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-gold/90 text-navy flex items-center justify-center rounded-sm pointer-events-none">
                          <Pencil size={14} />
                        </div>
                        <img
                          src={item.image_url}
                          alt={(item.product_name ?? item.title) ?? `${selectedService.title} rasmi`}
                          className="w-full h-64 object-contain bg-navy"
                          loading="lazy"
                        />
                        <div className="p-3">
                          <p className="text-white/90 text-sm font-medium">{item.product_name ?? item.title ?? 'Nomsiz model'}</p>
                          <p className="text-gold text-sm mt-1">{formatPrice(item.price)}</p>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowCreatePanel(true)}
                      className="glass-card h-full min-h-[340px] border border-dashed border-white/20 flex flex-col items-center justify-center text-center px-6 hover:border-gold/40 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-3xl mb-4">
                        +
                      </div>
                      <p className="text-white text-2xl font-display mb-2">Yangi qo'shish</p>
                      <p className="text-white/50 text-xs uppercase tracking-[0.22em]">Yangi dizayn yuklash</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
            <h2 className="font-display text-2xl mb-2">Admin kirish</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
              required
            />
            <input
              type="password"
              placeholder="Parol"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
              required
            />
            {loginError && <p className="text-red-300 text-sm">{loginError}</p>}
            <button type="submit" className="btn-gold">
              Kirish
            </button>
          </form>
        )}
      </div>

      {showCreatePanel && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreatePanel(false)} />
          <form onSubmit={handleUpload} className="relative z-10 w-full max-w-6xl glass-card p-8 space-y-8 border border-white/20">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-5xl">Eshik ma'lumotlari</h3>
              <button
                type="button"
                onClick={() => setShowCreatePanel(false)}
                className="border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors"
              >
                Yopish
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-6">
              <div className="glass-card p-8 space-y-5">
                <div>
                  <label htmlFor="create-product-name" className="text-white/80 text-xl block mb-3">Eshik nomi</label>
                  <input
                    id="create-product-name"
                    type="text"
                    placeholder="Masalan: Klassik eman eshik"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white text-xl placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="create-product-price" className="text-white/80 text-xl block mb-3">Narxi (so'm)</label>
                  <div className="relative">
                    <input
                      id="create-product-price"
                      type="text"
                      inputMode="numeric"
                      placeholder="0.00"
                      value={imagePrice}
                      onChange={(e) => setImagePrice(formatMoneyInput(e.target.value))}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 pr-20 text-white text-xl placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gold font-semibold">UZS</span>
                  </div>
                </div>
              </div>
              <div className="glass-card p-8">
                <label htmlFor="create-product-images" className="sr-only">Rasm fayllarini tanlang</label>
                <input
                  id="create-product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                  className="hidden"
                />
                {selectedFilePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedFilePreviews.slice(0, 3).map((preview, index) => (
                      <img
                        key={`${preview}-${index}`}
                        src={preview}
                        alt={`Tanlangan rasm ${index + 1}`}
                        className="w-full aspect-square rounded-xl border border-white/20 object-cover bg-white/5"
                      />
                    ))}
                  </div>
                ) : (
                  <label
                    htmlFor="create-product-images"
                    className="w-full min-h-[220px] rounded-xl border border-dashed border-white/20 bg-navy/60 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold/40 transition-colors"
                  >
                    <p className="text-white text-2xl font-semibold mb-1">Rasmlarni shu yerga tashlang</p>
                    <p className="text-white/60 mb-5">PNG, JPG formatlari, max 10MB</p>
                    <span className="inline-flex items-center justify-center border border-gold/50 text-gold px-6 py-2 rounded-lg">
                      Fayllarni tanlash
                    </span>
                  </label>
                )}
              </div>
            </div>

            {uploadError && <p className="text-red-300 text-sm">{uploadError}</p>}
            {uploadSuccess && <p className="text-green-300 text-sm">{uploadSuccess}</p>}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreatePanel(false)}
                disabled={isUploadingCreate}
                className="text-white/70 px-4 py-3 hover:text-white transition-colors disabled:opacity-60"
              >
                Bekor qilish
              </button>
              <button type="submit" disabled={isUploadingCreate} className="btn-gold px-10 disabled:opacity-60">
                {isUploadingCreate ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Yuklanmoqda
                  </span>
                ) : (
                  'Saqlash'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
