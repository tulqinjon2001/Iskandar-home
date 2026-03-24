import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { User } from '@supabase/supabase-js';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  Send, 
  Menu, 
  X,
  ChevronRight,
  Pencil,
  FileUp,
  Loader2,
  Truck,
  Award,
  Users,
  LogOut,
  Trash2,
} from 'lucide-react';
import { supabase } from './lib/supabase';

gsap.registerPlugin(ScrollTrigger);

type PortfolioImage = {
  id: string;
  title: string | null;
  product_name: string | null;
  price: number | null;
  image_url: string;
  created_at: string;
  category: ServiceCategoryKey | null;
};

type ServiceCategoryKey = 'doors' | 'windows' | 'stairs' | 'furniture' | 'flooring' | 'metal';

type ServiceCategory = {
  key: ServiceCategoryKey;
  title: string;
  desc: string;
  img: string;
};

const SERVICES: ServiceCategory[] = [
  { key: 'doors', title: 'Eshiklar', desc: "Yog'och va MDF eshiklar, individual dizayn.", img: '/service_doors.jpg' },
  { key: 'windows', title: 'Derazalar', desc: "AKFA tizimlari, issiqroq va tinchroq uy.", img: '/service_windows.jpg' },
  { key: 'stairs', title: 'Zinapoyalar', desc: "Shpon va yog'ochdan zinapoya va boshqalar.", img: '/service_stairs.jpg' },
  { key: 'furniture', title: 'Mebel', desc: "Korpusli va bo'yalgan mebellar.", img: '/service_furniture.jpg' },
  { key: 'flooring', title: 'Pol / Tarkon', desc: "Sifatli pol qoplamalari va tarket.", img: '/service_flooring.jpg' },
  { key: 'metal', title: 'Metal ishlar', desc: "Temir panjaralar va maxsus konstruksiyalar.", img: '/service_metal.jpg' },
];

const SERVICE_KEYS = new Set<ServiceCategoryKey>(SERVICES.map((item) => item.key));

