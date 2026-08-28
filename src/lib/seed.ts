import "server-only";
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const PLACEHOLDER = "/images/placeholder-product.svg";

/** Idempotent-ish demo data seed (see README "Known simplifications" for exceptions). Shared by the CLI script and the one-time HTTP seed endpoint. */
export async function runSeed(prisma: PrismaClient) {
  const log: string[] = [];
  const say = (msg: string) => {
    log.push(msg);
    console.log(msg);
  };

  say("Seeding Ash & Kash...");

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      storeName: "Ash & Kash",
      brandColor: "#a97a3b",
      contactEmail: "hello@ashkash.example",
      contactPhone: "+92 300 1234567",
      contactAddress: "Karachi, Pakistan",
      socialInstagram: "ashkash",
      footerAbout:
        "Ash & Kash is a premium women's fashion boutique offering elevated ready-to-wear, luxury pieces, and considered essentials.",
      footerCopyright: `© ${new Date().getFullYear()} Ash & Kash. All rights reserved.`,
      codEnabled: true,
      freeShippingNote: "Free shipping on orders above Rs. 5,000",
      baseCurrencyCode: "PKR",
      defaultCountryCode: "PK",
      seoDefaultTitle: "Ash & Kash — Premium Women's Fashion",
      seoDefaultDescription: "Elevated ready-to-wear and luxury essentials for the modern woman.",
      newsletterProvider: "none",
    },
    update: {},
  });

  const resources = ["products", "orders", "customers", "coupons", "shipping", "content", "blog", "seo", "settings", "users"];
  const actions = ["view", "create", "edit", "delete", "publish"];
  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { name: `${resource}.${action}` },
        create: { name: `${resource}.${action}`, resource, action },
        update: {},
      });
    }
  }
  await prisma.role.upsert({ where: { slug: "manager" }, create: { name: "Manager", slug: "manager", isSystem: true }, update: {} });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const admin = await prisma.user.upsert({
    where: { email: "admin@ashkash.test" },
    create: {
      name: "Store Admin",
      email: "admin@ashkash.test",
      password: await bcrypt.hash(adminPassword, 10),
      userRole: "SUPER_ADMIN",
      isActive: true,
    },
    update: {},
  });
  say(`Admin login: admin@ashkash.test / ${adminPassword}`);

  const currencyData = [
    { name: "Pakistani Rupee", code: "PKR", symbol: "Rs.", exchangeRate: 1, decimalPlaces: 0, isDefault: true },
    { name: "US Dollar", code: "USD", symbol: "$", exchangeRate: 0.0036, decimalPlaces: 2 },
    { name: "Indian Rupee", code: "INR", symbol: "₹", exchangeRate: 0.3, decimalPlaces: 0 },
    { name: "UAE Dirham", code: "AED", symbol: "AED ", exchangeRate: 0.013, decimalPlaces: 2 },
    { name: "Saudi Riyal", code: "SAR", symbol: "SAR ", exchangeRate: 0.0135, decimalPlaces: 2 },
    { name: "Qatari Riyal", code: "QAR", symbol: "QAR ", exchangeRate: 0.013, decimalPlaces: 2 },
    { name: "Kuwaiti Dinar", code: "KWD", symbol: "KD ", exchangeRate: 0.0011, decimalPlaces: 3 },
    { name: "Omani Rial", code: "OMR", symbol: "OMR ", exchangeRate: 0.0014, decimalPlaces: 3 },
    { name: "Bahraini Dinar", code: "BHD", symbol: "BD ", exchangeRate: 0.0014, decimalPlaces: 3 },
  ];
  const currencies: Record<string, string> = {};
  for (const c of currencyData) {
    const row = await prisma.currency.upsert({
      where: { code: c.code },
      create: { ...c, symbolPosition: "BEFORE", isActive: true },
      update: {},
    });
    currencies[c.code] = row.id;
    await prisma.exchangeRate.create({ data: { currencyId: row.id, rate: c.exchangeRate, source: "seed" } });
  }

  const countryData = [
    { name: "Pakistan", iso2: "PK", phoneCode: "+92", code: "PKR" },
    { name: "India", iso2: "IN", phoneCode: "+91", code: "INR" },
    { name: "United States", iso2: "US", phoneCode: "+1", code: "USD" },
    { name: "United Kingdom", iso2: "GB", phoneCode: "+44", code: "USD" },
    { name: "United Arab Emirates", iso2: "AE", phoneCode: "+971", code: "AED" },
    { name: "Saudi Arabia", iso2: "SA", phoneCode: "+966", code: "SAR" },
    { name: "Qatar", iso2: "QA", phoneCode: "+974", code: "QAR" },
    { name: "Kuwait", iso2: "KW", phoneCode: "+965", code: "KWD" },
    { name: "Oman", iso2: "OM", phoneCode: "+968", code: "OMR" },
    { name: "Bahrain", iso2: "BH", phoneCode: "+973", code: "BHD" },
    { name: "Canada", iso2: "CA", phoneCode: "+1", code: "USD" },
    { name: "Australia", iso2: "AU", phoneCode: "+61", code: "USD" },
  ];
  for (const c of countryData) {
    await prisma.country.upsert({
      where: { iso2: c.iso2 },
      create: { name: c.name, iso2: c.iso2, phoneCode: c.phoneCode, currencyId: currencies[c.code], isActive: true },
      update: {},
    });
  }

  const sizeNames = ["XS", "S", "M", "L", "XL", "XXL"];
  const sizes: Record<string, string> = {};
  for (let i = 0; i < sizeNames.length; i++) {
    const s = await prisma.size.upsert({ where: { name: sizeNames[i]! }, create: { name: sizeNames[i]!, sortOrder: i }, update: {} });
    sizes[sizeNames[i]!] = s.id;
  }
  const colorData = [
    { name: "Black", hex: "#171410" },
    { name: "White", hex: "#faf8f4" },
    { name: "Red", hex: "#a3282a" },
    { name: "Blue", hex: "#2c3e63" },
    { name: "Beige", hex: "#d7b071" },
    { name: "Pink", hex: "#dba3a8" },
  ];
  const colors: Record<string, string> = {};
  for (let i = 0; i < colorData.length; i++) {
    const c = await prisma.color.upsert({
      where: { name: colorData[i]!.name },
      create: { name: colorData[i]!.name, hexValue: colorData[i]!.hex, sortOrder: i },
      update: {},
    });
    colors[colorData[i]!.name] = c.id;
  }

  const existingBrand = await prisma.brand.findUnique({ where: { slug: "ash-kash-atelier" } });
  const brand =
    existingBrand ?? (await prisma.brand.create({ data: { name: "Ash & Kash Atelier", slug: "ash-kash-atelier", isActive: true } }));

  const tagNames = ["Silk", "Linen", "Formal", "Casual", "Occasionwear", "Handcrafted", "Limited Edition"];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const t = await prisma.tag.upsert({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) }, update: {} });
    tags[name] = t.id;
  }

  let sizeGuide = await prisma.sizeGuide.findFirst({ where: { title: "Women's Apparel Size Guide" } });
  if (!sizeGuide) {
    sizeGuide = await prisma.sizeGuide.create({
      data: {
        title: "Women's Apparel Size Guide",
        unit: "in",
        instructions: "Measurements are in inches. For the best fit, measure yourself and compare to the chart below.",
        rows: {
          create: [
            { sizeName: "XS", position: 0, measurements: { Bust: "32", Waist: "25", Hip: "34" } },
            { sizeName: "S", position: 1, measurements: { Bust: "34", Waist: "27", Hip: "36" } },
            { sizeName: "M", position: 2, measurements: { Bust: "36", Waist: "29", Hip: "38" } },
            { sizeName: "L", position: 3, measurements: { Bust: "38", Waist: "31", Hip: "40" } },
            { sizeName: "XL", position: 4, measurements: { Bust: "40", Waist: "33", Hip: "42" } },
          ],
        },
      },
    });
  }

  const categoryDefs = [
    { name: "New Arrivals", description: "The latest additions to the collection." },
    { name: "Ready to Wear", description: "Everyday essentials, elevated." },
    { name: "Luxury Collection", description: "Statement pieces for special occasions." },
  ];
  const categories: Record<string, string> = {};
  for (let i = 0; i < categoryDefs.length; i++) {
    const c = await prisma.category.upsert({
      where: { slug: slugify(categoryDefs[i]!.name) },
      create: {
        name: categoryDefs[i]!.name,
        slug: slugify(categoryDefs[i]!.name),
        description: categoryDefs[i]!.description,
        imageUrl: PLACEHOLDER,
        sizeGuideId: sizeGuide.id,
        sortOrder: i,
        isActive: true,
      },
      update: {},
    });
    categories[categoryDefs[i]!.name] = c.id;
  }

  const productDefs = [
    { name: "Silk Wrap Dress", category: "Luxury Collection", price: 18500, compareAt: 22000, tags: ["Silk", "Occasionwear"], featured: true },
    { name: "Linen Shirt Dress", category: "Ready to Wear", price: 8500, tags: ["Linen", "Casual"] },
    { name: "Tailored Blazer", category: "Ready to Wear", price: 14500, tags: ["Formal"], bestSeller: true },
    { name: "Embroidered Kaftan", category: "Luxury Collection", price: 24500, compareAt: 29000, tags: ["Handcrafted", "Occasionwear"], sale: true },
    { name: "Everyday Midi Skirt", category: "Ready to Wear", price: 6500, tags: ["Casual"], newArrival: true },
    { name: "Draped Evening Gown", category: "Luxury Collection", price: 32000, tags: ["Silk", "Occasionwear"], featured: true },
    { name: "Cotton Poplin Blouse", category: "New Arrivals", price: 5500, tags: ["Casual"], newArrival: true },
    { name: "Statement Sleeve Top", category: "New Arrivals", price: 7200, tags: ["Formal"], newArrival: true },
    { name: "Pleated Wide-Leg Trousers", category: "Ready to Wear", price: 9800, tags: ["Formal"], bestSeller: true },
    { name: "Hand-Embellished Shawl", category: "Luxury Collection", price: 15500, tags: ["Handcrafted", "Limited Edition"] },
    { name: "Classic Trench Coat", category: "Ready to Wear", price: 21000, compareAt: 25000, tags: ["Formal"], sale: true },
    { name: "Printed Maxi Dress", category: "New Arrivals", price: 11500, tags: ["Casual"], newArrival: true, featured: true },
  ];

  const productColorPairs: [string, string][] = [
    ["Black", "Beige"],
    ["White", "Pink"],
    ["Blue", "Red"],
  ];

  for (let i = 0; i < productDefs.length; i++) {
    const def = productDefs[i]!;
    const slug = slugify(def.name);
    const sku = `AK-${1000 + i}`;

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    const product =
      existingProduct ??
      (await prisma.product.create({
        data: {
          name: def.name,
          slug,
          sku,
          brandId: brand.id,
          categoryId: categories[def.category],
          sizeGuideId: sizeGuide.id,
          shortDescription: `A considered piece from the ${def.category} edit.`,
          description: `The ${def.name} is crafted from premium materials with meticulous attention to detail. Designed to transition effortlessly from day to evening, this piece is a versatile addition to any wardrobe.`,
          price: def.price,
          compareAtPrice: def.compareAt ?? null,
          trackInventory: true,
          inventoryQuantity: 0,
          lowStockThreshold: 5,
          status: "ACTIVE",
          isFeatured: Boolean(def.featured),
          isBestSeller: Boolean(def.bestSeller),
          isNewArrival: Boolean(def.newArrival),
          isSale: Boolean(def.sale),
          seoTitle: def.name,
          seoDescription: `Shop the ${def.name} — premium women's fashion from Ash & Kash.`,
          publishedAt: new Date(),
          isDemo: true,
          images: {
            create: [
              { url: PLACEHOLDER, altText: def.name, isPrimary: true, position: 0 },
              { url: PLACEHOLDER, altText: `${def.name} alternate view`, isPrimary: false, position: 1 },
            ],
          },
        },
      }));

    for (const tagName of def.tags) {
      await prisma.productTag.upsert({
        where: { productId_tagId: { productId: product.id, tagId: tags[tagName]! } },
        create: { productId: product.id, tagId: tags[tagName]! },
        update: {},
      });
    }

    if (!existingProduct) {
      const pair = productColorPairs[i % productColorPairs.length]!;
      let totalStock = 0;
      let position = 0;
      for (const colorName of pair) {
        for (const sizeName of ["S", "M", "L"]) {
          const qty = Math.floor(Math.random() * 12);
          totalStock += qty;
          await prisma.productVariant.upsert({
            where: { sku: `${sku}-${colorName.slice(0, 2).toUpperCase()}-${sizeName}` },
            create: {
              productId: product.id,
              sizeId: sizes[sizeName],
              colorId: colors[colorName],
              sku: `${sku}-${colorName.slice(0, 2).toUpperCase()}-${sizeName}`,
              title: `${colorName} / ${sizeName}`,
              inventoryQuantity: qty,
              position: position++,
              isActive: true,
            },
            update: {},
          });
        }
      }
      await prisma.product.update({ where: { id: product.id }, data: { inventoryQuantity: totalStock } });
    }
  }

  const allProducts = await prisma.product.findMany();
  const bestSellers = allProducts.filter((p) => p.isBestSeller);
  const featured = allProducts.filter((p) => p.isFeatured);

  const everyday = await prisma.collection.upsert({
    where: { slug: "everyday-essentials" },
    create: {
      name: "Everyday Essentials",
      slug: "everyday-essentials",
      description: "Wardrobe staples for daily wear.",
      imageUrl: PLACEHOLDER,
      type: "MANUAL",
      isActive: true,
      sortOrder: 0,
    },
    update: {},
  });
  for (let i = 0; i < bestSellers.length; i++) {
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: everyday.id, productId: bestSellers[i]!.id } },
      create: { collectionId: everyday.id, productId: bestSellers[i]!.id, sortOrder: i },
      update: {},
    });
  }

  const evening = await prisma.collection.upsert({
    where: { slug: "statement-evening-wear" },
    create: {
      name: "Statement Evening Wear",
      slug: "statement-evening-wear",
      description: "Show-stopping pieces for special occasions.",
      imageUrl: PLACEHOLDER,
      type: "MANUAL",
      isActive: true,
      sortOrder: 1,
    },
    update: {},
  });
  for (let i = 0; i < featured.length; i++) {
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: evening.id, productId: featured[i]!.id } },
      create: { collectionId: evening.id, productId: featured[i]!.id, sortOrder: i },
      update: {},
    });
  }

  await prisma.collection.upsert({
    where: { slug: "wedding-season-edit" },
    create: {
      name: "Wedding Season Edit",
      slug: "wedding-season-edit",
      description: "Sale pieces perfect for the wedding season.",
      imageUrl: PLACEHOLDER,
      type: "AUTOMATIC",
      rules: { isSale: true },
      isActive: true,
      sortOrder: 2,
    },
    update: {},
  });

  let slider = await prisma.slider.findFirst({ where: { location: "home_hero" } });
  if (!slider) {
    slider = await prisma.slider.create({ data: { name: "Homepage Hero", location: "home_hero", isActive: true } });
    const slideDefs = [
      { tag: "New Season", title: "The Autumn Edit", subtitle: "Considered pieces for the season ahead", buttonText: "Shop New Arrivals", buttonUrl: "/category/new-arrivals" },
      { tag: "Luxury Collection", title: "Evening, Elevated", subtitle: "Statement pieces for every occasion", buttonText: "Shop Luxury", buttonUrl: "/category/luxury-collection" },
      { tag: "Sale", title: "Up To 30% Off", subtitle: "Selected styles, while they last", buttonText: "Shop Sale", buttonUrl: "/shop?on_sale=1" },
    ];
    for (let i = 0; i < slideDefs.length; i++) {
      const d = slideDefs[i]!;
      await prisma.sliderItem.create({
        data: {
          sliderId: slider.id,
          tag: d.tag,
          title: d.title,
          subtitle: d.subtitle,
          desktopImage: PLACEHOLDER,
          mobileImage: PLACEHOLDER,
          buttonText: d.buttonText,
          buttonUrl: d.buttonUrl,
          textAlign: "LEFT",
          overlayOpacity: 25,
          durationMs: 6000,
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  const sectionCount = await prisma.homepageSection.count();
  if (sectionCount === 0) {
    const sectionDefs: {
      type: Parameters<typeof prisma.homepageSection.create>[0]["data"]["type"];
      title?: string;
      subtitle?: string;
      content?: string;
      buttonText?: string;
      buttonUrl?: string;
      settings?: object;
    }[] = [
      { type: "HERO_SLIDER" },
      { type: "FEATURED_CATEGORIES", title: "Shop By Category", subtitle: "Curated Edits" },
      { type: "NEW_ARRIVALS", title: "New Arrivals", subtitle: "Just In", buttonText: "View All", buttonUrl: "/shop?sort=newest", settings: { source: "new_arrival", limit: 8 } },
      { type: "PROMO_BANNER", title: "The Luxury Collection", subtitle: "Occasionwear", content: "Hand-finished pieces for your most memorable moments.", buttonText: "Discover", buttonUrl: "/category/luxury-collection" },
      { type: "BEST_SELLERS", title: "Best Sellers", subtitle: "Customer Favorites", buttonText: "Shop Best Sellers", buttonUrl: "/shop?sort=best_selling", settings: { source: "best_seller", limit: 8 } },
      { type: "COLLECTION_SHOWCASE", title: "Shop by Collection" },
      { type: "BRAND_STORY", title: "Our Story", subtitle: "Crafted With Care", content: "Ash & Kash was founded on the belief that clothing should be both beautiful and considered — made to last, styled to love." },
      { type: "TESTIMONIALS", title: "What Our Customers Say" },
      { type: "INSTAGRAM", title: "Follow Along" },
      { type: "NEWSLETTER", title: "Stay In The Know", subtitle: "Be the first to hear about new arrivals and private sales." },
    ];
    for (let i = 0; i < sectionDefs.length; i++) {
      const d = sectionDefs[i]!;
      await prisma.homepageSection.create({
        data: {
          type: d.type,
          title: d.title,
          subtitle: d.subtitle,
          content: d.content,
          imageUrl: d.type === "PROMO_BANNER" || d.type === "BRAND_STORY" ? PLACEHOLDER : null,
          buttonText: d.buttonText,
          buttonUrl: d.buttonUrl,
          settings: d.settings ?? undefined,
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    const testimonialDefs = [
      { name: "Ayesha K.", content: "The quality is exceptional and the fit is perfect. My new favorite boutique." },
      { name: "Meher R.", content: "Fast delivery and the dress looked even better in person. Highly recommend!" },
      { name: "Sana T.", content: "Beautifully made pieces that feel special. Customer service was wonderful too." },
    ];
    for (let i = 0; i < testimonialDefs.length; i++) {
      await prisma.testimonial.create({ data: { ...testimonialDefs[i]!, rating: 5, sortOrder: i, isActive: true } });
    }
  }

  const zoneCount = await prisma.shippingZone.count();
  if (zoneCount === 0) {
    const zoneDefs = [
      { name: "Pakistan", countries: ["PK"], methods: [{ name: "Standard Delivery", price: 250, freeShippingThreshold: 5000, min: 3, max: 5 }] },
      { name: "United Arab Emirates", countries: ["AE"], methods: [{ name: "International Delivery", price: 2500, freeShippingThreshold: 30000, min: 5, max: 8 }] },
      { name: "Saudi Arabia", countries: ["SA"], methods: [{ name: "International Delivery", price: 2500, freeShippingThreshold: 30000, min: 5, max: 8 }] },
      { name: "India", countries: ["IN"], methods: [{ name: "International Delivery", price: 2000, freeShippingThreshold: 25000, min: 6, max: 10 }] },
      { name: "United States", countries: ["US"], methods: [{ name: "International Delivery", price: 3500, freeShippingThreshold: 40000, min: 7, max: 12 }] },
      { name: "Rest of World", countries: ["*"], methods: [{ name: "International Delivery", price: 4000, freeShippingThreshold: null, min: 7, max: 14 }] },
    ];
    for (let i = 0; i < zoneDefs.length; i++) {
      const z = zoneDefs[i]!;
      const zone = await prisma.shippingZone.create({ data: { name: z.name, countries: z.countries, sortOrder: i, isActive: true } });
      for (let j = 0; j < z.methods.length; j++) {
        const m = z.methods[j]!;
        await prisma.shippingMethod.create({
          data: {
            zoneId: zone.id,
            name: m.name,
            price: m.price,
            freeShippingThreshold: m.freeShippingThreshold,
            estimatedDaysMin: m.min,
            estimatedDaysMax: m.max,
            sortOrder: j,
            isActive: true,
          },
        });
      }
    }
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    create: { code: "WELCOME10", type: "PERCENTAGE", amount: 10, firstOrderOnly: true, usageLimitPerCustomer: 1, isActive: true },
    update: {},
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE1500" },
    create: { code: "SAVE1500", type: "FIXED", amount: 1500, minOrderAmount: 10000, isActive: true },
    update: {},
  });
  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    create: { code: "FREESHIP", type: "FREE_SHIPPING", amount: 0, minOrderAmount: 5000, isActive: true },
    update: {},
  });

  const pageDefs = [
    { title: "About Us", slug: "about-us", content: "<p>Ash & Kash is a premium women's fashion boutique founded on the belief that clothing should be both beautiful and considered.</p>" },
    { title: "Privacy Policy", slug: "privacy-policy", content: "<p>We respect your privacy. This policy explains how we collect and use your information.</p>" },
    { title: "Terms & Conditions", slug: "terms-conditions", content: "<p>By using this website, you agree to the following terms and conditions.</p>" },
    { title: "Shipping Policy", slug: "shipping-policy", content: "<p>We ship across Pakistan and internationally. See our shipping page for rates and delivery estimates.</p>" },
    { title: "Return Policy", slug: "return-policy", content: "<p>Items may be returned within 7 days of delivery in original condition.</p>" },
    { title: "FAQ", slug: "faq", content: "<p>Frequently asked questions about ordering, shipping, and returns.</p>" },
  ];
  for (const p of pageDefs) {
    await prisma.page.upsert({ where: { slug: p.slug }, create: { ...p, isPublished: true }, update: {} });
  }

  const headerMenu = await prisma.menu.upsert({ where: { location: "HEADER" }, create: { name: "Header Menu", location: "HEADER" }, update: {} });
  const footerMenu = await prisma.menu.upsert({ where: { location: "FOOTER" }, create: { name: "Footer Menu", location: "FOOTER" }, update: {} });

  const headerItemCount = await prisma.menuItem.count({ where: { menuId: headerMenu.id } });
  if (headerItemCount === 0) {
    const shopItem = await prisma.menuItem.create({ data: { menuId: headerMenu.id, label: "Shop", type: "CUSTOM", url: "/shop", sortOrder: 0, isActive: true } });
    let childOrder = 0;
    for (const [name, id] of Object.entries(categories)) {
      await prisma.menuItem.create({ data: { menuId: headerMenu.id, parentId: shopItem.id, label: name, type: "CATEGORY", categoryId: id, sortOrder: childOrder++, isActive: true } });
    }
    await prisma.menuItem.create({ data: { menuId: headerMenu.id, label: "Collections", type: "CUSTOM", url: "/collection/everyday-essentials", sortOrder: 1, isActive: true } });
    await prisma.menuItem.create({ data: { menuId: headerMenu.id, label: "Journal", type: "CUSTOM", url: "/blog", sortOrder: 2, isActive: true } });
    await prisma.menuItem.create({ data: { menuId: headerMenu.id, label: "About", type: "CUSTOM", url: "/about", sortOrder: 3, isActive: true } });
    await prisma.menuItem.create({ data: { menuId: headerMenu.id, label: "Contact", type: "CUSTOM", url: "/contact", sortOrder: 4, isActive: true } });
  }

  const footerItemCount = await prisma.menuItem.count({ where: { menuId: footerMenu.id } });
  if (footerItemCount === 0) {
    let footerOrder = 0;
    for (const p of pageDefs.filter((p) => p.slug !== "about-us")) {
      await prisma.menuItem.create({ data: { menuId: footerMenu.id, label: p.title, type: "CUSTOM", url: `/pages/${p.slug}`, sortOrder: footerOrder++, isActive: true } });
    }
  }

  const styleGuides = await prisma.blogCategory.upsert({ where: { slug: "style-guides" }, create: { name: "Style Guides", slug: "style-guides" }, update: {} });
  const news = await prisma.blogCategory.upsert({ where: { slug: "news" }, create: { name: "News", slug: "news" }, update: {} });

  const blogDefs = [
    { title: "How to Style Silk for Every Season", categoryId: styleGuides.id, excerpt: "Our guide to wearing silk year-round.", content: "<p>Silk is more versatile than you think. Here's how to style it through every season.</p>" },
    { title: "The Ash & Kash Autumn Edit", categoryId: news.id, excerpt: "Introducing our new autumn collection.", content: "<p>We're excited to introduce our new autumn collection, featuring considered pieces for the season ahead.</p>" },
    { title: "Caring For Your Investment Pieces", categoryId: styleGuides.id, excerpt: "Tips for making your favorite pieces last.", content: "<p>Proper care extends the life of your favorite garments. Here are our top tips.</p>" },
  ];
  for (const b of blogDefs) {
    await prisma.blogPost.upsert({
      where: { slug: slugify(b.title) },
      create: { ...b, slug: slugify(b.title), authorId: admin.id, isPublished: true, publishedAt: new Date() },
      update: {},
    });
  }

  const customerDefs = [
    { name: "Fatima Ali", email: "fatima@example.com" },
    { name: "Zara Khan", email: "zara@example.com" },
    { name: "Amna Sheikh", email: "amna@example.com" },
  ];
  const customers = [];
  for (const c of customerDefs) {
    const existingCustomer = await prisma.user.findUnique({ where: { email: c.email } });
    const user =
      existingCustomer ??
      (await prisma.user.create({
        data: { name: c.name, email: c.email, password: await bcrypt.hash("password123", 10), userRole: "CUSTOMER", isActive: true },
      }));
    customers.push(user);
    if (!existingCustomer) {
      await prisma.address.create({
        data: {
          userId: user.id,
          label: "Home",
          fullName: c.name,
          phone: "+92 300 0000000",
          countryCode: "PK",
          city: "Karachi",
          addressLine1: "123 Main Street",
          isDefault: true,
        },
      });
    }
  }
  say("Sample customer login: fatima@example.com / password123");

  const demoOrderCount = await prisma.order.count({ where: { isDemo: true } });
  if (demoOrderCount === 0) {
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "DELIVERED"] as const;
    const pkZone = await prisma.shippingZone.findFirst({ where: { name: "Pakistan" }, include: { methods: true } });

    for (let i = 0; i < 12; i++) {
      const customer = customers[i % customers.length]!;
      const product = allProducts[i % allProducts.length]!;
      const status = statuses[i % statuses.length]!;
      const qty = 1 + (i % 3);
      const unitPrice = Number(product.price);
      const shipping = pkZone?.methods[0]?.price ? Number(pkZone.methods[0].price) : 250;

      const order = await prisma.order.create({
        data: {
          orderNumber: `AK-DEMO-${1000 + i}`,
          userId: customer.id,
          status,
          customerName: customer.name,
          email: customer.email,
          phone: "+92 300 0000000",
          currencyCode: "PKR",
          exchangeRateSnapshot: 1,
          subtotal: unitPrice * qty,
          discountTotal: 0,
          shippingTotal: shipping,
          taxTotal: 0,
          grandTotal: unitPrice * qty + shipping,
          shippingAddress: { fullName: customer.name, phone: "+92 300 0000000", countryCode: "PK", city: "Karachi", addressLine1: "123 Main Street" },
          shippingMethodName: "Standard Delivery",
          paymentMethod: "COD",
          paymentStatus: status === "DELIVERED" ? "PAID" : "PENDING",
          countryCode: "PK",
          isDemo: true,
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                image: PLACEHOLDER,
                quantity: qty,
                unitPrice,
                totalPrice: unitPrice * qty,
              },
            ],
          },
          statusHistory: { create: [{ status: "PENDING", note: "Order placed by customer (Cash on Delivery)." }] },
        },
      });
      if (status !== "PENDING") {
        await prisma.orderStatusHistory.create({ data: { orderId: order.id, status, note: "Status updated." } });
      }
    }
  }

  say("Seed complete.");
  return log;
}
