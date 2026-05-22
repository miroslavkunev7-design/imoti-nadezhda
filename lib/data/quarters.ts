import type { Quarter } from '@/types'

// Real neighborhood data from official sources and imot.bg
// image_url: null = user adds photo to /public/images/quarters/[slug].jpg
// OR uses the picsum placeholder (remove ?... to use your own)

export const QUARTERS_BY_CITY: Record<string, Quarter[]> = {

  // ═══════════════════════════════════════════════════
  //  ШУМЕН — 8 квартала
  // ═══════════════════════════════════════════════════
  shumen: [
    {
      id: 101, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Център', slug: 'centar',
      description: 'Централната градска зона на Шумен с основната инфраструктура, магазини, ресторанти и институции. Идеален за тези, които искат да са в сърцето на града.',
      image_url: null,
      population: 18000, area_km2: 3.2, property_count: 0,
    },
    {
      id: 102, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Добруджански', slug: 'dobrudjanski',
      description: 'Спокоен жилищен квартал с добра инфраструктура, детски градини и удобен достъп до центъра на града.',
      image_url: null,
      population: 12000, area_km2: 2.1, property_count: 0,
    },
    {
      id: 103, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Тракия', slug: 'trakiya',
      description: 'Един от най-спокойните и удобни райони в Шумен с отлична инфраструктура, в близост до училища, детски градини и хранителни магазини.',
      image_url: null,
      population: 14000, area_km2: 2.8, property_count: 0,
    },
    {
      id: 104, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Боян Българов', slug: 'boyan-bulgarov',
      description: 'Предпочитан квартал в Шумен с отлична локация, много зеленина и удобства. В близост до училища, детски градини, магазини и спирки на градски транспорт.',
      image_url: null,
      population: 15000, area_km2: 1.35, property_count: 0,
    },
    {
      id: 105, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Еверест', slug: 'everest',
      description: 'Квартал в северната част на Шумен. Обслужва се от автобусна линия 4. Достъпни цени и удобна локация близо до Хиподрума.',
      image_url: null,
      population: 8000, area_km2: 1.8, property_count: 0,
    },
    {
      id: 106, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Дивдядово', slug: 'divdyadovo',
      description: 'Тих вилен квартал в покрайнините на Шумен. Идеален за тези, които търсят спокойствие, природа и просторни парцели.',
      image_url: null,
      population: 5000, area_km2: 4.5, property_count: 0,
    },
    {
      id: 107, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Херсон', slug: 'herson',
      description: 'Жилищен комплекс в западната част на Шумен с панелно строителство и удобна транспортна достъпност до центъра.',
      image_url: null,
      population: 7000, area_km2: 1.2, property_count: 0,
    },
    {
      id: 108, city_id: 1, city_slug: 'shumen', city_name: 'Шумен',
      name: 'Пазара', slug: 'pazara',
      description: 'Централна търговска и жилищна зона на Шумен. Оживен район с множество търговски обекти и удобен достъп до всички градски съоръжения.',
      image_url: null,
      population: 6000, area_km2: 0.9, property_count: 0,
    },
  ],

  // ═══════════════════════════════════════════════════
  //  ВАРНА — 12 квартала
  // ═══════════════════════════════════════════════════
  varna: [
    {
      id: 201, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Център', slug: 'centar',
      description: 'Сърцето на морската столица с луксозни имоти, оживен бизнес живот и богата история. Непосредствена близост до Морската градина и централния плаж.',
      image_url: null,
      population: 45000, area_km2: 5.2, property_count: 0,
    },
    {
      id: 202, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Чайка', slug: 'chayka',
      description: 'Най-атрактивният квартал за живеене във Варна — в непосредствена близост до Морската градина и Делфинариума. Богата зеленина и тихи улици.',
      image_url: null,
      population: 35000, area_km2: 3.8, property_count: 0,
    },
    {
      id: 203, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Левски', slug: 'levski',
      description: 'Голям жилищен квартал с около 40 000 жители. Добре свързан с транспорт, с болници, университети и търговски обекти в непосредствена близост.',
      image_url: null,
      population: 40000, area_km2: 4.5, property_count: 0,
    },
    {
      id: 204, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Трошево', slug: 'troshevo',
      description: 'Модерен квартал с активна нова строителна дейност. Предпочитан от семейства заради наличието на училища и удобна инфраструктура.',
      image_url: null,
      population: 25000, area_km2: 3.1, property_count: 0,
    },
    {
      id: 205, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Владиславово', slug: 'vladislavovo',
      description: 'Един от най-големите жилищни комплекси в България с 43 230 жители. Наименуван в чест на крал Владислав III Ягело (Варненчик).',
      image_url: null,
      population: 43230, area_km2: 6.8, property_count: 0,
    },
    {
      id: 206, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Кайсиева градина', slug: 'kaysiyeva-gradina',
      description: 'Приятен квартал построен върху изсечена кайсиева градина. Спокойна атмосфера, добра инфраструктура и много зелени пространства.',
      image_url: null,
      population: 18000, area_km2: 2.4, property_count: 0,
    },
    {
      id: 207, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Бриз', slug: 'briz',
      description: 'Престижен крайбрежен квартал с панорамни морски гледки. Луксозни имоти с директен достъп до плажа и морската атмосфера.',
      image_url: null,
      population: 12000, area_km2: 2.0, property_count: 0,
    },
    {
      id: 208, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Изгрев', slug: 'izgrev',
      description: 'Развит квартал с около 30 000 жители, предпочитан от млади семейства. Отлична инфраструктура, свободни паркоместа и добро строителство.',
      image_url: null,
      population: 30000, area_km2: 3.5, property_count: 0,
    },
    {
      id: 209, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Аспарухово', slug: 'asparuhovo',
      description: 'Живописен квартал на полуостров с уникална морска атмосфера, езера и природа. Идеален за тези, търсещи тишина близо до морето.',
      image_url: null,
      population: 20000, area_km2: 8.5, property_count: 0,
    },
    {
      id: 210, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Галата', slug: 'galata',
      description: 'Тихо предградие с вилни имоти и природна среда. Предлага спокоен живот на минути от Варна с прекрасни гледки към Черно море.',
      image_url: null,
      population: 8000, area_km2: 5.2, property_count: 0,
    },
    {
      id: 211, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Виница', slug: 'vinica',
      description: 'Елитна вилна зона с луксозни имоти, спокойна атмосфера и прекрасна природа. Един от най-предпочитаните адреси за луксозно живеене близо до Варна.',
      image_url: null,
      population: 6000, area_km2: 7.1, property_count: 0,
    },
    {
      id: 212, city_id: 2, city_slug: 'varna', city_name: 'Варна',
      name: 'Младост', slug: 'mladost',
      description: 'Жилищен квартал с достъпни цени и добра инфраструктура. Подходящ за млади семейства, търсещи комфортен живот в близост до центъра.',
      image_url: null,
      population: 22000, area_km2: 3.3, property_count: 0,
    },
  ],

  // ═══════════════════════════════════════════════════
  //  БУРГАС — 9 квартала
  // ═══════════════════════════════════════════════════
  burgas: [
    {
      id: 301, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Център', slug: 'centar',
      description: 'Централна градска зона в непосредствена близост до Морската градина и Бургаското езеро. Исторически квартал с богата архитектура.',
      image_url: null,
      population: 28000, area_km2: 4.1, property_count: 0,
    },
    {
      id: 302, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Лазур', slug: 'lazur',
      description: 'Най-атрактивният квартал в Бургас с 20 296 жители. В близост до морето, Морската градина и Бургаския свободен университет.',
      image_url: null,
      population: 20296, area_km2: 2.8, property_count: 0,
    },
    {
      id: 303, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Меден рудник', slug: 'meden-rudnik',
      description: 'Най-големият жилищен комплекс на Бургас с 60 000 жители. Редовен транспорт до центъра и пълна инфраструктура.',
      image_url: null,
      population: 60000, area_km2: 12.5, property_count: 0,
    },
    {
      id: 304, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Славейков', slug: 'slaveykov',
      description: 'Жилищен комплекс с най-дългия жилищен блок в България — блок 55 (483 м, 23 входа). Развита инфраструктура и достъпни цени.',
      image_url: null,
      population: 35000, area_km2: 4.8, property_count: 0,
    },
    {
      id: 305, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Зорница', slug: 'zornica',
      description: 'Спокоен жилищен квартал с добре развита инфраструктура. Удобен достъп до центъра и близост до Изгрев и Славейков.',
      image_url: null,
      population: 18000, area_km2: 2.5, property_count: 0,
    },
    {
      id: 306, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Изгрев', slug: 'izgrev',
      description: 'Развит квартал с около 30 000 жители. Предпочитан от млади семейства, с детски градини, училища и нови бизнес сгради наоколо.',
      image_url: null,
      population: 30000, area_km2: 3.6, property_count: 0,
    },
    {
      id: 307, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Възраждане', slug: 'vazrajdane',
      description: 'Централен исторически квартал с Опера, Драматичен театър, Борисовата градина и търговската улица "Фердинандова".',
      image_url: null,
      population: 15000, area_km2: 1.8, property_count: 0,
    },
    {
      id: 308, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Братя Миладинови', slug: 'bratya-miladinovi',
      description: 'Спокоен централен квартал в близост до Лазур. Добра инфраструктура и удобен достъп до всички градски услуги.',
      image_url: null,
      population: 12000, area_km2: 1.5, property_count: 0,
    },
    {
      id: 309, city_id: 3, city_slug: 'burgas', city_name: 'Бургас',
      name: 'Сарафово', slug: 'sarafovo',
      description: 'Живописно предградие до летище Бургас с морска атмосфера, тихи улици и разнообразие от имоти — от апартаменти до вили.',
      image_url: null,
      population: 8000, area_km2: 5.2, property_count: 0,
    },
  ],

  // ═══════════════════════════════════════════════════
  //  НОВИ ПАЗАР — 4 зони
  // ═══════════════════════════════════════════════════
  'novi-pazar': [
    {
      id: 401, city_id: 4, city_slug: 'novi-pazar', city_name: 'Нови пазар',
      name: 'Център', slug: 'centar',
      description: 'Централната градска зона на Нови пазар с главния парк, площадът и основните институции. Приятна атмосфера и развита инфраструктура.',
      image_url: null,
      population: 5000, area_km2: 1.8, property_count: 0,
    },
    {
      id: 402, city_id: 4, city_slug: 'novi-pazar', city_name: 'Нови пазар',
      name: 'Запад', slug: 'zapad',
      description: 'Западната жилищна зона на Нови пазар с панелни блокове и достъпни цени. Тихо и спокойно място за семейно живеене.',
      image_url: null,
      population: 3500, area_km2: 2.1, property_count: 0,
    },
    {
      id: 403, city_id: 4, city_slug: 'novi-pazar', city_name: 'Нови пазар',
      name: 'Изток', slug: 'iztok',
      description: 'Източната жилищна зона с нова строителна активност. Добра транспортна достъпност и близост до промишлената зона.',
      image_url: null,
      population: 2500, area_km2: 2.4, property_count: 0,
    },
    {
      id: 404, city_id: 4, city_slug: 'novi-pazar', city_name: 'Нови пазар',
      name: 'Вилна зона', slug: 'vilna-zona',
      description: 'Спокойна вилна зона на покрайнините на Нови пазар. Предлага парцели и вили в природна среда на достъпни цени.',
      image_url: null,
      population: 1000, area_km2: 4.5, property_count: 0,
    },
  ],
}

export function getQuartersForCity(citySlug: string): Quarter[] {
  return QUARTERS_BY_CITY[citySlug] ?? []
}
