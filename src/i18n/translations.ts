export type Lang = 'uz' | 'ru';

export type Translations = {
  nav: {
    services: string;
    about: string;
    process: string;
    contact: string;
    cta: string;
    closeMenu: string;
    openMenu: string;
  };
  about: {
    title: string;
    paragraphs: string[];
    portfolioLabel: string;
    portfolioItems: string;
    goal: string;
    cta: string;
    stats: {
      experience: { number: string; label: string };
      design: { label: string };
      quality: { label: string };
      fullCycle: { label: string };
    };
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    learnMore: string;
    location: string;
  };
  interior: {
    title: string;
    accent: string;
    body: string;
    link: string;
  };
  services: {
    sectionTitle: string;
    sectionBody: string;
    categories: {
      doors:     { title: string; desc: string };
      windows:   { title: string; desc: string };
      stairs:    { title: string; desc: string };
      furniture: { title: string; desc: string };
      flooring:  { title: string; desc: string };
      metal:     { title: string; desc: string };
    };
  };
  workshop: {
    title: string;
    accent: string;
    body: string;
    link: string;
  };
  quality: {
    title: string;
    body: string;
  };
  contact: {
    sectionTitle: string;
    sectionBody: string;
    phone: string;
    address: string;
    addressLine1: string;
    addressLine2: string;
    hours: string;
    hoursLine1: string;
    hoursLine2: string;
    mapTitle: string;
    mapLink: string;
    usp: {
      delivery: string;
      quality: string;
      individual: string;
    };
    form: {
      heading: string;
      namePlaceholder: string;
      nameLabel: string;
      phonePlaceholder: string;
      phoneLabel: string;
      messageLabel: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      errorRequired: string;
      errorFailed: string;
      errorServer: string;
      success: string;
    };
  };
  footer: {
    copyright: string;
    instagram: string;
    telegram: string;
  };
  servicePage: {
    notFound: string;
    backHome: string;
    backBtn: string;
    loading: string;
    empty: string;
    noName: string;
    noPriceLabel: string;
    close: string;
    orderBtn: string;
  };
  orderModal: {
    title: string;
    productLabel: string;
    priceLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    errorRequired: string;
    errorFailed: string;
    errorServer: string;
    success: string;
    close: string;
  };
  formatters: {
    currency: string;
    noPriceLabel: string;
  };
};

