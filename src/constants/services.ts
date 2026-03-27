import type { ServiceCategory, ServiceCategoryKey } from '../types';

export const SERVICES: ServiceCategory[] = [
  { key: 'doors',     title: 'Eshiklar',    desc: "Yog'och va MDF eshiklar, individual dizayn.",    img: '/service_doors.jpg' },
  { key: 'windows',   title: 'Derazalar',   desc: "AKFA tizimlari, issiqroq va tinchroq uy.",       img: '/service_windows.jpg' },
  { key: 'stairs',    title: 'Zinapoyalar', desc: "Shpon va yog'ochdan zinapoya va boshqalar.",      img: '/service_stairs.jpg' },
  { key: 'furniture', title: 'Mebel',       desc: "Korpusli va bo'yalgan mebellar.",                 img: '/service_furniture.jpg' },
  { key: 'flooring',  title: 'Pol / Tarkon',desc: "Sifatli pol qoplamalari va tarket.",              img: '/service_flooring.jpg' },
  { key: 'metal',     title: 'Metal ishlar',desc: "Temir panjaralar va maxsus konstruksiyalar.",     img: '/service_metal.jpg' },
];

export const SERVICE_KEYS = new Set<ServiceCategoryKey>(SERVICES.map((s) => s.key));
