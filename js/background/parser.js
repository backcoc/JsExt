const brandRegex = /(by|from)\s[\u00BF-\u1FFF\u2C00-\uD7FF\w|\s][^\n|\r|\t]+/i
const brandRegexLineInfo = /(?<=Visit the|Brand:)(.*?)(?=Store|$)|.+/i
const plainBrandRegex = /[\u00BF-\u1FFF\u2C00-\uD7FF\w|\s][^\n|\r|\t]+/i
const priceRegex = /((\$|\€|\£|\₹\s?|CDN\$\s|EUR\s)?[0-9(\s|&nbsp;)?]+[,.]+[0-9]+)|((\¥|￥)\d{1,3}(,\d{3})*)/i //Check always filter.js
const currencyRegex = /(¥|￥|\$|\€|\£|\₹\s?|CDN\$\s|EUR\s)/i //Check always filter.js
const thousandSeparatorRegex = /(\d+)[\,\.](?=\d{3}(\D|$))/g //Get thousand separator on Germany and French Store
const CATEGORY_CODES_BY_COUNTRY = [
  {
    country: 'us',
    categoryCodes: {
      'all departments': 'aps',
      'audible books & originals': 'audible',
      'alexa skills': 'alexa-skills',
      'amazon devices': 'amazon-devices',
      'amazon fresh': 'amazonfresh',
      'amazon warehouse': 'warehouse-deals',
      appliances: 'appliances',
      'apps & games': 'mobile-apps',
      'arts, crafts & sewing': 'arts-crafts',
      'automotive parts & accessories': 'automotive',
      baby: 'fashion-baby',
      'beauty & personal care': 'beauty',
      books: 'stripbooks',
      'cds & vinyl': 'popular',
      'cell phones & accessories': 'mobile',
      'clothing, shoes & jewelry': 'fashion',
      women: 'fashion-womens',
      men: 'fashion-mens',
      girls: 'fashion-girls',
      boys: 'fashion-boys',
      'collectibles & fine art': 'collectibles',
      computers: 'computers',
      courses: 'courses',
      'credit and payment cards': 'financial',
      'digital music': 'digital-music',
      electronics: 'electronics',
      'garden & outdoor': 'lawngarden',
      'gift cards': 'gift-cards',
      'grocery & gourmet food': 'grocery',
      handmade: 'handmade',
      'health, household & baby care': 'hpc',
      'home & business services': 'local-services',
      'home & kitchen': 'garden',
      'industrial & scientific': 'industrial',
      'just for prime': 'prime-exclusive',
      'kindle store': 'digital-text',
      'luggage & travel gear': 'fashion-luggage',
      'luxury beauty': 'luxury-beauty',
      'magazine subscriptions': 'magazines',
      'movies & tv': 'movies-tv',
      'musical instruments': 'mi',
      'office products': 'office-products',
      'pet supplies': 'pets',
      'prime pantry': 'pantry',
      'prime video': 'instant-video',
      software: 'software',
      'sports & outdoors': 'sporting',
      'tools & home improvement': 'tools',
      'toys & games': 'toys-and-games',
      vehicles: 'vehicles',
      'video games': 'videogames'
    }
  },
  {
    country: 'us-intl',
    categoryCodes: {
      'all departments': 'aps',
      'arts & crafts': 'arts-crafts',
      automotive: 'automotive',
      baby: 'baby-products',
      'beauty & personal care': 'beauty',
      books: 'stripbooks',
      computers: 'computers',
      'digital music': 'digital-music',
      electronics: 'electronics',
      'kindle store': 'digital-text',
      'prime video': 'instant-video',
      "women's fashion": 'fashion-womens',
      "men's fashion": 'fashion-mens',
      "girls' fashion": 'fashion-girls',
      "boys' fashion": 'fashion-boys',
      deals: 'deals',
      'health & household': 'hpc',
      'home & kitchen': 'kitchen',
      'industrial & scientific': 'industrial',
      luggage: 'luggage',
      'movies & tv': 'movies-tv',
      'music, cds & vinyl': 'music',
      'pet supplies': 'pets',
      software: 'software',
      'sports & outdoors': 'sporting',
      'tools & home improvement': 'tools',
      'toys & games': 'toys-and-games',
      'video games': 'videogames'
    }
  },
  {
    country: 'ca',
    categoryCodes: {
      'all departments': 'aps',
      'alexa skills': 'alexa-skills',
      'amazon devices': 'amazon-devices',
      'amazon warehouse deals': 'warehouse-deals',
      'apps & games': 'mobile-apps',
      automotive: 'automotive',
      baby: 'baby',
      beauty: 'beauty',
      books: 'stripbooks',
      'clothing & accessories': 'apparel',
      electronics: 'electronics',
      'gift cards': 'gift-cards',
      grocery: 'grocery',
      handmade: 'handmade',
      'health & personal care': 'hpc',
      'home & kitchen': 'kitchen',
      'industrial & scientific': 'industrial',
      jewelry: 'jewelry',
      'kindle store': 'digital-text',
      'livres en français': 'french-books',
      'luggage & bags': 'luggage',
      'luxury beauty': 'luxury-beauty',
      'movies & tv': 'dvd',
      music: 'popular',
      'musical instruments, stage & studio': 'mi',
      'office products': 'office-products',
      'patio, lawn & garden': 'lawngarden',
      'pet supplies': 'pets',
      'shoes & handbags': 'shoes',
      software: 'software',
      'sports & outdoors': 'sporting',
      'tools & home improvement': 'tools',
      'toys & games': 'toys',
      'video games': 'videogames',
      watches: 'watches'
    }
  },
  {
    country: 'uk',
    categoryCodes: {
      'all departments': 'aps',
      'alexa skills': 'alexa-skills',
      'amazon devices': 'amazon-devices',
      'amazon fresh': 'amazonfresh',
      'amazon global store': 'amazon-global-store',
      'amazon pantry': 'pantry',
      'amazon warehouse': 'warehouse-deals',
      'apps & games': 'mobile-apps',
      baby: 'baby',
      beauty: 'beauty',
      books: 'stripbooks',
      'car & motorbike': 'automotive',
      'cds & vinyl': 'popular',
      'classical music': 'classical',
      clothing: 'clothing',
      'computers & accessories': 'computers',
      'digital music ': 'digital-music',
      'diy & tools': 'diy',
      'dvd & blu-ray': 'dvd',
      'electronics & photo': 'electronics',
      fashion: 'fashion',
      'garden & outdoors': 'outdoor',
      'gift cards': 'gift-cards',
      grocery: 'grocery',
      handmade: 'handmade',
      'health & personal care': 'drugstore',
      'home & business services': 'local-services',
      'home & kitchen': 'kitchen',
      'industrial & scientific': 'industrial',
      jewellery: 'jewelry',
      'kindle store': 'digital-text',
      'large appliances': 'appliances',
      lighting: 'lighting',
      luggage: 'luggage',
      'luxury beauty': 'luxury-beauty',
      'musical instruments & dj': 'mi',
      'pc & video games': 'videogames',
      'pet supplies': 'pets',
      'prime video': 'instant-video',
      'shoes & bags': 'shoes',
      software: 'software',
      'sports & outdoors': 'sports',
      'stationery & office supplies': 'office-products',
      'toys & games': 'toys',
      vhs: 'vhs',
      watches: 'watches'
    }
  },
  {
    country: 'fr',
    categoryCodes: {
      'toutes nos catégories': 'aps',
      'alexa skills': 'alexa-skills',
      'amazon offres reconditionnées': 'warehouse-deals',
      'amazon pantry': 'pantry',
      animalerie: 'pets',
      'appareils amazon': 'amazon-devices',
      'applis & jeux': 'mobile-apps',
      'auto et moto': 'automotive',
      bagages: 'luggage',
      'beauté et parfum': 'beauty',
      'beauté prestige': 'luxury-beauty',
      bijoux: 'jewelry',
      'boutique chèques-cadeaux': 'gift-cards',
      'boutique kindle': 'digital-text',
      bricolage: 'diy',
      'bébés & puériculture': 'baby',
      'chaussures et sacs': 'shoes',
      'cuisine & maison': 'kitchen',
      'dvd & blu-ray': 'dvd',
      epicerie: 'grocery',
      'fournitures de bureau': 'office-products',
      'gros électroménager': 'appliances',
      handmade: 'handmade',
      'high-tech': 'electronics',
      'hygiène et santé': 'hpc',
      informatique: 'computers',
      'instruments de musique & sono': 'mi',
      jardin: 'garden',
      'jeux et jouets': 'toys',
      'jeux vidéo': 'videogames',
      'livres anglais et étrangers': 'english-books',
      'livres en français': 'stripbooks',
      logiciels: 'software',
      'luminaires et eclairage': 'lighting',
      mode: 'fashion',
      montres: 'watches',
      'musique : cd & vinyles': 'popular',
      'musique classique': 'classical',
      'secteur industriel & scientifique': 'industrial',
      'sports et loisirs': 'sports',
      'téléchargement de musique': 'digital-music',
      'vêtements et accessoires': 'clothing'
    }
  },
  {
    country: 'de',
    categoryCodes: {
      'alle kategorien': 'aps',
      'alexa skills': 'alexa-skills',
      'amazon fresh': 'amazonfresh',
      'amazon geräte': 'amazon-devices',
      'amazon global store': 'amazon-global-store',
      'amazon pantry': 'pantry',
      'amazon warehouse': 'warehouse-deals',
      'apps & spiele': 'mobile-apps',
      'audible hörbücher': 'audible',
      'auto & motorrad': 'automotive',
      baby: 'baby',
      baumarkt: 'diy',
      beauty: 'beauty',
      bekleidung: 'clothing',
      beleuchtung: 'lighting',
      bücher: 'stripbooks',
      'bücher (fremdsprachig)': 'english-books',
      'bürobedarf & schreibwaren': 'office-products',
      'computer & zubehör': 'computers',
      'drogerie & körperpflege': 'drugstore',
      'dvd & blu-ray': 'dvd',
      'elektro-großgeräte': 'appliances',
      'elektronik & foto': 'electronics',
      fashion: 'fashion',
      games: 'videogames',
      garten: 'outdoor',
      geschenkgutscheine: 'gift-cards',
      'gewerbe, industrie & wissenschaft': 'industrial',
      handmade: 'handmade',
      haustier: 'pets',
      'kamera & foto': 'photo',
      'kindle-shop': 'digital-text',
      klassik: 'classical',
      'koffer, rucksäcke & taschen ': 'luggage',
      'küche, haushalt & wohnen': 'kitchen',
      'lebensmittel & getränke': 'grocery',
      'luxury beauty': 'luxury-beauty',
      'musik-cds & vinyl': 'popular',
      'musik-downloads': 'digital-music',
      'musikinstrumente & dj-equipment': 'mi',
      'prime video': 'instant-video',
      schmuck: 'jewelry',
      'schuhe & handtaschen': 'shoes',
      software: 'software',
      spielzeug: 'toys',
      'sport & freizeit': 'sports',
      uhren: 'watches',
      zeitschriften: 'magazines'
    }
  },
  {
    country: 'es',
    categoryCodes: {
      'todos los departamentos': 'aps',
      'alexa skills': 'alexa-skills',
      'alimentación y bebidas': 'grocery',
      'amazon pantry': 'pantry',
      'appstore para android': 'mobile-apps',
      bebé: 'baby',
      belleza: 'beauty',
      'bricolaje y herramientas': 'diy',
      'cheques regalo': 'gift-cards',
      'coche - renting': 'vehicles',
      'coche y moto - piezas y accesorios': 'automotive',
      'deportes y aire libre': 'sporting',
      'dispositivos de amazon': 'amazon-devices',
      electrónica: 'electronics',
      equipaje: 'luggage',
      'grandes electrodomésticos': 'appliances',
      handmade: 'handmade',
      'hogar y cocina': 'kitchen',
      iluminación: 'lighting',
      'industria y ciencia': 'industrial',
      informática: 'computers',
      'instrumentos musicales': 'mi',
      jardín: 'lawngarden',
      joyería: 'jewelry',
      'juguetes y juegos': 'toys',
      libros: 'stripbooks',
      moda: 'fashion',
      'música digital': 'digital-music',
      'música: cds y vinilos': 'popular',
      'oficina y papelería': 'office-products',
      'películas y tv': 'dvd',
      'productos para mascotas': 'pets',
      'productos reacondicionados': 'warehouse-deals',
      relojes: 'watches',
      'ropa y accesorios': 'apparel',
      'salud y cuidado personal': 'hpc',
      software: 'software',
      'tienda kindle': 'digital-text',
      videojuegos: 'videogames',
      'zapatos y complementos': 'shoes'
    }
  },
  {
    country: 'it',
    categoryCodes: {
      'tutte le categorie': 'aps',
      abbigliamento: 'apparel',
      'alexa skill': 'alexa-skills',
      'alimentari e cura della casa': 'grocery',
      'amazon pantry': 'pantry',
      'amazon warehouse': 'warehouse-deals',
      'app e giochi': 'mobile-apps',
      'auto e moto': 'automotive',
      bellezza: 'beauty',
      'buoni regalo': 'gift-cards',
      'cancelleria e prodotti per ufficio': 'office-products',
      'casa e cucina': 'kitchen',
      'cd e vinili ': 'popular',
      'dispositivi amazon': 'amazon-devices',
      elettronica: 'electronics',
      'fai da te': 'diy',
      'film e tv': 'dvd',
      'giardino e giardinaggio': 'garden',
      'giochi e giocattoli': 'toys',
      gioielli: 'jewelry',
      'grandi elettrodomestici': 'appliances',
      handmade: 'handmade',
      illuminazione: 'lighting',
      'industria e scienza': 'industrial',
      informatica: 'computers',
      'kindle store': 'digital-text',
      libri: 'stripbooks',
      moda: 'fashion',
      'musica digitale': 'digital-music',
      orologi: 'watches',
      'prima infanzia': 'baby',
      'prodotti per animali domestici': 'pets',
      'salute e cura della persona': 'hpc',
      'scarpe e borse': 'shoes',
      software: 'software',
      'sport e tempo libero': 'sporting',
      'strumenti musicali e dj': 'mi',
      valigeria: 'luggage',
      videogiochi: 'videogames'
    }
  },
  {
    country: 'mx',
    categoryCodes: {
      'todos los departamentos': 'aps',
      auto: 'automotive',
      bebé: 'baby',
      'dispositivos de amazon': 'amazon-devices',
      electrónicos: 'electronics',
      'películas y series de tv': 'dvd',
      'tienda kindle': 'digital-text',
      'ropa, zapatos y accesorios': 'fashion',
      '   mujeres': 'fashion-womens',
      '   hombres': 'fashion-mens',
      '   niñas': 'fashion-girls',
      '   niños': 'fashion-boys',
      '   bebé': 'fashion-baby',
      'alexa skills': 'alexa-skills',
      'alimentos y bebidas': 'grocery',
      'deportes y aire libre': 'sporting',
      'herramientas y mejoras del hogar': 'hi',
      'hogar y cocina': 'kitchen',
      'industria y ciencia': 'industrial',
      'instrumentos musicales': 'mi',
      'juegos y juguetes': 'toys',
      libros: 'stripbooks',
      mascotas: 'pets',
      música: 'popular',
      'oficina y papelería': 'office-products',
      'productos handmade': 'handmade',
      'salud, belleza y cuidado personal': 'hpc',
      software: 'software',
      videojuegos: 'videogames'
    }
  },
  {
    country: 'in',
    categoryCodes: {
      'all categories': 'aps',
      'alexa skills': 'alexa-skills',
      'amazon devices': 'amazon-devices',
      'amazon fashion': 'fashion',
      'amazon fresh': 'nowstore',
      'amazon global store': 'amazon-global-store',
      'amazon pantry': 'pantry',
      appliances: 'appliances',
      'apps & games': 'mobile-apps',
      baby: 'baby',
      beauty: 'beauty',
      books: 'stripbooks',
      'car & motorbike': 'automotive',
      'clothing & accessories': 'apparel',
      collectibles: 'collectibles',
      'computers & accessories': 'computers',
      electronics: 'electronics',
      furniture: 'furniture',
      'garden & outdoors': 'lawngarden',
      'gift cards': 'gift-cards',
      'grocery & gourmet foods': 'grocery',
      'health & personal care': 'hpc',
      'home & kitchen': 'kitchen',
      'industrial & scientific': 'industrial',
      jewellery: 'jewelry',
      'kindle store': 'digital-text',
      'luggage & bags': 'luggage',
      'luxury beauty': 'luxury-beauty',
      'movies & tv shows': 'dvd',
      music: 'popular',
      'musical instruments': 'mi',
      'office products': 'office-products',
      'pet supplies': 'pets',
      'prime video': 'instant-video',
      'shoes & handbags': 'shoes',
      software: 'software',
      'sports, fitness & outdoors': 'sporting',
      'tools & home improvement': 'home-improvement',
      'toys & games': 'toys',
      'video games': 'videogames',
      watches: 'watches'
    }
  },
  {
    country: 'jp',
    categoryCodes: {
      すべてのカテゴリー: 'aps',
      'amazon デバイス': 'amazon-devices',
      'kindleストア ': 'digital-text',
      'prime video': 'instant-video',
      alexaスキル: 'alexa-skills',
      デジタルミュージック: 'digital-music',
      'android アプリ': 'mobile-apps',
      本: 'stripbooks',
      洋書: 'english-books',
      ミュージック: 'popular',
      クラシック: 'classical',
      dvd: 'dvd',
      tvゲーム: 'videogames',
      pcソフト: 'software',
      'パソコン・周辺機器': 'computers',
      '家電&カメラ': 'electronics',
      '文房具・オフィス用品': 'office-products',
      'ホーム&キッチン': 'kitchen',
      ペット用品: 'pets',
      ドラッグストア: 'hpc',
      ビューティー: 'beauty',
      ラグジュアリービューティー: 'luxury-beauty',
      '食品・飲料・お酒': 'food-beverage',
      'ベビー&マタニティ': 'baby',
      ファッション: 'fashion',
      レディース: 'fashion-womens',
      メンズ: 'fashion-mens',
      'キッズ＆ベビー': 'fashion-baby-kids',
      '服＆ファッション小物': 'apparel',
      'シューズ＆バッグ': 'shoes',
      腕時計: 'watch',
      ジュエリー: 'jewelry',
      おもちゃ: 'toys',
      ホビー: 'hobby',
      楽器: 'mi',
      'スポーツ&アウトドア': 'sporting',
      '車＆バイク': 'automotive',
      'diy・工具・ガーデン': 'diy',
      大型家電: 'appliances',
      クレジットカード: 'financial',
      ギフト券: 'gift-cards',
      '産業・研究開発用品': 'industrial',
      amazonパントリー: 'pantry',
      amazonアウトレット: 'warehouse-deals',
      'ホーム＆キッチン': 'kitchen',
      'ベビー＆マタニティ': 'baby',
      'スポーツ＆アウトドア': 'sporting'
    }
  }
]