const uz: Translations = {
  nav: {
    services: 'Xizmatlar',
    about: 'Biz haqimizda',
    process: 'Ish jarayoni',
    contact: 'Aloqa',
    cta: 'Bepul konsultatsiya olish',
    closeMenu: 'Menyuni yopish',
    openMenu: 'Menyuni ochish',
  },
  about: {
    title: 'Biz haqimizda',
    paragraphs: [
      "Biz — buyurtma asosida mebel ishlab chiqarish sohasida 15 yildan ortiq tajribaga ega professional jamoamiz. Biz oddiy mebel emas, balki estetika, qulaylik va funksionallik uyg\u2019unlashgan mukammal interyer yechimlarini yaratamiz.",
      "Bizning asosiy yo\u2018nalishimiz — korpusli va bo\u2018yalgan mebellar, shuningdek, har qanday murakkablikdagi metall mahsulotlarni ishlab chiqarishdir. Ish jarayonida tabiiy yog\u2018och, shpon va zamonaviy qoplamalar kabi sifatli materiallardan foydalanib, mahsulotlarimizning uzoq xizmat qilishi va mukammal ko\u2018rinishini ta\u2018minlaymiz.",
      "Har bir loyiha biz uchun alohida yondashuvni talab qiladi — g\u2018oyadan va dizayndan boshlab, to\u2018liq ishlab chiqarish va o\u2018rnatishgacha.",
    ],
    portfolioLabel: "Portfolioimizda",
    portfolioItems: "oshxonalar, yotoq xonalari, mehmonxonalar, ofis mebellari, ichki eshiklar, zinapoyalar va kompleks interyer yechimlari.",
    goal: "Bizning maqsadimiz — yashash zavq bag\u2018ishlaydigan makon yaratish.",
    cta: "Bog\u2018lanish",
    stats: {
      experience: { number: "15+", label: "yillik tajriba" },
      design: { label: "Individual dizayn" },
      quality: { label: "Sifatli materiallar" },
      fullCycle: { label: "To\u2018liq xizmat sikli" },
    },
  },
  hero: {
    title: 'Sifatli mebel va duradgorlik',
    subtitle: 'Maxsus buyurtma asosida eshiklar, zinapoyalar va sifatli mebellar ishlab chiqaramiz.',
    cta: 'Bepul konsultatsiya olish',
    learnMore: 'Xizmatlar bilan tanishish',
    location: 'Toshkent • Iskandar Home',
  },
  interior: {
    title: 'Sizning uyingiz uchun',
    accent: "Har bir detalda yuqori sifat va zamonaviy dizayn uyg'unligi.",
    body: "Biz faqatgina ishonchli materiallar bilan ishlaymiz: qattiq yog'och, MDF, AKFA profil tizimlari va ekologik toza laklar.",
    link: 'Materiallar haqida batafsil',
  },
  services: {
    sectionTitle: 'Bizning xizmatlar',
    sectionBody: 'Eshiklar, zinapoyalar, mebel va metal ishlar — barchasi bir tom ostida.',
    categories: {
      doors:     { title: 'Eshiklar',     desc: "Yog'och va MDF eshiklar, individual dizayn." },
      windows:   { title: 'Derazalar',    desc: "AKFA tizimlari, issiqroq va tinchroq uy." },
      stairs:    { title: 'Zinapoyalar',  desc: "Shpon va yog'ochdan zinapoya va boshqalar." },
      furniture: { title: 'Mebel',        desc: "Korpusli va bo'yalgan mebellar." },
      flooring:  { title: 'Pol / Tarkon', desc: "Sifatli pol qoplamalari va tarket." },
      metal:     { title: 'Metal ishlar', desc: "Temir panjaralar va maxsus konstruksiyalar." },
    },
  },
  workshop: {
    title: 'Ish jarayoni',
    accent: 'Buyurtmadan yetkazib berishgacha — tartib va nazorat.',
    body: "Loyihalash, material tanlash, ishlab chiqarish va o'rnatish. Har bir bosqichda sifat nazorati.",
    link: 'Batafsil tanishish',
  },
  quality: {
    title: 'Yuqori sifat kafolati',
    body: "O'zbekiston bo'ylab yetkazib berish bepul. Individual yondashuv va o'z vaqtida bajarilgan ishlar.",
  },
  contact: {
    sectionTitle: 'Aloqa',
    sectionBody: "Loyihangizni muhokama qilish uchun biz bilan bog\u2019laning. Bepul maslahat va baholash.",
    phone: 'Telefon',
    address: 'Manzil',
    addressLine1: 'Toshkent viloyati, Chirchiq shahri',
    addressLine2: "Korasuv ko'chasi 10-uy (Mo'ljal: Yumaloq)",
    hours: 'Ish vaqti',
    hoursLine1: 'Dushanba – Shanba: 09:00 – 18:00',
    hoursLine2: 'Yakshanba: Dam olish kuni',
    mapTitle: 'Bizning manzil',
    mapLink: 'Yandex Xaritada ochish',
    usp: {
      delivery: 'Bepul yetkazish',
      quality: 'Sifat kafolati',
      individual: 'Individual',
    },
    form: {
      heading: 'Xabar yuborish',
      nameLabel: 'Ismingiz',
      namePlaceholder: 'Ismingizni kiriting',
      phoneLabel: 'Telefon',
      phonePlaceholder: '+998 __ ___ __ __',
      messageLabel: 'Xabar',
      messagePlaceholder: 'Loyihangiz haqida qisqacha...',
      submit: 'Bepul konsultatsiya olish',
      submitting: 'Yuborilmoqda',
      errorRequired: "Ism va telefon raqamini to'ldiring.",
      errorFailed: "Xabar yuborilmadi. Keyinroq qayta urinib ko'ring.",
      errorServer: "Serverga ulanishda xatolik. Qayta urinib ko'ring.",
      success: "So\u2018rovingiz yuborildi. Tez orada siz bilan bog\u2019lanamiz.",
    },
  },
  footer: {
    copyright: '© 2026 Iskandar Home. Barcha huquqlar himoyalangan.',
    instagram: 'Instagram: @Iskandar_home',
    telegram: 'Telegram: +998976809449',
  },
  servicePage: {
    notFound: 'Kategoriya topilmadi',
    backHome: 'Bosh sahifaga qaytish',
    backBtn: 'Ortga qaytish',
    loading: 'Rasmlar yuklanmoqda...',
    empty: "Bu kategoriya uchun hali rasm qo'shilmagan.",
    noName: 'Nomsiz model',
    noPriceLabel: "Narx ko'rsatilmagan",
    close: 'Yopish',
    orderBtn: 'Buyurtma berish',
  },
  orderModal: {
    title: 'Buyurtma berish',
    productLabel: 'Mahsulot',
    priceLabel: 'Narx',
    nameLabel: 'Ismingiz',
    namePlaceholder: 'Ismingizni kiriting',
    phoneLabel: 'Telefon',
    phonePlaceholder: '+998 __ ___ __ __',
    messageLabel: 'Qo\'shimcha izoh',
    messagePlaceholder: 'Qo\'shimcha savollar yoki izohlar...',
    submit: 'Zayavka yuborish',
    submitting: 'Yuborilmoqda...',
    errorRequired: "Ism va telefon raqamini to'ldiring.",
    errorFailed: "Xabar yuborilmadi. Keyinroq qayta urinib ko'ring.",
    errorServer: "Serverga ulanishda xatolik. Qayta urinib ko'ring.",
    success: "Zayavkangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.",
    close: 'Yopish',
  },
  formatters: {
    currency: "so'm",
    noPriceLabel: "Narx ko'rsatilmagan",
  },
};