function App() {
  const pathname = window.location.pathname;
  const isLoginPage = pathname === '/login';
  const isLoginEditPage = pathname.startsWith('/login/edit/');
  const isServicePage = pathname.startsWith('/services/');
  const serviceSlug = pathname.split('/')[2] as ServiceCategoryKey | undefined;
  const editImageId = pathname.split('/')[3];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
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
  const [previewImage, setPreviewImage] = useState<PortfolioImage | null>(null);

  const fetchPortfolioImages = async () => {
    if (!supabase) {
      setLoadingPortfolio(false);
      return;
    }

    setLoadingPortfolio(true);
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('id,title,product_name,price,image_url,created_at,category')
      .order('created_at', { ascending: false });

    if (error) {
      // Backward compatibility for projects that haven't added `category` yet.
      const { data: fallbackData } = await supabase
        .from('portfolio_images')
        .select('id,title,image_url,created_at')
        .order('created_at', { ascending: false });

      const mappedFallback = ((fallbackData as Omit<PortfolioImage, 'category'>[] | null) ?? []).map((item) => ({
        ...item,
        product_name: item.title,
        price: null,
        category: null,
      }));

      setPortfolioImages(mappedFallback);
      setLoadingPortfolio(false);
      return;
    }

    const normalizedData = ((data as PortfolioImage[] | null) ?? []).map((item) => ({
      ...item,
      category: item.category && SERVICE_KEYS.has(item.category) ? item.category : null,
    }));
    setPortfolioImages(normalizedData);
    setLoadingPortfolio(false);
  };

  useEffect(() => {
    void fetchPortfolioImages();
  }, []);

  useEffect(() => {
    if (!supabase || (!isLoginPage && !isLoginEditPage)) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isLoginPage, isLoginEditPage]);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isLoginPage || isLoginEditPage || isServicePage) {
      return;
    }

    const ctx = gsap.context(() => {
      // Hero entrance animation (on load)
      gsap.fromTo('.hero-bg', 
        { scale: 1.05, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }
      );
      
      // Hero content - fade down from top
      gsap.fromTo('.hero-content > *',
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, delay: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo('.hero-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, delay: 0.6, ease: 'power2.out' }
      );

      // Section headings - fade down from top animation
      const sectionHeadings = document.querySelectorAll('.section-heading');
      sectionHeadings.forEach((heading) => {
        gsap.fromTo(heading,
          { y: -50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Fade up animations for content
      const fadeUpElements = document.querySelectorAll('.fade-up');
      fadeUpElements.forEach((el) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Service cards stagger animation
      gsap.fromTo('.service-card-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      // USP cards animation
      gsap.fromTo('.usp-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.usp-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    return () => ctx.revert();
  }, [isLoginPage, isLoginEditPage, isServicePage]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setSelectedFilePreviews([]);
      return;
    }

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedFilePreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  useEffect(() => {
    if (!isLoginEditPage || !editImageId) {
      return;
    }

    const targetImage = portfolioImages.find((item) => item.id === editImageId);
    if (!targetImage) return;

    setEditName(targetImage.product_name ?? targetImage.title ?? '');
    setEditPrice(targetImage.price ? String(targetImage.price) : '');
    setEditCategory(targetImage.category ?? 'doors');
    setEditFile(null);
    setIsEditImageRemoved(false);
  }, [isLoginEditPage, editImageId, portfolioImages]);

  useEffect(() => {
    if (!editFile) {
      setEditFilePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(editFile);
    setEditFilePreview(previewUrl);
    setIsEditImageRemoved(false);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [editFile]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const services = SERVICES;
  const currentService = serviceSlug && SERVICE_KEYS.has(serviceSlug)
    ? services.find((service) => service.key === serviceSlug) ?? null
    : null;
  const editingImage = isLoginEditPage
    ? portfolioImages.find((item) => item.id === editImageId) ?? null
    : null;

  const getImagesByCategory = (categoryKey: ServiceCategoryKey) =>
    portfolioImages.filter((item) => item.category === categoryKey);
  const selectedService = services.find((service) => service.key === selectedCategory) ?? services[0];
  const formatMoneyInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) return '';
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  const formatPrice = (price: number | null) => {
    if (price === null) return "Narx ko'rsatilmagan";
    return `${price.toLocaleString('ru-RU')} so'm`;
  };
  const makeSafeFileName = (originalName: string) => {
    const lower = originalName.toLowerCase();
    const parts = lower.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const base = parts.join('.');

    // Keep only ASCII-safe chars for Supabase storage keys.
    const safeBase = base
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const fallbackBase = safeBase || 'image';
    return ext ? `${fallbackBase}.${ext.replace(/[^a-z0-9]/g, '') || 'jpg'}` : fallbackBase;
  };
  const makeStoragePath = (file: File) => {
    const safeName = makeSafeFileName(file.name);
    const ext = safeName.includes('.') ? safeName.split('.').pop() : 'jpg';
    return `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext || 'jpg'}`;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setLoginError("Supabase sozlanmagan. `.env` faylga `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` qo'shing.");
      return;
    }

    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const openServicePage = (categoryKey: ServiceCategoryKey) => {
    window.location.href = `/services/${categoryKey}`;
  };
  const openEditPage = (itemId: string) => {
    window.location.href = `/login/edit/${itemId}`;
  };
  const backToAdminPage = () => {
    window.location.href = '/login';
  };
  const clearEditSelectedImage = () => {
    setEditFile(null);
    setEditFilePreview('');
    setIsEditImageRemoved(true);
    setEditFileInputKey((prev) => prev + 1);
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
      setUploadError("Yangi rasm tanlang.");
      return;
    }

    setUploadError('');
    setIsUpdatingEdit(true);
    let nextImageUrl = editingImage.image_url;

    if (editFile) {
      const filePath = makeStoragePath(editFile);
      const { error: storageError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, editFile);

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

    const { error } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', editingImage.id);

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

      const { error: storageError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

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
        `${insertError.message}. Supabase jadvaliga 'product_name' (text) va 'price' (numeric) ustunlarini qo'shing.`
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

  if (isLoginPage || isLoginEditPage) {
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
            isLoginEditPage ? (
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
                        {isDeletingEdit ? "Yuklanmoqda" : "O'chirish"}
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
                            "Saqlash"
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
                    {services.map((service) => {
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
                      onClick={handleSignOut}
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
              <button type="submit" className="btn-gold">Kirish</button>
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
                    "Saqlash"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  if (isServicePage) {
    if (!currentService) {
      return (
        <div className="min-h-screen bg-navy text-white px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-display text-4xl mb-4">Kategoriya topilmadi</h1>
            <a href="/" className="text-gold underline">Bosh sahifaga qaytish</a>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-navy text-white">
        <div className="px-6 lg:px-[6vw] py-8">
          <div className="flex items-center justify-between mb-8">
            <a href="/" className="inline-flex items-center gap-3">
              <img
                src="/logo/logo.jpg"
                alt="Iskandar Home"
                className="h-10 w-10 rounded-sm object-cover ring-1 ring-gold/50"
              />
              <span className="font-display text-xl">Iskandar Home</span>
            </a>
            <a href="/" className="text-sm text-gold uppercase tracking-wider">Ortga qaytish</a>
          </div>

          <div className="max-w-3xl mb-8">
            <h1 className="font-display text-[clamp(34px,4vw,52px)] mb-3">{currentService.title}</h1>
            <p className="text-white/70">{currentService.desc}</p>
          </div>

          {loadingPortfolio ? (
            <div className="text-white/70">Rasmlar yuklanmoqda...</div>
          ) : getImagesByCategory(currentService.key).length === 0 ? (
            <div className="glass-card p-6 text-white/70">Bu kategoriya uchun hali rasm qo'shilmagan.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {getImagesByCategory(currentService.key).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreviewImage(item)}
                  className="glass-card overflow-hidden text-left hover:border-gold/40 border border-transparent transition-colors"
                >
                  <img
                    src={item.image_url}
                    alt={(item.product_name ?? item.title) ?? `${currentService.title} rasmi`}
                    className="w-full h-72 object-contain bg-navy"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <p className="text-white font-medium">{item.product_name ?? item.title ?? 'Nomsiz model'}</p>
                    <p className="text-gold mt-1">{formatPrice(item.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {previewImage && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
              <div className="relative z-10 w-full max-w-5xl">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-12 right-0 w-10 h-10 border border-white/30 bg-navy/70 text-white hover:bg-white/10 transition-colors"
                  aria-label="Yopish"
                >
                  <X size={18} className="mx-auto" />
                </button>
                <div className="glass-card overflow-hidden">
                  <img
                    src={previewImage.image_url}
                    alt={(previewImage.product_name ?? previewImage.title) ?? 'Katta rasm'}
                    className="w-full max-h-[80vh] object-contain bg-navy"
                  />
                  <div className="p-4">
                    <p className="text-white text-lg">{previewImage.product_name ?? previewImage.title ?? 'Nomsiz model'}</p>
                    <p className="text-gold mt-1">{formatPrice(previewImage.price)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-navy min-h-screen">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      <div className="vignette-overlay" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 flex items-center justify-between bg-gradient-to-b from-navy/90 to-transparent">
        <button
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3"
          aria-label="Iskandar Home logo"
        >
          <img
            src="/logo/logo.jpg"
            alt="Iskandar Home"
            className="h-10 w-10 rounded-sm object-cover ring-1 ring-gold/50 lg:h-12 lg:w-12"
          />
          <span className="font-display text-base lg:text-xl text-white font-medium tracking-tight">
            Iskandar Home
          </span>
        </button>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <button onClick={() => scrollToSection('services')} className="text-sm text-white/80 hover:text-gold transition-colors uppercase tracking-widest">
            Xizmatlar
          </button>
          <button onClick={() => scrollToSection('process')} className="text-sm text-white/80 hover:text-gold transition-colors uppercase tracking-widest">
            Ish jarayoni
          </button>
          <button onClick={() => scrollToSection('contact')} className="text-sm text-white/80 hover:text-gold transition-colors uppercase tracking-widest">
            Aloqa
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-white z-50 relative"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu with blur background */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-xl"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu content */}
          <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 lg:hidden">
            <button 
              onClick={() => scrollToSection('services')} 
              className="text-3xl text-white font-display hover:text-gold transition-colors py-2"
            >
              Xizmatlar
            </button>
            <button 
              onClick={() => scrollToSection('process')} 
              className="text-3xl text-white font-display hover:text-gold transition-colors py-2"
            >
              Ish jarayoni
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-3xl text-white font-display hover:text-gold transition-colors py-2"
            >
              Aloqa
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="btn-gold mt-6 text-lg"
            >
              Bepul konsultatsiya olish
            </button>
          </div>
        </>
      )}

      {/* Section 1: Hero */}
      <section id="home" className="relative min-h-screen flex items-center">
        <img src="/hero_facade.jpg" alt="Showroom" className="hero-bg absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/50 to-navy/70" />
        
        <div className="hero-content relative z-10 w-full px-6 lg:px-[6vw] py-32">
          <div className="max-w-2xl">
            <h1 className="font-display text-[clamp(40px,6vw,72px)] text-white leading-[0.95] mb-6">
              Sifatli mebel va duradgorlik
            </h1>
            <div className="hero-rule w-32 h-[2px] bg-gold mb-8" />
            <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-8">
              Maxsus buyurtma asosida eshiklar, zinapoyalar va sifatli mebellar ishlab chiqaramiz.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => scrollToSection('contact')} className="btn-gold text-sm uppercase tracking-wider">
                Bepul konsultatsiya olish
              </button>
              <button onClick={() => scrollToSection('services')} className="text-link text-gold text-sm uppercase tracking-wider px-4 py-3">
                Xizmatlar bilan tanishish
              </button>
            </div>
          </div>
        </div>

        <div className="absolute left-6 lg:left-[6vw] bottom-8">
          <span className="text-xs text-white/50 uppercase tracking-[0.18em]">
            Toshkent • Iskandar Home
          </span>
        </div>
      </section>

      {/* Section 2: Interior */}
      <section className="relative py-20 lg:py-32">
        <div className="px-6 lg:px-[6vw]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-up">
              <img 
                src="/interior_room.jpg" 
                alt="Interior" 
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
            </div>
            <div>
              <h2 className="section-heading font-display text-[clamp(32px,4vw,48px)] text-white mb-4">
                Sizning uyingiz uchun
              </h2>
              <div className="fade-up w-20 h-[2px] bg-gold mb-6" />
              <p className="fade-up text-gold text-lg mb-4">
                Har bir detalda yuqori sifat va zamonaviy dizayn uyg'unligi.
              </p>
              <p className="fade-up text-white/70 text-base leading-relaxed mb-6">
                Biz faqatgina ishonchli materiallar bilan ishlaymiz: qattiq yog'och, MDF, AKFA profil tizimlari va ekologik toza laklar.
              </p>
              <button className="fade-up text-link text-gold text-sm uppercase tracking-wider">
                Materiallar haqida batafsil
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Services */}
      <section id="services" className="relative py-20 lg:py-32 bg-navy-light">
        <div className="px-6 lg:px-[6vw]">
          <div className="text-center mb-16">
            <h2 className="section-heading font-display text-[clamp(32px,4vw,48px)] text-white mb-4">
              Bizning xizmatlar
            </h2>
            <div className="fade-up w-20 h-[2px] bg-gold mx-auto mb-6" />
            <p className="fade-up text-white/70 text-lg max-w-2xl mx-auto">
              Eshiklar, zinapoyalar, mebel va metal ishlar — barchasi bir tom ostida.
            </p>
          </div>

          <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <button
                key={service.key}
                type="button"
                className="service-card-item service-card group cursor-pointer text-left w-full"
                onClick={() => openServicePage(service.key)}
              >
                <img src={service.img} alt={service.title} />
                <div className="service-card-overlay">
                  <h3 className="font-display text-2xl text-white mb-2">{service.title}</h3>
                  <p className="text-white/70 text-sm">{service.desc}</p>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-gold/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="text-gold" size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Workshop */}
      <section id="process" className="relative py-20 lg:py-32">
        <div className="px-6 lg:px-[6vw]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="section-heading font-display text-[clamp(32px,4vw,48px)] text-white mb-4">
                Ish jarayoni
              </h2>
              <div className="fade-up w-20 h-[2px] bg-gold mb-6" />
              <p className="fade-up text-gold text-lg mb-4">
                Buyurtmadan yetkazib berishgacha — tartib va nazorat.
              </p>
              <p className="fade-up text-white/70 text-base leading-relaxed mb-6">
                Loyihalash, material tanlash, ishlab chiqarish va o'rnatish. Har bir bosqichda sifat nazorati.
              </p>
              <button className="fade-up text-link text-gold text-sm uppercase tracking-wider">
                Batafsil tanishish
              </button>
            </div>
            <div className="order-1 lg:order-2 fade-up">
              <img 
                src="/workshop_shelves.jpg" 
                alt="Workshop" 
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Quality Statement */}
      <section className="relative py-20 lg:py-32 bg-navy-light">
        <div className="px-6 lg:px-[6vw]">
          <div className="text-center">
            <h2 className="section-heading font-display text-[clamp(36px,5vw,64px)] text-white mb-6">
              Yuqori sifat kafolati
            </h2>
            <div className="fade-up w-24 h-[2px] bg-gold mx-auto mb-8" />
            <p className="fade-up text-white/70 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
              O'zbekiston bo'ylab yetkazib berish bepul. Individual yondashuv va o'z vaqtida bajarilgan ishlar.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Contact */}
      <section id="contact" className="relative py-16 lg:py-24 bg-navy-light">
        <div className="px-6 lg:px-[6vw]">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column - Contact Info */}
            <div>
              <h2 className="section-heading font-display text-[clamp(30px,3.6vw,44px)] text-white mb-4">
                Aloqa
              </h2>
              <div className="fade-up w-16 h-[2px] bg-gold mb-5" />
              <p className="fade-up text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
                Loyihangizni muhokama qilish uchun biz bilan bog'laning. Bepul maslahat va baholash.
              </p>

              <div className="space-y-5">
                <div className="fade-up flex items-start gap-3">
                  <div className="w-10 h-10 mt-0.5 bg-gold/10 border border-gold/20 rounded-md flex items-center justify-center shrink-0">
                    <Phone className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Telefon</p>
                    <p className="text-white font-medium leading-tight">+998 (97) 680-94-49</p>
                    <p className="text-white font-medium leading-tight mt-1">+998 (90) 979-09-52</p>
                  </div>
                </div>

                <div className="fade-up flex items-start gap-3">
                  <div className="w-10 h-10 mt-0.5 bg-gold/10 border border-gold/20 rounded-md flex items-center justify-center shrink-0">
                    <MapPin className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Manzil</p>
                    <p className="text-white">Toshkent viloyati, Chirchiq shahri</p>
                    <p className="text-white/70">Korasuv ko'chasi 10-uy (Mo'ljal: Yumaloq)</p>
                  </div>
                </div>

                <div className="fade-up flex items-start gap-3">
                  <div className="w-10 h-10 mt-0.5 bg-gold/10 border border-gold/20 rounded-md flex items-center justify-center shrink-0">
                    <Clock className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Ish vaqti</p>
                    <p className="text-white">Dushanba – Shanba: 09:00 – 18:00</p>
                    <p className="text-white/70">Yakshanba: Dam olish kuni</p>
                  </div>
                </div>
              </div>

              {/* USP Cards */}
              <div className="usp-grid grid grid-cols-3 gap-3 mt-8">
                <div className="usp-card glass-card p-3 text-center">
                  <Truck className="text-gold mx-auto mb-2" size={20} />
                  <p className="text-white text-sm font-medium">Bepul yetkazish</p>
                </div>
                <div className="usp-card glass-card p-3 text-center">
                  <Award className="text-gold mx-auto mb-2" size={20} />
                  <p className="text-white text-sm font-medium">Sifat kafolati</p>
                </div>
                <div className="usp-card glass-card p-3 text-center">
                  <Users className="text-gold mx-auto mb-2" size={20} />
                  <p className="text-white text-sm font-medium">Individual</p>
                </div>
              </div>
            </div>

            {/* Right Column - Yandex Map */}
            <div className="fade-up">
              <div className="glass-card p-3 lg:p-4 h-full min-h-[330px] rounded-xl border border-white/10">
                <h3 className="font-display text-lg lg:text-xl text-white mb-3 px-2">
                  Bizning manzil
                </h3>
                <div className="w-full h-[260px] lg:h-[320px] overflow-hidden rounded-lg">
                  <iframe 
                    src="https://yandex.uz/map-widget/v1/?ll=69.5956%2C41.4705&z=15&pt=69.5956%2C41.4705%2Cpm2rdl&text=Chirchiq%20Korasuv%2010" 
                    title="Iskandar Home manzili xaritada"
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    allowFullScreen
                    className="grayscale-[30%] hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <a 
                  href="https://yandex.uz/maps/-/CDXlv4M~" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold text-sm mt-3 px-2 hover:underline"
                >
                  <MapPin size={16} />
                  Yandex Xaritada ochish
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-16 fade-up">
            <div className="glass-card p-8 lg:p-10 max-w-2xl mx-auto">
              <h3 className="font-display text-2xl text-white mb-6 text-center">
                Xabar yuborish
              </h3>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Ismingiz</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Telefon</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="+998 __ ___ __ __"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Xabar</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors resize-none"
                    placeholder="Loyihangiz haqida qisqacha..."
                  />
                </div>
                <button type="submit" className="btn-gold w-full">
                  Bepul konsultatsiya olish
                </button>
              </form>

              <div className="flex items-center justify-center gap-6 mt-8">
                <a href="https://instagram.com/Iskandar_home" target="_blank" rel="noopener noreferrer" title="Instagram sahifamiz" aria-label="Instagram sahifamiz" className="w-12 h-12 bg-white/5 flex items-center justify-center hover:bg-gold/20 transition-colors">
                  <Instagram className="text-gold" size={20} />
                </a>
                <a href="https://t.me/+998976809449" target="_blank" rel="noopener noreferrer" title="Telegram orqali yozish" aria-label="Telegram orqali yozish" className="w-12 h-12 bg-white/5 flex items-center justify-center hover:bg-gold/20 transition-colors">
                  <Send className="text-gold" size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-white/10 fade-up">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <p className="text-white/50 text-sm">
                © 2026 Iskandar Home. Barcha huquqlar himoyalangan.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-white/50 text-sm">Instagram: @Iskandar_home</span>
                <span className="text-white/50 text-sm">Telegram: +998976809449</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