var Parser = function(data, moment) {
  //----------------------------------------------------//
  //Product Title
  var getProductTitle = function() {
    var productTitle =
      $(data, 'body')
        .find('#productTitle')
        .text() ||
      $(data, 'body')
        .find('#btAsinTitle')
        .text() ||
      $(data, 'body')
        .find('#aiv-content-title')
        .text() ||
      $(data, 'body')
        .find('#title_feature_div')
        .text() ||
      $(data, 'body')
        .find('.AAG_ProductTitle a')
        .attr('title') ||
      $(data, 'body')
        .find('#item_name')
        .text() ||
      $(data, 'body')
        .find('#ebooksProductTitle')
        .text() ||
      $(data, 'body')
        .find('#mediaProductTitle')
        .text() ||
      $(data, 'body')
        .find('#dmusicProductTitle_feature_div')
        .text()

    if (productTitle) {
      productTitle = productTitle.trim()
      productTitle = productTitle.length == 0 ? 'N.A.' : productTitle
    } else {
      productTitle = 'N.A.'
    }
    return productTitle
  }
  //----------------------------------------------------//
  //Brand
  var getBrand = function(passingData) {
    var brand = null
    if (
      passingData &&
      typeof passingData != 'undefined' &&
      typeof passingData.brand != 'undefined' &&
      passingData.brand != null
    ) {
      brand = passingData.brand
    } else {
      let linkToken
      brand =
        $(data, 'body')
          .find(
            '#brandBylineWrapper a#brand, #bylineInfo_feature_div a#brand, #brandByline a#brand, #brandByline_feature_div a#brand'
          )
          .text()
          .trim()
          .match(plainBrandRegex) ||
        $(data, 'body')
          .find('a#bylineInfo')
          .text()
          .match(brandRegexLineInfo) ||
        $(data, 'body')
          .find('#product-title_feature_div')
          .text()
          .match(brandRegex) ||
        $(data, 'body')
          .find('.parseasinTitle')
          .siblings('span')
          .last()
          .text()
          .match(brandRegex) ||
        $(data, 'body')
          .find('#olpProductByline')
          .text()
          .match(brandRegex) ||
        $(data, 'body')
          .find('#brandByline_feature_div')
          .text()
          .match(brandRegex) ||
        $(data, 'body')
          .find('#brandBylineWrapper')
          .text()
          .match(brandRegex) ||
        $(data, 'body')
          .find('#mocaBBSoldByAndShipsFrom a')
          .text() ||
        $(data, 'body')
          .find(
            '#bylineInfo span.author a.contributorNameID, #byline span.author a.contributorNameID'
          )
          .text() ||
        $(data, 'body')
          .find('#byline span.author a')
          .filter(':first')
          .text() ||
        $(data, 'body')
          .find('#ProductInfoArtistLink')
          .text() ||
        ((linkToken = $(data, 'body')
          .find('#brandByline_feature_div a, #bylineInfo_feature_div a')
          .attr('href')),
        linkToken ? decodeURIComponent(linkToken.split('bin=')[1]).replace('/+/g', ' ') : null)
    }

    var brandValue = 'N.A.'

    if (brand) {
      var parsedBrand = (typeof brand == 'object' ? brand[0] : brand)
        .replace(/^(by|from|Visit the|Brand:|Marke:|Besuchen Sie den)\s?/, '')
        .replace(/(-Store|Store)$/, '')
        .trim()
      if (parsedBrand.length !== 0) {
        brandValue = parsedBrand
      }
    }
    return brandValue
  }
  //----------------------------------------------------//
  //BB seller
  var getBbSeller = function() {
    let theCurrentMBC
    var merchantInfo =
      $(data, 'body')
        .find('#tabular-buybox')
        .text()
        .trim() ||
      $(data, 'body')
        .find('#merchant-info')
        .text()
        .trim() ||
      $(data, 'body')
        .find('#mocaBBSoldByAndShipsFrom')
        .text()
        .trim() ||
      $(data, 'body')
        .find('table .buying')
        .text()
        .trim() ||
      $(data, 'body')
        .find('#buybox_feature_div a#SSOFpopoverLink')
        .text()
        .trim() ||
      $(data, 'body')
        .find('#buybox_feature_div p')
        .text()
        .trim() ||
      $(data, 'body')
        .find('#usedbuyBox')
        .text()
        .trim() ||
      $(data, 'body')
        .find('#buybox-tabular')
        .text()
        .trim() ||
      ((theCurrentMBC = $(data, 'body').find('#moreBuyingChoices_feature_div .mbc-offer-row')),
      theCurrentMBC.length == 1 ? theCurrentMBC.text().trim() : '') ||
      $(data, 'body')
        .find('#freshShipsFromSoldBy_feature_div')
        .text()
        .trim()

    var amzRegex = /((ships|dispatched)\s+from(\s|\S)+sold\s+by\s+Amazon)|(sold\s+by:*\s+Amazon)|(Expédié\s+et\s+vendu\s+par\s+Amazon)|(Verkauf\s+und\s+Versand\s+durch\s+Amazon)|(Vendido\s+y\s+enviado\s+por\s+Amazon)|(Venduto\s+e\s+spedito\s+da\s+Amazon)|(Amazon.co.jp\s+が販売、発送します。)|(Amazon.co.jp がフラストレーション・フリー・パッケージで販売、発送します)|(Envío\s+desde\s+Amazon\s+México)|(販売元\s+Amazon.co.jp)/i
    var amz = amzRegex.test(merchantInfo)

    var fbaRegex = /(fulfilled|ships\s+by|from\s+Amazon)|(sold\s+by:)|(expédié\s+par\s+amazon)|(Versand\s+durch\s+Amazon)|(enviado\s+por\s+Amazon)|(gestionado\s+por\s+Amazon)|(spedito\s+da\s+Amazon)|(が販売し、Amazon.co.jp)|(Envío\s+desde\s+Amazon)|(出荷元\s+Amazon)/i
    var fba = fbaRegex.test(merchantInfo)

    var merchRegex = /((ships|dispatched)\s+from\s+and\s+sold\s+by)|(Sold\s+by)|(Expédié\s+et\s+vendu\s+par)|(Verkauf\s+und\s+Versand\s+durch)|(Vendido\s+y\s+enviado\s+por)|(Venduto\s+e\s+spedito\s+da)|(^((?!Amazon.co.jp).)*?\s+が販売、発送します。)|(Envío\s+desde)|(出荷元)/i
    var merch = merchRegex.test(merchantInfo)

    var bbSeller = 'N.A.'

    if (amz) {
      bbSeller = 'AMZ'
    } else if (fba) {
      bbSeller = 'FBA'
    } else if (merch) {
      bbSeller = 'FBM'
    }
    return bbSeller
  }
  //----------------------------------------------------//
  //Get Price
  var getPrice = function(passingData) {
    var price =
      $(data, 'body')
        .find('#actualPriceValue')
        .text() ||
      $(data, 'body')
        .find('#priceblock_ourprice')
        .text() ||
      $(data, 'body')
        .find('#priceblock_saleprice')
        .text() ||
      $(data, 'body')
        .find('#priceblock_dealprice')
        .text() ||
      $(data, 'body')
        .find('#priceBlock .priceLarge')
        .text() ||
      $(data, 'body')
        .find('#buyNewSection .a-color-price.offer-price')
        .text() ||
      $(data, 'body')
        .find('#prerderDelaySection .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#mocaSubtotal .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#mediaTab_content_landing .a-color-price.header-price')
        .text() ||
      $(data, 'body')
        .find('#unqualifiedBuyBox .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#mediaTab_content_landing .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#wineTotalPrice')
        .text() ||
      $(data, 'body')
        .find('#buybox_feature_div .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#moreBuyingChoices_feature_div .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#olp_feature_div a')
        .filter(':first')
        .text() ||
      $(data, 'body')
        .find('#usedBuySection .a-color-price')
        .text() ||
      $(data, 'body')
        .find('#tmmSwatches .a-color-price')
        .text()
    price = price.match(priceRegex) ? price.match(priceRegex)[0] : null

    if (price) {
      //Take it just a number > //Remove all spaces between numbers > //remove any thousand separator > //Because of Germany and French stores
      price = price
        .replace(currencyRegex, '')
        .replace(/(\s|&nbsp;)/g, '')
        .replace(thousandSeparatorRegex, '$1')
        .replace(',', '.')
    } else {
      //Try to see if it's separated price
      price = $(data, 'body')
        .find(
          '#newPrice #priceblock_ourprice .buyingPrice, #newPrice #priceblock_ourprice .priceToPayPadding, #usedPrice #priceblock_usedprice .buyingPrice, #usedPrice #priceblock_usedprice .priceToPayPadding'
        )
        .map(function() {
          return $(this).text()
        })
        .get()
        .join('.')
        .replace(/^[.]+/, '')
      price = !price ? 'N.A.' : parseFloat(price).toFixed(2)
    }

    if (
      price == 'N.A.' &&
      typeof passingData != 'undefined' &&
      typeof passingData.price != 'undefined'
    ) {
      price = passingData.price
    }

    return price
  }
  //----------------------------------------------------//
  //Check if this product has prime delivery
  var isPrime = function(passingData) {
    if (
      typeof passingData != 'undefined' &&
      passingData.isPrime != 'undefined' &&
      passingData.isPrime
    )
      return true
    return $(data, 'body').find('#ourprice_shippingmessage i.a-icon-prime').length > 0
      ? true
      : false
  }
  //----------------------------------------------------//
  //Get Product Image
  var getProductImage = function(url = null) {
    var productImage = $(data, 'body')
      .find('#landingImage, #imgBlkFront')
      .attr('data-a-dynamic-image')
    if (productImage) {
      productImage = JSON.parse(productImage)
      productImage = Object.keys(productImage)[0] ? Object.keys(productImage)[0].trim() : null
    } else {
      //Check main image src
      const productImages = $(data, 'body').find(
        '#main-image, #ebooks-img-canvas img, #coverArt_feature_div img, #masrw-image-block img'
      )
      productImage = productImages.attr('data-src') || productImages.attr('src')
      if (!productImage) {
        productImage = null
      }
    }

    if (/^https?:\/\//.test(productImage) || url === null) {
      return productImage
    } else {
      return new URL(productImage, url).href
    }
  }
  //----------------------------------------------------//
  //Get category code
  const cleanCategoryCode = text => {
    const splitText = text.split('=')
    if (splitText.length !== 2) return
    return splitText[1].trim().replace('-intl-ship', '')
  }
  const getCategoryCodeMap = () => {
    let select_option_values = {}

    $(data, 'body')
      .find('#searchDropdownBox option')
      .each(function() {
        // Add $(this).val() to your list
        select_option_values[
          $(this)
            .text()
            .toLowerCase()
        ] = cleanCategoryCode($(this).val())
      })
    return select_option_values
  }

  const getSelectedCategoryCode = () => {
    let rawSelectedCategoryCode = $(data, 'body')
      .find('#searchDropdownBox option:selected')
      .val()
    if (!rawSelectedCategoryCode) return
    return cleanCategoryCode(rawSelectedCategoryCode)
  }

  //Get rank & category
  const fetchRawRankAndCategory = matchString => {
    const apr2019BestsellersRankMatcher = $(data, 'body')
      .find("#prodDetails .section div:contains('" + $.escapeSelector(matchString) + "')")
      .text()

    var rankAndCategory =
      $(data, 'body')
        .find('#SalesRank')
        .clone()
        .find('ul,style,li')
        .remove()
        .end()
        .text() ||
      $(data, 'body')
        .find("#prodDetails th:contains('" + $.escapeSelector(matchString) + "')")
        .next()
        .find('br~span')
        .remove()
        .end()
        .text() ||
      $(data, 'body')
        .find("#prodDetails th:contains('" + $.escapeSelector(matchString) + "')")
        .next()
        .text() ||
      apr2019BestsellersRankMatcher ||
      $(data, 'body')
        .find("#detailBullets_feature_div span:contains('" + $.escapeSelector(matchString) + "')")
        .text() ||
      $(data, 'body')
        .find(
          "#detailBulletsWrapper_feature_div span:contains('" + $.escapeSelector(matchString) + "')"
        )
        .text()

    return { rankAndCategory, matchString }
  }

  var getRankAndCategory = function(country) {
    let rankAndCategory
    let bestSellerRankText
    let bestSellerRankMatch

    const categoryCodeMap = getCategoryCodeMap('searchDropdownBox')

    bestSellerRankMatch = ['Amazon Bestsellers Rank', 'Best Sellers Rank', 'Best-sellers rank']
    const bestSellerRankTextDe = 'Amazon Bestseller-Rang'
    const bestSellerRankTextFr = "Classement des meilleures ventes d'Amazon"
    const bestSellerRankTextMx = 'Clasificación en los más vendidos de Amazon'
    const bestSellerRankTextEs = 'Clasificación en los más vendidos de Amazon'
    const bestSellerRankTextIt = 'Posizione nella classifica Bestseller di Amazon'
    const bestSellerRankTextJp = 'Amazon 売れ筋ランキング'

    if (country == 'mx') {
      bestSellerRankMatch = bestSellerRankTextMx
    } else if (country == 'de') {
      bestSellerRankMatch = bestSellerRankTextDe
    } else if (country == 'fr') {
      bestSellerRankMatch = bestSellerRankTextFr
    } else if (country == 'es') {
      bestSellerRankMatch = bestSellerRankTextEs
    } else if (country == 'it') {
      bestSellerRankMatch = bestSellerRankTextIt
    } else if (country == 'jp') {
      bestSellerRankMatch = bestSellerRankTextJp
    }
    // based on bestSellerRankMatch type (array or string) - search for matching string until found
    if (Array.isArray(bestSellerRankMatch)) {
      for (let i = 0; i <= bestSellerRankMatch.length && !rankAndCategory; i++) {
        const rawRankAndCategory = fetchRawRankAndCategory(bestSellerRankMatch[i])
        rankAndCategory = rawRankAndCategory.rankAndCategory
        bestSellerRankText = rawRankAndCategory.matchString
      }
    } else {
      const rawRankAndCategory = fetchRawRankAndCategory(bestSellerRankMatch)
      rankAndCategory = rawRankAndCategory.rankAndCategory
      bestSellerRankText = rawRankAndCategory.matchString
    }

    const blankValue = 'N.A.'
    var category = blankValue
    var rank = blankValue
    var categoryCode = blankValue

    if (rankAndCategory) {
      rankAndCategory = rankAndCategory
        .trim()
        .replace(bestSellerRankText, '')
        .trim()
      //Get the category and rank
      let parsedCategory, parsedRank
      switch (country) {
        case 'jp':
          parsedRank = rankAndCategory.match(/\-\s\d{1,3}(\,\d{3})*位/gi)
          parsedCategory = rankAndCategory.match(/位.+?\s/gi)
          if (parsedCategory && parsedCategory[0] && parsedCategory[0].indexOf('>') == -1) {
            category = parsedCategory[0].replace(/^位/, '').trim()
          }
          if (parsedRank && parsedRank[0] && $.inArray('>', parsedRank) == -1) {
            rank = parsedRank[0]
              .replace(/(位)|(\,)/gi, '')
              .replace(/^\s*\-\s*/gi, '')
              .trim()
          }
          break
        default:
          parsedRank = rankAndCategory.match(/((\#)|(Nr.\s)|(nº)|(n.\s?))?[0-9,.]+|(\>)/gi)
          parsedCategory = rankAndCategory.match(
            /(in\s|en\s)[\s\u00BF-\u1FFF\u2C00-\uD7FF\w\&\,\-]+[\(\>]?/gi
          )
          if (parsedCategory && parsedCategory[0] && parsedCategory[0].indexOf('>') == -1) {
            category = parsedCategory[0].replace(/^(in|en)|(\()/g, '').trim()
          }
          if (parsedRank && parsedRank[0] && $.inArray('>', parsedRank) == -1) {
            rank = parsedRank[0].replace(/(\#)|(Nr.)|(\,)|(\.)|(nº)|(n.)/gi, '').trim()
          }
      }

      // Try to grab the category code from the category name of the product.
      // If there isn't a match, try to grab the category code from the search
      // dropdown
      if (categoryCodeMap.hasOwnProperty(category.toLowerCase())) {
        categoryCode = categoryCodeMap[category.toLowerCase()]
      } else if (category !== blankValue) {
        const selectedCategoryCode = getSelectedCategoryCode()
        // If the category code is APS, we can't be sure what the correct category code is,
        // because the dropdown doesn't seem to work properly if you are looking at a store outside
        // of the country of your current internet connection. In this case we check our map of existing
        // categories and see if we can find the category code that way.
        if (selectedCategoryCode === 'aps') {
          for (let categoryCodesForCountry of CATEGORY_CODES_BY_COUNTRY) {
            if (categoryCodesForCountry.categoryCodes.hasOwnProperty(category.toLowerCase())) {
              categoryCode = categoryCodesForCountry.categoryCodes[category.toLowerCase()]
              break
            }
          }
        } else {
          categoryCode = selectedCategoryCode
        }
      }
    }

    return {
      category: category,
      categoryCode: categoryCode,
      rank: rank
    }
  }
  //----------------------------------------------------//
  //Get rating
  var getRating = function(language) {
    var rating =
      $(data, 'body')
        .find('#averageCustomerReviews #acrPopover')
        .attr('title') ||
      $(data, 'body')
        .find('#averageCustomerReviews .a-icon-star')
        .attr('class') ||
      $(data, 'body')
        .find('span.asinReviewsSummary .swSprite')
        .attr('class') ||
      $(data, 'body')
        .find('#reviewStars')
        .attr('class')
    if (rating) {
      rating = rating.match(/([0-9][\.|\,]?[0-9]?)/gi)
      if (rating && rating.length > 0) {
        if (language === 'ja-jp') {
          rating = rating[1].replace(',', '.')
        } else {
          rating = rating[0].replace(',', '.')
        }
      } else {
        rating = 'N.A.'
      }
    } else {
      rating = 'N.A.'
    }
    return rating
  }
  //----------------------------------------------------//
  //Get reviews
  var getReviews = function() {
    var reviews =
      $(data, 'body')
        .find('#acrCustomerWriteReviewLink')
        .filter(':first')
        .text() ||
      $(data, 'body')
        .find('#acrCustomerReviewText')
        .filter(':first')
        .text() ||
      $(data, 'body')
        .find('#reviewLink')
        .filter(':first')
        .text() ||
      $(data, 'body')
        .find('span.asinReviewsSummary')
        .filter(':first')
        .next()
        .text()

    if (reviews) {
      reviews = reviews.match(/[0-9.\s,]+/)
      reviews = reviews && reviews.length > 0 ? reviews[0] : '0'
    }

    reviews = reviews ? reviews.replace(/[\,\.\s]/, '') : '0' //Because of Germany and French stores
    reviews = reviews.trim()
    reviews = reviews === '' ? '0' : reviews

    return reviews
  }

  var getData = function() {
    return data
  }
  //----------------------------------------------------//
  //Return
  return {
    getProductTitle,
    getBrand,
    getBbSeller,
    getPrice,
    isPrime,
    getProductImage,
    getRankAndCategory,
    getRating,
    getReviews,
    getData
  }
}

// for unit testing purpose
if (typeof exports != 'undefined') {
  exports.Parser = Parser
}