const ru: Translations = {
  nav: {
    services: 'Услуги',
    about: 'О нас',
    process: 'Процесс работы',
    contact: 'Контакты',
    cta: 'Получить консультацию',
    closeMenu: 'Закрыть меню',
    openMenu: 'Открыть меню',
  },
  about: {
    title: 'О нас',
    paragraphs: [
      "Мы — команда профессионалов с более чем 15-летним опытом в производстве мебели на заказ. Создаём не просто мебель, а продуманные интерьерные решения, где сочетаются эстетика, комфорт и функциональность.",
      "Мы специализируемся на изготовлении корпусной и крашеной мебели, а также изделий из металла любой сложности. Работаем с качественными материалами, включая натуральное дерево, шпон и современные покрытия, обеспечивая долговечность и безупречный внешний вид.",
      "Каждый проект для нас — индивидуален: от идеи и дизайна до полного производства и установки.",
    ],
    portfolioLabel: "В нашем портфолио",
    portfolioItems: "кухни, спальни, гостиные, офисная мебель, межкомнатные двери, лестницы и комплексные интерьерные решения.",
    goal: "Наша цель — создавать пространство, в котором хочется жить.",
    cta: "Связаться с нами",
    stats: {
      experience: { number: "15+", label: "лет опыта" },
      design: { label: "Индивидуальный дизайн" },
      quality: { label: "Качественные материалы" },
      fullCycle: { label: "Полный цикл услуг" },
    },
  },
  hero: {
    title: 'Качественная мебель и столярные работы',
    subtitle: 'Производим двери, лестницы и качественную мебель по индивидуальному заказу.',
    cta: 'Получить консультацию',
    learnMore: 'Ознакомиться с услугами',
    location: 'Ташкент • Iskandar Home',
  },
  interior: {
    title: 'Для вашего дома',
    accent: 'Высокое качество и современный дизайн в каждой детали.',
    body: 'Мы работаем только с надёжными материалами: твёрдая древесина, МДФ, системы AKFA и экологически чистые лаки.',
    link: 'Подробнее о материалах',
  },
  services: {
    sectionTitle: 'Наши услуги',
    sectionBody: 'Двери, лестницы, мебель и металлические изделия — всё под одной крышей.',
    categories: {
      doors:     { title: 'Двери',              desc: 'Деревянные и МДФ двери, индивидуальный дизайн.' },
      windows:   { title: 'Окна',               desc: 'Системы AKFA, теплее и тише дом.' },
      stairs:    { title: 'Лестницы',           desc: 'Лестницы и другое из шпона и дерева.' },
      furniture: { title: 'Мебель',             desc: 'Корпусная и крашеная мебель.' },
      flooring:  { title: 'Пол / Ламинат',      desc: 'Качественные напольные покрытия и паркет.' },
      metal:     { title: 'Металлические работы', desc: 'Железные решётки и специальные конструкции.' },
    },
  },
  workshop: {
    title: 'Процесс работы',
    accent: 'От заказа до доставки — порядок и контроль.',
    body: 'Проектирование, выбор материалов, производство и установка. Контроль качества на каждом этапе.',
    link: 'Узнать подробнее',
  },
  quality: {
    title: 'Гарантия высокого качества',
    body: 'Бесплатная доставка по Узбекистану. Индивидуальный подход и своевременное выполнение работ.',
  },
  contact: {
    sectionTitle: 'Контакты',
    sectionBody: 'Свяжитесь с нами для обсуждения вашего проекта. Бесплатная консультация и оценка.',
    phone: 'Телефон',
    address: 'Адрес',
    addressLine1: 'Ташкентская область, г. Чирчик',
    addressLine2: 'ул. Корасув 10 (Ориентир: Юмалок)',
    hours: 'Рабочее время',
    hoursLine1: 'Понедельник – Суббота: 09:00 – 18:00',
    hoursLine2: 'Воскресенье: Выходной',
    mapTitle: 'Наш адрес',
    mapLink: 'Открыть в Яндекс Картах',
    usp: {
      delivery: 'Бесплатная доставка',
      quality: 'Гарантия качества',
      individual: 'Индивидуально',
    },
    form: {
      heading: 'Отправить сообщение',
      nameLabel: 'Ваше имя',
      namePlaceholder: 'Введите ваше имя',
      phoneLabel: 'Телефон',
      phonePlaceholder: '+998 __ ___ __ __',
      messageLabel: 'Сообщение',
      messagePlaceholder: 'Кратко о вашем проекте...',
      submit: 'Получить консультацию',
      submitting: 'Отправка...',
      errorRequired: 'Введите имя и номер телефона.',
      errorFailed: 'Сообщение не отправлено. Попробуйте позже.',
      errorServer: 'Ошибка подключения к серверу. Попробуйте ещё раз.',
      success: 'Ваш запрос отправлен. Мы свяжемся с вами в ближайшее время.',
    },
  },
  footer: {
    copyright: '© 2026 Iskandar Home. Все права защищены.',
    instagram: 'Instagram: @Iskandar_home',
    telegram: 'Telegram: +998976809449',
  },
  servicePage: {
    notFound: 'Категория не найдена',
    backHome: 'На главную',
    backBtn: 'Назад',
    loading: 'Загрузка изображений...',
    empty: 'Изображения для этой категории ещё не добавлены.',
    noName: 'Без названия',
    noPriceLabel: 'Цена не указана',
    close: 'Закрыть',
    orderBtn: 'Оставить заявку',
  },
  orderModal: {
    title: 'Оставить заявку',
    productLabel: 'Товар',
    priceLabel: 'Цена',
    nameLabel: 'Ваше имя',
    namePlaceholder: 'Введите ваше имя',
    phoneLabel: 'Телефон',
    phonePlaceholder: '+998 __ ___ __ __',
    messageLabel: 'Дополнительный комментарий',
    messagePlaceholder: 'Дополнительные вопросы или пожелания...',
    submit: 'Отправить заявку',
    submitting: 'Отправка...',
    errorRequired: 'Введите имя и номер телефона.',
    errorFailed: 'Сообщение не отправлено. Попробуйте позже.',
    errorServer: 'Ошибка подключения к серверу. Попробуйте ещё раз.',
    success: 'Ваша заявка принята! Мы свяжемся с вами в ближайшее время.',
    close: 'Закрыть',
  },
  formatters: {
    currency: "сум",
    noPriceLabel: 'Цена не указана',
  },
};

export const translations: Record<Lang, Translations> = { uz, ru };
