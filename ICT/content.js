/*
 * Soil Explorer: the teaching content. Every piece of text is an
 * [English, Hindi] pair, read on screen with SE.L(pair).
 *
 * Soil facts follow the NCERT geography and science textbooks. Which soils
 * are listed for which state follows NCERT and the ICAR-NBSS&LUP summary
 * "Soils of India" (Bhattacharyya and others, Current Science, 2013).
 *
 * For each region:
 *   major  soils that cover wide areas there
 *   also   soils found in some parts
 * This is a deliberate simplification for Class 6. Soils do not stop at state
 * borders, and the app says so wherever the map is shown.
 *
 * Nothing here touches the page, so the file also runs under Node.
 */
(function () {
  'use strict';

  var SE = (window.SE = window.SE || {});
  var D = (SE.data = {});

  // ------------------------------------------------------------------
  // The six soil groups
  //   spots   dots on the 3D sample: at ['top', u, v] or ['front', s, depth]
  //   layers  numbered markers down the cut face (t = depth, 0 top to 1 bottom)
  // ------------------------------------------------------------------
  D.soils = [
    {
      id: 'alluvial',
      hex: '#a8906a',
      name: ['Alluvial Soil', 'जलोढ़ मिट्टी'],
      short: ['Alluvial', 'जलोढ़'],
      tag: ['Gift of the rivers', 'नदियों का उपहार'],
      formed: ['Rivers carry sand, silt and clay down from the mountains and spread them over the plains.', 'नदियाँ पहाड़ों से रेत, गाद और चिकनी मिट्टी बहाकर लाती हैं और मैदानों में बिछा देती हैं।'],
      texture: ['A mix of sand, silt and clay. The mix changes from place to place.', 'रेत, गाद और चिकनी मिट्टी का मेल। यह मेल जगह-जगह बदलता है।'],
      water: ['Holds water fairly well and still lets extra water drain.', 'पानी अच्छी तरह रोकती है और फालतू पानी निकल भी जाने देती है।'],
      crops: ['Rice, wheat, sugarcane, pulses', 'धान, गेहूँ, गन्ना, दालें'],
      where: ['The northern plains of the Indus, Ganga and Brahmaputra, and the river deltas of the east coast.', 'सिंधु, गंगा और ब्रह्मपुत्र के उत्तरी मैदान, और पूर्वी तट के नदी-डेल्टा।'],
      clues: [
        ['Light grey-brown colour', 'हल्का धूसर-भूरा रंग'],
        ['Fine and smooth, in thin layers', 'महीन और चिकनी, पतली परतों में'],
        ['Collected beside a big river', 'एक बड़ी नदी के किनारे से ली गई']
      ],
      hint: ['Look at the thin flat layers. Which soil is laid down by moving water?', 'पतली, सपाट परतें देखो। कौन-सी मिट्टी बहते पानी से बिछती है?'],
      confuse: ['arid', 'red'],
      spots: [
        { id: 'sand', at: ['top', 0.3, 0.32], name: ['Sand', 'रेत'], text: ['The largest grains. They feel gritty and let water pass.', 'सबसे बड़े दाने। ये खुरदरे लगते हैं और पानी निकल जाने देते हैं।'] },
        { id: 'silt', at: ['top', 0.68, 0.55], name: ['Silt', 'गाद'], text: ['Medium-sized particles. Dry silt feels smooth, like flour.', 'मध्यम आकार के कण। सूखी गाद आटे जैसी चिकनी लगती है।'] },
        { id: 'clay', at: ['front', 0.3, 0.2], name: ['Clay', 'चिकनी मिट्टी'], text: ['The tiniest particles. They hold water and feel sticky when wet.', 'सबसे नन्हे कण। ये पानी रोकते हैं और गीले होने पर चिपचिपे लगते हैं।'] }
      ],
      layers: [
        { t: 0.12, name: ['Newest layer', 'सबसे नई परत'], text: ['Fine silt and clay left by the latest floods.', 'हाल की बाढ़ों की छोड़ी महीन गाद और चिकनी मिट्टी।'] },
        { t: 0.46, name: ['Sandy band', 'रेतीली पट्टी'], text: ['An older flood flowed faster and left coarser sand.', 'किसी पुरानी बाढ़ का बहाव तेज़ था, जो मोटी रेत छोड़ गया।'] },
        { t: 0.82, name: ['Older alluvium', 'पुराना जलोढ़'], text: ['Deeper, older deposits, often with small lumps of lime.', 'गहरे, पुराने निक्षेप, जिनमें अक्सर चूने की छोटी गाँठें होती हैं।'] }
      ],
      micro: ['Sand, silt and clay particles, all mixed together.', 'रेत, गाद और चिकनी मिट्टी के कण, सब आपस में मिले हुए।'],
      note: ['New alluvium beside a river is called khadar. Older alluvium farther away is called bangar.', 'नदी के पास का नया जलोढ़ खादर कहलाता है। दूर का पुराना जलोढ़ बांगर कहलाता है।'],
      tip: ['Alluvial soil follows the big rivers: the plains of the Indus, Ganga and Brahmaputra, and the deltas of the east coast.', 'जलोढ़ मिट्टी बड़ी नदियों के साथ चलती है: सिंधु, गंगा और ब्रह्मपुत्र के मैदान तथा पूर्वी तट के डेल्टा।'],
      keys: [
        ['Laid down by rivers', 'नदियों द्वारा बिछाई गई'],
        ['A mix of sand, silt and clay', 'रेत, गाद और चिकनी मिट्टी का मेल'],
        ['Rice, wheat and sugarcane', 'धान, गेहूँ और गन्ना']
      ],
      match: ['Laid down by rivers', 'नदियों द्वारा बिछाई गई'],
      matchWhy: ['Rivers drop the sand, silt and clay they carry. Layer by layer, this builds alluvial plains.', 'नदियाँ अपने साथ लाई रेत, गाद और चिकनी मिट्टी छोड़ती जाती हैं। परत-दर-परत इससे जलोढ़ मैदान बनते हैं।']
    },
    {
      id: 'black',
      hex: '#34302d',
      name: ['Black Soil', 'काली मिट्टी'],
      short: ['Black', 'काली'],
      tag: ['The cotton soil', 'कपास की मिट्टी'],
      formed: ['Formed as the lava rock (basalt) of the Deccan Plateau slowly broke down.', 'दक्कन के पठार की लावा चट्टान (बेसाल्ट) के धीरे-धीरे टूटने से बनी।'],
      texture: ['Very fine and rich in clay. Sticky when wet, and it cracks deeply when dry.', 'बहुत महीन, चिकनी मिट्टी से भरपूर। गीली होने पर चिपचिपी, और सूखने पर इसमें गहरी दरारें पड़ जाती हैं।'],
      water: ['Holds a lot of water for a long time.', 'बहुत सारा पानी लंबे समय तक रोके रखती है।'],
      crops: ['Cotton, jowar, soybean, sugarcane', 'कपास, ज्वार, सोयाबीन, गन्ना'],
      where: ['The Deccan lava plateau: Maharashtra, western Madhya Pradesh, Gujarat and nearby areas.', 'दक्कन का लावा पठार: महाराष्ट्र, पश्चिमी मध्य प्रदेश, गुजरात और आस-पास के क्षेत्र।'],
      clues: [
        ['Dark grey to black', 'गहरा धूसर से काला रंग'],
        ['Wide cracks across the dry surface', 'सूखी सतह पर चौड़ी दरारें'],
        ['Sticky like clay when wet', 'गीली होने पर चिकनी मिट्टी जैसी चिपचिपी']
      ],
      hint: ['See the deep cracks? Clay-rich soil shrinks as it dries.', 'गहरी दरारें दिखीं? चिकनी मिट्टी से भरपूर मिट्टी सूखने पर सिकुड़ती है।'],
      confuse: ['forest', 'alluvial'],
      spots: [
        { id: 'clay', at: ['top', 0.34, 0.4], name: ['Clay minerals', 'मृत्तिका खनिज'], text: ['These swell when wet and shrink when dry. That is why the soil cracks.', 'ये गीले होने पर फूलते और सूखने पर सिकुड़ते हैं। इसीलिए मिट्टी में दरारें पड़ती हैं।'] },
        { id: 'iron', at: ['top', 0.7, 0.66], name: ['Iron compounds', 'लोहे के यौगिक'], text: ['Iron-bearing minerals from the lava rock. Scientists think they, with clay and a little humus, give the dark colour.', 'लावा चट्टान से आए लौह-युक्त खनिज। वैज्ञानिक मानते हैं कि ये, चिकनी मिट्टी और थोड़े ह्यूमस के साथ, गहरा रंग देते हैं।'] },
        { id: 'calcium', at: ['front', 0.62, 0.78], name: ['Calcium compounds', 'कैल्सियम के यौगिक'], text: ['Small whitish lumps of lime (calcium carbonate), often called kankar.', 'चूने (कैल्सियम कार्बोनेट) की छोटी सफ़ेद गाँठें, जिन्हें अक्सर कंकड़ कहते हैं।'] }
      ],
      layers: [
        { t: 0.1, name: ['Cracked surface', 'दरारों वाली सतह'], text: ['Cracks open in the dry season and loose soil falls in. Farmers call this self-ploughing.', 'सूखे मौसम में दरारें खुलती हैं और ढीली मिट्टी उनमें गिर जाती है। किसान इसे स्वतः जुताई कहते हैं।'] },
        { t: 0.48, name: ['Deep clay', 'गहरी चिकनी मिट्टी'], text: ['The same dark clay carries on a long way down.', 'वही गहरे रंग की चिकनी मिट्टी काफ़ी नीचे तक जाती है।'] },
        { t: 0.82, name: ['Lime lumps', 'चूने की गाँठें'], text: ['Whitish lumps of calcium carbonate gather deeper down.', 'नीचे की ओर कैल्सियम कार्बोनेट की सफ़ेद गाँठें जमा होती हैं।'] }
      ],
      micro: ['Clay so fine that no single grain shows, split by a drying crack.', 'इतनी महीन चिकनी मिट्टी कि कोई अकेला कण नहीं दिखता, और बीच में सूखने से पड़ी दरार।'],
      note: ['Black soil is also called regur, or black cotton soil.', 'काली मिट्टी को रेगुर या कपास की काली मिट्टी भी कहते हैं।'],
      tip: ['Black soil sits on the old lava flows of the Deccan Plateau in western and central India.', 'काली मिट्टी पश्चिमी और मध्य भारत में दक्कन के पठार के पुराने लावा पर मिलती है।'],
      keys: [
        ['From the lava rock of the Deccan', 'दक्कन की लावा चट्टान से बनी'],
        ['Clay-rich: holds water, cracks when dry', 'चिकनी मिट्टी से भरपूर: पानी रोकती है, सूखने पर फटती है'],
        ['Famous for cotton', 'कपास के लिए प्रसिद्ध']
      ],
      match: ['Holds a great deal of water', 'बहुत सारा पानी रोकती है'],
      matchWhy: ['Black soil is rich in very fine clay. Clay holds a lot of water, so the soil stays moist for a long time.', 'काली मिट्टी में बहुत महीन चिकनी मिट्टी भरपूर होती है। यह बहुत पानी रोकती है, इसलिए मिट्टी देर तक नम रहती है।']
    },
    {
      id: 'red',
      hex: '#a8492e',
      name: ['Red and Yellow Soil', 'लाल और पीली मिट्टी'],
      short: ['Red and Yellow', 'लाल और पीली'],
      tag: ['Coloured by iron', 'लोहे से रंगी'],
      formed: ['Formed from very old, hard crystalline rocks in areas of lower rainfall.', 'कम वर्षा वाले क्षेत्रों में बहुत पुरानी, कठोर रवेदार चट्टानों से बनी।'],
      texture: ['Sandy to loamy. Often loose, with small bits of rock.', 'बलुई से दोमट। अक्सर ढीली, चट्टान के छोटे टुकड़ों वाली।'],
      water: ['Water drains through quickly, so it holds little.', 'पानी जल्दी निकल जाता है, इसलिए यह कम पानी रोकती है।'],
      crops: ['Millets such as ragi, groundnut, pulses', 'रागी जैसे मोटे अनाज, मूँगफली, दालें'],
      where: ['The southern and eastern Deccan Plateau: parts of Tamil Nadu, Karnataka, Andhra Pradesh, Telangana, Odisha, Chhattisgarh and Jharkhand.', 'दक्षिणी और पूर्वी दक्कन का पठार: तमिलनाडु, कर्नाटक, आंध्र प्रदेश, तेलंगाना, ओडिशा, छत्तीसगढ़ और झारखंड के भाग।'],
      clues: [
        ['Brick red, with yellowish patches', 'ईंट जैसा लाल, कहीं-कहीं पीलापन'],
        ['Loose and a little gritty', 'ढीली और थोड़ी खुरदरी'],
        ['Collected on the old hard rocks of the plateau', 'पठार की पुरानी कठोर चट्टानों पर से ली गई']
      ],
      hint: ['It is loose and gritty, not full of holes. And look for the yellow patches.', 'यह ढीली और खुरदरी है, छिद्रों से भरी नहीं। और पीले धब्बों को देखो।'],
      confuse: ['laterite', 'arid'],
      spots: [
        { id: 'iron', iron: true, at: ['top', 0.36, 0.36], name: ['Iron oxides', 'आयरन ऑक्साइड'], text: ['Iron from the rock joins with oxygen, a little like rusting. A thin coat on each grain makes the soil red.', 'चट्टान का लोहा ऑक्सीजन से जुड़ता है, कुछ-कुछ ज़ंग लगने जैसा। हर दाने पर इसकी पतली परत मिट्टी को लाल बनाती है।'] },
        { id: 'yellow', at: ['top', 0.7, 0.62], name: ['Yellow patches', 'पीले धब्बे'], text: ['Where the iron oxide has taken up water, the soil looks yellow instead of red.', 'जहाँ आयरन ऑक्साइड ने पानी ग्रहण कर लिया है, वहाँ मिट्टी लाल की जगह पीली दिखती है।'] },
        { id: 'grains', at: ['front', 0.66, 0.8], name: ['Rock grains', 'चट्टान के दाने'], text: ['Hard bits of the parent rock, such as quartz, make the soil gritty.', 'मूल चट्टान के कठोर टुकड़े, जैसे क्वार्ट्ज़, मिट्टी को खुरदरा बनाते हैं।'] }
      ],
      layers: [
        { t: 0.14, name: ['Red topsoil', 'लाल ऊपरी मिट्टी'], text: ['Loose, gritty soil coloured by iron oxides.', 'आयरन ऑक्साइड से रंगी ढीली, खुरदरी मिट्टी।'] },
        { t: 0.5, name: ['Yellowish zone', 'पीलापन लिए भाग'], text: ['Lower down the iron oxide holds water in it, so the soil looks yellow.', 'नीचे की ओर आयरन ऑक्साइड में पानी जुड़ा होता है, इसलिए मिट्टी पीली दिखती है।'] },
        { t: 0.84, name: ['Crumbling rock', 'भुरभुरी चट्टान'], text: ['The old crystalline rock that this soil came from.', 'वह पुरानी रवेदार चट्टान, जिससे यह मिट्टी बनी।'] }
      ],
      micro: ['Grains of rock, each with a thin red coat of iron oxide.', 'चट्टान के दाने, हर एक पर आयरन ऑक्साइड की पतली लाल परत।'],
      note: ['The red colour tells us about iron. It does not tell us how fertile the soil is.', 'लाल रंग लोहे के बारे में बताता है। यह नहीं बताता कि मिट्टी कितनी उपजाऊ है।'],
      tip: ['Red and yellow soil covers the old hard rocks of the southern and eastern plateau.', 'लाल और पीली मिट्टी दक्षिणी और पूर्वी पठार की पुरानी कठोर चट्टानों पर फैली है।'],
      keys: [
        ['Red from iron oxides', 'आयरन ऑक्साइड से लाल'],
        ['Sandy to loamy, drains quickly', 'बलुई से दोमट, पानी जल्दी निकलता है'],
        ['Millets, groundnut and pulses', 'मोटे अनाज, मूँगफली और दालें']
      ],
      match: ['Iron oxides give it its colour', 'आयरन ऑक्साइड से इसका रंग बनता है'],
      matchWhy: ['A thin coat of iron oxide on the grains colours the soil red. Where the iron oxide holds water, it looks yellow.', 'दानों पर आयरन ऑक्साइड की पतली परत मिट्टी को लाल रंग देती है। जहाँ आयरन ऑक्साइड में पानी जुड़ा हो, वहाँ यह पीली दिखती है।']
    },
    {
      id: 'laterite',
      hex: '#96421f',
      name: ['Laterite Soil', 'लैटेराइट मिट्टी'],
      short: ['Laterite', 'लैटेराइट'],
      tag: ['The brick soil', 'ईंट जैसी मिट्टी'],
      formed: ['Forms where it is hot and rains heavily. Rain water washes many minerals down and away. This is called leaching.', 'गरम और बहुत वर्षा वाले क्षेत्रों में बनती है। वर्षा का पानी कई खनिजों को बहाकर नीचे ले जाता है। इसे निक्षालन कहते हैं।'],
      texture: ['Full of small holes, with hard lumps. Soft when wet, hard as brick when dry.', 'छोटे-छोटे छिद्रों से भरी, कठोर गाँठों वाली। गीली होने पर नरम, सूखने पर ईंट जैसी कठोर।'],
      water: ['Rain soaks through fast and carries nutrients down with it.', 'वर्षा का पानी तेज़ी से नीचे रिसता है और पोषक तत्वों को साथ ले जाता है।'],
      crops: ['Tea, coffee, cashew, rubber', 'चाय, कॉफ़ी, काजू, रबर'],
      where: ['The Western Ghats of Kerala, Karnataka, Goa and Maharashtra, and parts of Tamil Nadu, Odisha and the North-East.', 'केरल, कर्नाटक, गोवा और महाराष्ट्र के पश्चिमी घाट, तथा तमिलनाडु, ओडिशा और पूर्वोत्तर के कुछ भाग।'],
      clues: [
        ['Rusty red-brown', 'ज़ंग जैसा लाल-भूरा रंग'],
        ['Full of small holes, with hard dark lumps', 'छोटे छिद्रों से भरी, कठोर गहरी गाँठों वाली'],
        ['Collected where it is hot and very rainy', 'गरम और बहुत वर्षा वाली जगह से ली गई']
      ],
      hint: ['Look for the small holes. Heavy rain has washed minerals out of this soil.', 'छोटे छिद्रों को देखो। भारी वर्षा ने इस मिट्टी से खनिज बहा दिए हैं।'],
      confuse: ['red', 'black'],
      spots: [
        { id: 'iron', iron: true, at: ['top', 0.32, 0.6], name: ['Iron oxides', 'आयरन ऑक्साइड'], text: ['Left behind after leaching. They give the rusty red colour.', 'निक्षालन के बाद बचे रह जाते हैं। ये ज़ंग जैसा लाल रंग देते हैं।'] },
        { id: 'aluminium', at: ['top', 0.68, 0.34], name: ['Aluminium oxides', 'एल्युमिनियम ऑक्साइड'], text: ['Also left behind. Some laterite areas are mined for bauxite, the ore of aluminium.', 'ये भी बचे रह जाते हैं। कुछ लैटेराइट क्षेत्रों से बॉक्साइट निकाला जाता है, जो एल्युमिनियम का अयस्क है।'] },
        { id: 'pores', at: ['front', 0.4, 0.42], name: ['Pores', 'छिद्र'], text: ['Tiny holes left where other minerals were washed out by rain.', 'वे नन्हे छिद्र, जहाँ से दूसरे खनिज वर्षा में बह गए।'] }
      ],
      layers: [
        { t: 0.12, name: ['Hard crust', 'कठोर पपड़ी'], text: ['Dries as hard as a brick. The name comes from the Latin word for brick.', 'सूखकर ईंट जैसी कठोर हो जाती है। यह नाम ईंट के लिए लैटिन शब्द से आया है।'] },
        { t: 0.5, name: ['Leached zone', 'निक्षालित भाग'], text: ['Rain has washed silica and other minerals down, leaving iron and aluminium oxides.', 'वर्षा ने सिलिका और दूसरे खनिज नीचे बहा दिए, और आयरन व एल्युमिनियम ऑक्साइड बचे रह गए।'] },
        { t: 0.84, name: ['Soft clay below', 'नीचे नरम मिट्टी'], text: ['Paler and softer. It can be cut into blocks that harden in the air.', 'हल्के रंग की और नरम। इसे काटकर खंड बनाए जा सकते हैं, जो हवा में कठोर हो जाते हैं।'] }
      ],
      micro: ['A honeycomb of small holes, with dark lumps rich in iron.', 'छोटे छिद्रों का छत्ते जैसा जाल, और लोहे से भरपूर गहरी गाँठें।'],
      note: ['Leaching carries nutrients away, so farmers add manure and fertiliser to laterite soil.', 'निक्षालन पोषक तत्वों को बहा ले जाता है, इसलिए किसान लैटेराइट मिट्टी में खाद और उर्वरक डालते हैं।'],
      tip: ['Laterite soil forms where it is hot and very rainy, such as the Western Ghats.', 'लैटेराइट मिट्टी गरम और बहुत वर्षा वाली जगहों पर बनती है, जैसे पश्चिमी घाट।'],
      keys: [
        ['Hot, very rainy places', 'गरम, बहुत वर्षा वाली जगहें'],
        ['Leaching leaves iron and aluminium oxides', 'निक्षालन के बाद आयरन व एल्युमिनियम ऑक्साइड बचते हैं'],
        ['Tea, coffee and cashew', 'चाय, कॉफ़ी और काजू']
      ],
      match: ['Formed by intense leaching', 'तेज़ निक्षालन से बनी'],
      matchWhy: ['Heavy rain washes silica and many nutrients down through the soil. Iron and aluminium oxides stay behind.', 'भारी वर्षा सिलिका और कई पोषक तत्वों को मिट्टी से नीचे बहा देती है। आयरन और एल्युमिनियम ऑक्साइड बचे रह जाते हैं।']
    },
    {
      id: 'arid',
      hex: '#cfb284',
      name: ['Arid Soil', 'शुष्क मिट्टी'],
      short: ['Arid', 'शुष्क'],
      tag: ['Soil of the desert', 'मरुस्थल की मिट्टी'],
      formed: ['Forms in hot, dry regions with very little rain. Wind moves the loose sand about.', 'बहुत कम वर्षा वाले गरम, सूखे क्षेत्रों में बनती है। हवा ढीली रेत को इधर-उधर ले जाती है।'],
      texture: ['Mostly sandy and loose, though it differs from place to place.', 'अधिकतर बलुई और ढीली, हालाँकि यह जगह-जगह अलग होती है।'],
      water: ['Water drains fast and dries up quickly. There is very little humus.', 'पानी तेज़ी से निकल जाता है और जल्दी सूख जाता है। ह्यूमस बहुत कम होता है।'],
      crops: ['With irrigation: bajra, pulses, wheat', 'सिंचाई मिलने पर: बाजरा, दालें, गेहूँ'],
      where: ['Western Rajasthan, and dry parts of Gujarat, Haryana and Punjab.', 'पश्चिमी राजस्थान, तथा गुजरात, हरियाणा और पंजाब के सूखे भाग।'],
      clues: [
        ['Pale sandy brown', 'हल्का रेतीला भूरा रंग'],
        ['Loose grains, with ripples made by wind', 'ढीले दाने, हवा से बनी लहरों के साथ'],
        ['Collected where rain is very rare', 'ऐसी जगह से ली गई जहाँ वर्षा बहुत कम होती है']
      ],
      hint: ['Look at the ripples. What moves loose sand in a dry land?', 'लहरों को देखो। सूखी धरती पर ढीली रेत को कौन हिलाता है?'],
      confuse: ['alluvial', 'red'],
      spots: [
        { id: 'sand', at: ['top', 0.36, 0.42], name: ['Sand grains', 'रेत के दाने'], text: ['Mostly tiny bits of the mineral quartz, rounded by the wind.', 'अधिकतर क्वार्ट्ज़ खनिज के नन्हे टुकड़े, जिन्हें हवा ने गोल कर दिया है।'] },
        { id: 'salt', at: ['top', 0.7, 0.68], name: ['Salts', 'लवण'], text: ['Water dries up fast and leaves salts behind. In some places the soil is very salty.', 'पानी तेज़ी से सूखता है और लवण छोड़ जाता है। कुछ जगहों पर मिट्टी बहुत खारी होती है।'] },
        { id: 'kankar', at: ['front', 0.55, 0.8], name: ['Kankar layer', 'कंकड़ की परत'], text: ['Deeper down, calcium carbonate forms hard lumps that slow water moving down.', 'नीचे की ओर कैल्सियम कार्बोनेट कठोर गाँठें बनाता है, जो पानी का नीचे जाना धीमा कर देती हैं।'] }
      ],
      layers: [
        { t: 0.1, name: ['Loose sand', 'ढीली रेत'], text: ['Blown about by wind, with very little humus.', 'हवा से उड़ती रहती है, ह्यूमस बहुत कम।'] },
        { t: 0.46, name: ['Sandy subsoil', 'रेतीली उपमृदा'], text: ['Still dry and loose, a little more firmly packed.', 'अब भी सूखी और ढीली, थोड़ी अधिक जमी हुई।'] },
        { t: 0.82, name: ['Kankar layer', 'कंकड़ की परत'], text: ['Lumps of calcium carbonate form a hard layer.', 'कैल्सियम कार्बोनेट की गाँठें एक कठोर परत बनाती हैं।'] }
      ],
      micro: ['Rounded sand grains with open gaps between them.', 'गोल रेत के दाने, जिनके बीच खुली जगहें हैं।'],
      note: ['Arid soil is not the same everywhere. With water from canals, parts of it now grow good crops.', 'शुष्क मिट्टी हर जगह एक जैसी नहीं होती। नहरों का पानी मिलने से इसके कई भागों में अब अच्छी फ़सलें होती हैं।'],
      tip: ['Arid soil is found in the dry north-west, in and around the Thar Desert.', 'शुष्क मिट्टी सूखे उत्तर-पश्चिम में, थार मरुस्थल और उसके आस-पास मिलती है।'],
      keys: [
        ['Dry regions with little rain', 'कम वर्षा वाले सूखे क्षेत्र'],
        ['Mostly sandy, very little humus', 'अधिकतर बलुई, ह्यूमस बहुत कम'],
        ['Crops need irrigation', 'फ़सलों को सिंचाई चाहिए']
      ],
      match: ['Dry conditions, often sandy', 'सूखी दशा, अक्सर बलुई'],
      matchWhy: ['With very little rain there are few plants to add humus, and wind leaves loose sand behind.', 'बहुत कम वर्षा में ह्यूमस देने वाले पौधे कम होते हैं, और हवा ढीली रेत छोड़ जाती है।']
    },
    {
      id: 'forest',
      hex: '#4d3524',
      name: ['Forest and Mountain Soil', 'वन और पर्वतीय मिट्टी'],
      short: ['Forest and Mountain', 'वन और पर्वतीय'],
      tag: ['Soil under the trees', 'पेड़ों के नीचे की मिट्टी'],
      formed: ['Forms in hills and mountains, under the cover of forests.', 'पहाड़ियों और पर्वतों में, वनों की छाया तले बनती है।'],
      texture: ['Not the same everywhere: loamy and silty in valleys, coarse and stony on high slopes.', 'हर जगह एक जैसी नहीं: घाटियों में दोमट और गादयुक्त, ऊँची ढलानों पर मोटी और पथरीली।'],
      water: ['Leaf litter helps the soil stay moist. On steep slopes, water runs off.', 'पत्तियों की परत मिट्टी को नम रखती है। खड़ी ढलानों पर पानी बह जाता है।'],
      crops: ['Tea, coffee, spices, apples and other fruits', 'चाय, कॉफ़ी, मसाले, सेब और दूसरे फल'],
      where: ['The Himalaya, the hills of the North-East, and the Western and Eastern Ghats.', 'हिमालय, पूर्वोत्तर की पहाड़ियाँ, तथा पश्चिमी और पूर्वी घाट।'],
      clues: [
        ['Dark brown top layer', 'गहरे भूरे रंग की ऊपरी परत'],
        ['Bits of leaves, roots and stones', 'पत्तियों, जड़ों और पत्थरों के टुकड़े'],
        ['Collected on a forested hillside', 'वनों से ढकी पहाड़ी ढलान से ली गई']
      ],
      hint: ['Leaves, twigs and roots. Where do so many of these fall on the soil?', 'पत्तियाँ, टहनियाँ और जड़ें। मिट्टी पर ये इतनी सारी कहाँ गिरती हैं?'],
      confuse: ['black', 'laterite'],
      spots: [
        { id: 'humus', at: ['top', 0.34, 0.6], name: ['Humus', 'ह्यूमस'], text: ['Dark material from rotted leaves and other remains. It may be plentiful under forest cover.', 'सड़ी पत्तियों और दूसरे अवशेषों से बना गहरा पदार्थ। वनों के नीचे यह भरपूर हो सकता है।'] },
        { id: 'roots', at: ['front', 0.3, 0.3], name: ['Roots', 'जड़ें'], text: ['Roots hold the soil on slopes and help stop it washing away.', 'जड़ें ढलानों पर मिट्टी को थामे रखती हैं और उसे बहने से बचाती हैं।'] },
        { id: 'rocks', at: ['front', 0.7, 0.78], name: ['Rock pieces', 'चट्टान के टुकड़े'], text: ['On high, steep slopes the soil is thin, with many stones.', 'ऊँची, खड़ी ढलानों पर मिट्टी पतली होती है और उसमें बहुत पत्थर होते हैं।'] }
      ],
      layers: [
        { t: 0.07, name: ['Leaf litter', 'पत्तियों की परत'], text: ['Fallen leaves and twigs, slowly rotting.', 'गिरी हुई पत्तियाँ और टहनियाँ, जो धीरे-धीरे सड़ रही हैं।'] },
        { t: 0.32, name: ['Humus-rich topsoil', 'ह्यूमस से भरपूर ऊपरी मिट्टी'], text: ['Dark and crumbly, and full of roots.', 'गहरे रंग की, भुरभुरी और जड़ों से भरी।'] },
        { t: 0.78, name: ['Stony subsoil', 'पथरीली उपमृदा'], text: ['Thin soil over broken rock, most of all on steep slopes.', 'टूटी चट्टान के ऊपर पतली मिट्टी, खासकर खड़ी ढलानों पर।'] }
      ],
      micro: ['Dark crumbs of soil held together by humus and fine roots.', 'ह्यूमस और महीन जड़ों से जुड़े मिट्टी के गहरे रंग के कण-समूह।'],
      note: ['Mountain soil is not uniform. It changes with height, slope and the kind of forest.', 'पर्वतीय मिट्टी एक जैसी नहीं होती। यह ऊँचाई, ढलान और वन के प्रकार के साथ बदलती है।'],
      tip: ['Forest and mountain soil follows the Himalaya and the forested hills.', 'वन और पर्वतीय मिट्टी हिमालय और वनों से ढकी पहाड़ियों के साथ चलती है।'],
      keys: [
        ['Hills and mountains under forest', 'वनों से ढकी पहाड़ियाँ और पर्वत'],
        ['Changes with slope and height', 'ढलान और ऊँचाई के साथ बदलती है'],
        ['Tea, coffee, spices and fruits', 'चाय, कॉफ़ी, मसाले और फल']
      ],
      match: ['Humus may be plentiful under forest cover', 'वनों के नीचे ह्यूमस भरपूर हो सकता है'],
      matchWhy: ['Trees drop leaves all year. As the leaves rot they turn into humus, which darkens the topsoil.', 'पेड़ साल भर पत्तियाँ गिराते हैं। सड़कर ये ह्यूमस बनती हैं, जो ऊपरी मिट्टी को गहरा रंग देता है।']
    }
  ];

  D.soil = function (id) {
    for (var i = 0; i < D.soils.length; i++) if (D.soils[i].id === id) return D.soils[i];
    return null;
  };

  // ------------------------------------------------------------------
  // The 36 regions: 28 states, then 8 union territories. The ids match
  // js/data/india-geo.js.
  // ------------------------------------------------------------------
  D.regions = [
    { id: 'AP', name: ['Andhra Pradesh', 'आंध्र प्रदेश'], major: ['red'], also: ['alluvial', 'black', 'laterite'], fact: ['The deltas of the Krishna and Godavari rivers have rich alluvial soil and grow a great deal of rice.', 'कृष्णा और गोदावरी नदियों के डेल्टा में उपजाऊ जलोढ़ मिट्टी है, जहाँ बहुत धान उगता है।'], crops: ['Rice, cotton, groundnut, chillies', 'धान, कपास, मूँगफली, मिर्च'] },
    { id: 'AR', name: ['Arunachal Pradesh', 'अरुणाचल प्रदेश'], major: ['forest'], also: [], fact: ['Forested mountains cover most of Arunachal Pradesh.', 'अरुणाचल प्रदेश का अधिकतर भाग वनों से ढके पर्वतों का है।'], crops: ['Rice, maize, millets, oranges', 'धान, मक्का, मोटे अनाज, संतरे'] },
    { id: 'AS', name: ['Assam', 'असम'], major: ['alluvial'], also: ['laterite', 'forest'], fact: ['The Brahmaputra spreads fresh alluvium across its valley almost every year.', 'ब्रह्मपुत्र लगभग हर साल अपनी घाटी में नया जलोढ़ बिछाती है।'], crops: ['Tea, rice, jute', 'चाय, धान, जूट'] },
    { id: 'BR', name: ['Bihar', 'बिहार'], major: ['alluvial'], also: [], fact: ["Rivers such as the Ganga, Kosi and Gandak built Bihar's wide alluvial plain.", 'गंगा, कोसी और गंडक जैसी नदियों ने बिहार का चौड़ा जलोढ़ मैदान बनाया है।'], crops: ['Rice, wheat, maize, litchi', 'धान, गेहूँ, मक्का, लीची'] },
    { id: 'CG', name: ['Chhattisgarh', 'छत्तीसगढ़'], major: ['red'], also: ['black'], fact: ['Chhattisgarh is often called a rice bowl of India.', 'छत्तीसगढ़ को अक्सर भारत का धान का कटोरा कहा जाता है।'], crops: ['Rice, maize, pulses', 'धान, मक्का, दालें'] },
    { id: 'GA', name: ['Goa', 'गोवा'], major: ['laterite'], also: ['alluvial'], fact: ['In Goa, blocks of laterite stone are cut from the ground and used for building.', 'गोवा में लैटेराइट पत्थर के खंड ज़मीन से काटकर इमारतें बनाने में लगाए जाते हैं।'], crops: ['Cashew, coconut, rice', 'काजू, नारियल, धान'] },
    { id: 'GJ', name: ['Gujarat', 'गुजरात'], major: ['black'], also: ['alluvial', 'arid'], fact: ["Gujarat's black soil is well known for cotton. The Rann of Kachchh in the north-west is a salty desert.", 'गुजरात की काली मिट्टी कपास के लिए जानी जाती है। उत्तर-पश्चिम में कच्छ का रण एक खारा मरुस्थल है।'], crops: ['Cotton, groundnut, bajra', 'कपास, मूँगफली, बाजरा'] },
    { id: 'HR', name: ['Haryana', 'हरियाणा'], major: ['alluvial'], also: ['arid'], fact: ['Most of Haryana is an alluvial plain. Its south-west is sandy and dry.', 'हरियाणा का अधिकतर भाग जलोढ़ मैदान है। इसका दक्षिण-पश्चिमी भाग रेतीला और सूखा है।'], crops: ['Wheat, rice, mustard, bajra', 'गेहूँ, धान, सरसों, बाजरा'] },
    { id: 'HP', name: ['Himachal Pradesh', 'हिमाचल प्रदेश'], major: ['forest'], also: [], fact: ['Apple orchards grow on the mountain slopes of Himachal Pradesh.', 'हिमाचल प्रदेश की पहाड़ी ढलानों पर सेब के बाग हैं।'], crops: ['Apples, maize, wheat, potato', 'सेब, मक्का, गेहूँ, आलू'] },
    { id: 'JH', name: ['Jharkhand', 'झारखंड'], major: ['red'], also: [], fact: ['Jharkhand lies on the Chota Nagpur Plateau, which is made of very old, hard rocks.', 'झारखंड छोटा नागपुर पठार पर बसा है, जो बहुत पुरानी, कठोर चट्टानों से बना है।'], crops: ['Rice, maize, pulses', 'धान, मक्का, दालें'] },
    { id: 'KA', name: ['Karnataka', 'कर्नाटक'], major: ['red', 'laterite'], also: ['black', 'forest'], fact: ["Karnataka grows most of India's coffee, on the hill slopes of the Western Ghats.", 'भारत की अधिकतर कॉफ़ी कर्नाटक में, पश्चिमी घाट की पहाड़ी ढलानों पर उगती है।'], crops: ['Ragi, coffee, cotton, sugarcane', 'रागी, कॉफ़ी, कपास, गन्ना'] },
    { id: 'KL', name: ['Kerala', 'केरल'], major: ['laterite'], also: ['alluvial', 'forest'], fact: ['The name laterite was first given to this soil in Kerala, in 1807.', 'लैटेराइट नाम इस मिट्टी को सबसे पहले केरल में, 1807 में दिया गया था।'], crops: ['Coconut, rubber, tea, spices', 'नारियल, रबर, चाय, मसाले'] },
    { id: 'MP', name: ['Madhya Pradesh', 'मध्य प्रदेश'], major: ['black'], also: ['red', 'alluvial'], fact: ['The Malwa Plateau of Madhya Pradesh has deep black soil formed from old lava.', 'मध्य प्रदेश के मालवा पठार में पुराने लावा से बनी गहरी काली मिट्टी है।'], crops: ['Soybean, wheat, gram, cotton', 'सोयाबीन, गेहूँ, चना, कपास'] },
    { id: 'MH', name: ['Maharashtra', 'महाराष्ट्र'], major: ['black'], also: ['laterite', 'red'], fact: ["Maharashtra's black soil, called regur, formed from the lava rocks of the Deccan.", 'महाराष्ट्र की काली मिट्टी, जिसे रेगुर कहते हैं, दक्कन की लावा चट्टानों से बनी है।'], crops: ['Cotton, sugarcane, jowar, soybean', 'कपास, गन्ना, ज्वार, सोयाबीन'] },
    { id: 'MN', name: ['Manipur', 'मणिपुर'], major: ['forest'], also: ['alluvial'], fact: ['The Imphal valley is a flat plain with forested hills all around it.', 'इंफाल घाटी एक समतल मैदान है, जिसके चारों ओर वनों से ढकी पहाड़ियाँ हैं।'], crops: ['Rice, maize, pulses', 'धान, मक्का, दालें'] },
    { id: 'ML', name: ['Meghalaya', 'मेघालय'], major: ['forest'], also: ['laterite'], fact: ['Mawsynram and Cherrapunji are among the wettest places on Earth. Such heavy rain washes minerals out of the soil.', 'मौसिनराम और चेरापूँजी पृथ्वी के सबसे अधिक वर्षा वाले स्थानों में हैं। इतनी भारी वर्षा मिट्टी से खनिज बहा देती है।'], crops: ['Rice, maize, potato, ginger', 'धान, मक्का, आलू, अदरक'] },
    { id: 'MZ', name: ['Mizoram', 'मिज़ोरम'], major: ['forest'], also: [], fact: ['Steep forested hills cover almost all of Mizoram.', 'मिज़ोरम का लगभग पूरा भाग वनों से ढकी खड़ी पहाड़ियों का है।'], crops: ['Rice, maize, ginger', 'धान, मक्का, अदरक'] },
    { id: 'NL', name: ['Nagaland', 'नागालैंड'], major: ['forest'], also: [], fact: ['Many farmers in Nagaland grow rice on terraces cut into the hill slopes.', 'नागालैंड के कई किसान पहाड़ी ढलानों पर सीढ़ीदार खेत बनाकर धान उगाते हैं।'], crops: ['Rice, maize, millets', 'धान, मक्का, मोटे अनाज'] },
    { id: 'OD', name: ['Odisha', 'ओडिशा'], major: ['red'], also: ['laterite', 'alluvial'], fact: ["The Mahanadi delta on Odisha's coast has fertile alluvial soil for rice.", 'ओडिशा के तट पर महानदी के डेल्टा में धान के लिए उपजाऊ जलोढ़ मिट्टी है।'], crops: ['Rice, pulses, oilseeds, cashew', 'धान, दालें, तिलहन, काजू'] },
    { id: 'PB', name: ['Punjab', 'पंजाब'], major: ['alluvial'], also: ['arid'], fact: ["Punjab's alluvial plain is one of India's main wheat and rice areas.", 'पंजाब का जलोढ़ मैदान भारत के प्रमुख गेहूँ और धान क्षेत्रों में से एक है।'], crops: ['Wheat, rice, cotton, maize', 'गेहूँ, धान, कपास, मक्का'] },
    { id: 'RJ', name: ['Rajasthan', 'राजस्थान'], major: ['arid'], also: ['alluvial', 'black'], fact: ['The Thar Desert covers much of western Rajasthan. The Indira Gandhi Canal brings water for crops.', 'थार मरुस्थल पश्चिमी राजस्थान के बड़े भाग में फैला है। इंदिरा गांधी नहर फ़सलों के लिए पानी लाती है।'], crops: ['Bajra, pulses, mustard, wheat', 'बाजरा, दालें, सरसों, गेहूँ'] },
    { id: 'SK', name: ['Sikkim', 'सिक्किम'], major: ['forest'], also: [], fact: ["In 2016 Sikkim became India's first fully organic farming state.", '2016 में सिक्किम भारत का पहला पूरी तरह जैविक खेती वाला राज्य बना।'], crops: ['Large cardamom, ginger, maize, oranges', 'बड़ी इलायची, अदरक, मक्का, संतरे'] },
    { id: 'TN', name: ['Tamil Nadu', 'तमिलनाडु'], major: ['red'], also: ['alluvial', 'black', 'laterite', 'forest'], fact: ['The Kaveri delta is known as the rice bowl of Tamil Nadu.', 'कावेरी डेल्टा को तमिलनाडु का धान का कटोरा कहा जाता है।'], crops: ['Rice, millets, groundnut, tea', 'धान, मोटे अनाज, मूँगफली, चाय'] },
    { id: 'TS', name: ['Telangana', 'तेलंगाना'], major: ['red'], also: ['black'], fact: ['Telangana has wide areas of red soil, with black soil in some parts.', 'तेलंगाना के बड़े भाग में लाल मिट्टी है, और कुछ भागों में काली मिट्टी।'], crops: ['Rice, cotton, maize, pulses', 'धान, कपास, मक्का, दालें'] },
    { id: 'TR', name: ['Tripura', 'त्रिपुरा'], major: ['forest'], also: ['alluvial'], fact: ["Tripura is one of India's biggest producers of natural rubber.", 'त्रिपुरा भारत के सबसे बड़े प्राकृतिक रबर उत्पादकों में से एक है।'], crops: ['Rubber, rice, pineapple, tea', 'रबर, धान, अनानास, चाय'] },
    { id: 'UP', name: ['Uttar Pradesh', 'उत्तर प्रदेश'], major: ['alluvial'], also: [], fact: ['New alluvium beside the rivers is called khadar. Older alluvium farther away is called bangar.', 'नदियों के पास का नया जलोढ़ खादर कहलाता है। दूर का पुराना जलोढ़ बांगर कहलाता है।'], crops: ['Wheat, sugarcane, rice, potato', 'गेहूँ, गन्ना, धान, आलू'] },
    { id: 'UK', name: ['Uttarakhand', 'उत्तराखंड'], major: ['forest'], also: ['alluvial'], fact: ['Soil changes as you climb in Uttarakhand, from the plains at the foothills to the high Himalaya.', 'उत्तराखंड में ऊपर चढ़ते हुए मिट्टी बदलती जाती है, तलहटी के मैदानों से ऊँचे हिमालय तक।'], crops: ['Rice, wheat, millets, apples', 'धान, गेहूँ, मोटे अनाज, सेब'] },
    { id: 'WB', name: ['West Bengal', 'पश्चिम बंगाल'], major: ['alluvial'], also: ['laterite', 'forest'], fact: ['The Ganga delta in West Bengal is part of the largest delta in the world.', 'पश्चिम बंगाल का गंगा डेल्टा विश्व के सबसे बड़े डेल्टा का भाग है।'], crops: ['Rice, jute, tea, potato', 'धान, जूट, चाय, आलू'] },
    { id: 'AN', name: ['Andaman and Nicobar Islands', 'अंडमान और निकोबार द्वीप समूह'], major: ['forest'], also: ['alluvial'], fact: ['Thick tropical forest covers most of these islands.', 'इन द्वीपों का अधिकतर भाग घने उष्णकटिबंधीय वनों से ढका है।'], crops: ['Coconut, arecanut, rice', 'नारियल, सुपारी, धान'] },
    { id: 'CH', name: ['Chandigarh', 'चंडीगढ़'], major: ['alluvial'], also: [], fact: ['Chandigarh lies on the plain at the foot of the Shivalik Hills.', 'चंडीगढ़ शिवालिक पहाड़ियों की तलहटी के मैदान में बसा है।'], crops: ['Wheat, maize', 'गेहूँ, मक्का'] },
    { id: 'DH', name: ['Dadra and Nagar Haveli and Daman and Diu', 'दादरा और नगर हवेली तथा दमन और दीव'], major: ['alluvial'], also: [], fact: ['This union territory is in separate parts: Dadra and Nagar Haveli inland, Daman on the coast and the island of Diu. The Damanganga river has laid down alluvium here.', 'यह केंद्र शासित प्रदेश अलग-अलग भागों में है: भीतर की ओर दादरा और नगर हवेली, तट पर दमन और दीव द्वीप। दमनगंगा नदी ने यहाँ जलोढ़ बिछाया है।'], crops: ['Rice, ragi, pulses, coconut', 'धान, रागी, दालें, नारियल'] },
    { id: 'DL', name: ['Delhi', 'दिल्ली'], major: ['alluvial'], also: [], fact: ['Delhi lies beside the Yamuna, which has spread alluvium over its floodplain.', 'दिल्ली यमुना के किनारे बसी है, जिसने अपने बाढ़ के मैदान में जलोढ़ बिछाया है।'], crops: ['Wheat, vegetables', 'गेहूँ, सब्ज़ियाँ'] },
    { id: 'JK', name: ['Jammu and Kashmir', 'जम्मू और कश्मीर'], major: ['forest'], also: ['alluvial'], fact: ['Saffron is grown on the karewa soils of the Kashmir valley.', 'कश्मीर घाटी की करेवा मिट्टी में केसर उगाया जाता है।'], crops: ['Saffron, rice, apples, walnuts', 'केसर, धान, सेब, अखरोट'] },
    { id: 'LA', name: ['Ladakh', 'लद्दाख'], major: ['forest'], also: [], fact: ['Ladakh is a cold desert. Its mountain soils are thin, dry and stony.', 'लद्दाख एक शीत मरुस्थल है। यहाँ की पर्वतीय मिट्टी पतली, सूखी और पथरीली है।'], crops: ['Barley, apricots', 'जौ, खुबानी'] },
    { id: 'LD', name: ['Lakshadweep', 'लक्षद्वीप'], major: [], also: [], other: 'coral', fact: ['These are coral islands. Their sandy soil is made of broken coral, so it does not fit any of the six main groups.', 'ये प्रवाल (मूँगे) के द्वीप हैं। यहाँ की रेतीली मिट्टी टूटे प्रवाल से बनी है, इसलिए यह छह मुख्य समूहों में से किसी में नहीं आती।'], crops: ['Coconut', 'नारियल'] },
    { id: 'PY', name: ['Puducherry', 'पुदुच्चेरी'], major: ['alluvial'], also: [], fact: ['Puducherry is in four separate parts along the coast: Puducherry, Karaikal, Mahe and Yanam.', 'पुदुच्चेरी तट के साथ चार अलग भागों में है: पुदुच्चेरी, कारैकाल, माहे और यनम।'], crops: ['Rice, sugarcane, coconut, pulses', 'धान, गन्ना, नारियल, दालें'] }
  ];

  D.region = function (id) {
    for (var i = 0; i < D.regions.length; i++) if (D.regions[i].id === id) return D.regions[i];
    return null;
  };

  // ------------------------------------------------------------------
  // Soil Hunt missions on the map. `accept` are right answers; a region
  // that has the soil but is not in `accept` counts as "close" and costs
  // nothing. `why` may use {name} for the region the child found.
  // ------------------------------------------------------------------
  D.missions = [
    {
      id: 'black', type: 'soil', soil: 'black', accept: ['MH', 'MP', 'GJ'],
      clue: ['Find a state where black soil covers wide areas.', 'ऐसा राज्य खोजो जहाँ काली मिट्टी बड़े भाग में फैली हो।'],
      hint: ['Think of the lava plateau in western and central India.', 'पश्चिमी और मध्य भारत के लावा पठार के बारे में सोचो।'],
      why: ['{name} lies on the Deccan lava plateau, where black soil formed from basalt rock.', '{name} दक्कन के लावा पठार पर है, जहाँ बेसाल्ट चट्टान से काली मिट्टी बनी।']
    },
    {
      id: 'arid', type: 'soil', soil: 'arid', accept: ['RJ'],
      clue: ['Find the state with the largest area of arid soil.', 'वह राज्य खोजो जहाँ शुष्क मिट्टी का सबसे बड़ा क्षेत्र है।'],
      hint: ['Look for the Thar Desert in the north-west.', 'उत्तर-पश्चिम में थार मरुस्थल को खोजो।'],
      why: ['The Thar Desert covers much of western Rajasthan, where rain is very low.', 'थार मरुस्थल पश्चिमी राजस्थान के बड़े भाग में फैला है, जहाँ वर्षा बहुत कम होती है।']
    },
    {
      id: 'alluvial', type: 'soil', soil: 'alluvial', place: true, accept: ['PB', 'HR', 'UP', 'BR', 'WB', 'AS', 'DL', 'CH'],
      clue: ['Find a state or union territory on the northern river plains, where alluvial soil covers wide areas.', 'उत्तरी नदी-मैदानों का ऐसा राज्य या केंद्र शासित प्रदेश खोजो जहाँ जलोढ़ मिट्टी बड़े भाग में फैली हो।'],
      hint: ['Follow the Ganga or the Brahmaputra across the north.', 'उत्तर में गंगा या ब्रह्मपुत्र के साथ-साथ चलो।'],
      why: ['Rivers from the Himalaya have spread alluvium across {name}.', 'हिमालय से आने वाली नदियों ने {name} में जलोढ़ बिछाया है।']
    },
    {
      id: 'laterite', type: 'soil', soil: 'laterite', accept: ['KL', 'KA', 'GA'],
      clue: ['Find a state on the rainy west coast where laterite soil is common.', 'वर्षा वाले पश्चिमी तट का ऐसा राज्य खोजो जहाँ लैटेराइट मिट्टी आम है।'],
      hint: ['Look along the Western Ghats in the south-west.', 'दक्षिण-पश्चिम में पश्चिमी घाट के साथ देखो।'],
      why: ['{name} is hot and very rainy, so leaching has formed laterite soil.', '{name} गरम और बहुत वर्षा वाला है, इसलिए निक्षालन से लैटेराइट मिट्टी बनी है।']
    },
    {
      id: 'forest', type: 'soil', soil: 'forest', place: true, accept: ['JK', 'LA', 'HP', 'UK', 'SK', 'AR'],
      clue: ['Find a state or union territory in the high Himalaya with mountain soil.', 'ऊँचे हिमालय का ऐसा राज्य या केंद्र शासित प्रदेश खोजो जहाँ पर्वतीय मिट्टी हो।'],
      hint: ['The Himalaya runs along the far north of India.', 'हिमालय भारत के सुदूर उत्तर में फैला है।'],
      why: ['{name} lies in the Himalaya, where soils change with height and slope.', '{name} हिमालय में है, जहाँ मिट्टी ऊँचाई और ढलान के साथ बदलती है।']
    },
    {
      id: 'red', type: 'soil', soil: 'red', accept: ['TN', 'KA', 'AP', 'TS', 'OD', 'CG', 'JH'],
      clue: ['Find a state on the southern or eastern plateau where red soil covers wide areas.', 'दक्षिणी या पूर्वी पठार का ऐसा राज्य खोजो जहाँ लाल मिट्टी बड़े भाग में फैली हो।'],
      hint: ['Try the south or the east of the plateau, away from the lava region.', 'पठार के दक्षिण या पूर्व में देखो, लावा क्षेत्र से हटकर।'],
      why: ['The old crystalline rocks of {name} have weathered into red soil.', '{name} की पुरानी रवेदार चट्टानों के टूटने से लाल मिट्टी बनी है।']
    },
    {
      id: 'kerala', type: 'state', accept: ['KL'],
      clue: ['Laterite soil got its name in this southern state in 1807. Find Kerala.', 'लैटेराइट मिट्टी को उसका नाम 1807 में इस दक्षिणी राज्य में मिला। केरल खोजो।'],
      hint: ['It is a long, narrow state on the south-west coast.', 'यह दक्षिण-पश्चिमी तट पर एक लंबा, पतला राज्य है।'],
      why: ['Kerala is hot and rainy, which is just right for laterite to form.', 'केरल गरम और वर्षा वाला है, जो लैटेराइट बनने के लिए बिल्कुल सही है।']
    },
    {
      id: 'jk', type: 'state', accept: ['JK'],
      clue: ['Saffron grows on karewa soil here. Find Jammu and Kashmir.', 'यहाँ करेवा मिट्टी में केसर उगता है। जम्मू और कश्मीर खोजो।'],
      hint: ['Look in the far north, just west of Ladakh.', 'सुदूर उत्तर में देखो, लद्दाख के ठीक पश्चिम में।'],
      why: ['The Kashmir valley is known for saffron grown on its karewa soils.', 'कश्मीर घाटी अपनी करेवा मिट्टी में उगने वाले केसर के लिए जानी जाती है।']
    },
    {
      id: 'assam', type: 'state', accept: ['AS'],
      clue: ['The Brahmaputra spreads fresh alluvium across this state almost every year. Find Assam.', 'ब्रह्मपुत्र लगभग हर साल इस राज्य में नया जलोढ़ बिछाती है। असम खोजो।'],
      hint: ['Look in the North-East, along a long river valley.', 'पूर्वोत्तर में देखो, एक लंबी नदी-घाटी के साथ।'],
      why: ["The Brahmaputra valley in Assam is one of India's great alluvial plains.", 'असम की ब्रह्मपुत्र घाटी भारत के बड़े जलोढ़ मैदानों में से एक है।']
    },
    {
      id: 'lakshadweep', type: 'state', accept: ['LD'],
      clue: ['These coral islands have sandy soil made of broken coral. Find Lakshadweep.', 'इन प्रवाल द्वीपों की रेतीली मिट्टी टूटे प्रवाल से बनी है। लक्षद्वीप खोजो।'],
      hint: ['Look in the sea to the west of Kerala.', 'केरल के पश्चिम में समुद्र में देखो।'],
      why: ['Lakshadweep is a group of small coral islands in the Arabian Sea.', 'लक्षद्वीप अरब सागर में छोटे प्रवाल द्वीपों का समूह है।']
    },
    {
      id: 'punjab', type: 'state', accept: ['PB'],
      clue: ['This alluvial plain grows a great deal of wheat. Find Punjab.', 'इस जलोढ़ मैदान में बहुत गेहूँ उगता है। पंजाब खोजो।'],
      hint: ['Look in the north-west, south of Jammu and Kashmir.', 'उत्तर-पश्चिम में देखो, जम्मू और कश्मीर के दक्षिण में।'],
      why: ['Rivers have built a deep alluvial plain across Punjab.', 'नदियों ने पंजाब में गहरा जलोढ़ मैदान बनाया है।']
    },
    {
      id: 'jharkhand', type: 'state', accept: ['JH'],
      clue: ['This state lies on the Chota Nagpur Plateau and has red soil. Find Jharkhand.', 'यह राज्य छोटा नागपुर पठार पर बसा है और यहाँ लाल मिट्टी है। झारखंड खोजो।'],
      hint: ['Look in the east, between Bihar and Odisha.', 'पूर्व में देखो, बिहार और ओडिशा के बीच।'],
      why: ['The very old rocks of the Chota Nagpur Plateau have weathered into red soil.', 'छोटा नागपुर पठार की बहुत पुरानी चट्टानों के टूटने से लाल मिट्टी बनी है।']
    }
  ];

  // ------------------------------------------------------------------
  // Texture samples for "Name the texture"
  // ------------------------------------------------------------------
  D.textures = [
    {
      id: 'sandy',
      clues: [
        ['Feels gritty between the fingers', 'उँगलियों के बीच खुरदरी लगती है'],
        ['Falls apart when you squeeze it', 'मुट्ठी में दबाने पर बिखर जाती है'],
        ['Water runs straight through', 'पानी सीधा निकल जाता है']
      ],
      why: ['Big grains leave big gaps. That is why sandy soil feels gritty, will not hold a shape and drains fast.', 'बड़े दानों के बीच बड़ी जगहें होती हैं। इसीलिए बलुई मिट्टी खुरदरी लगती है, आकार नहीं लेती और पानी जल्दी निकाल देती है।']
    },
    {
      id: 'clayey',
      clues: [
        ['Feels smooth and sticky when wet', 'गीली होने पर चिकनी और चिपचिपी लगती है'],
        ['Can be rolled into a long ribbon', 'इसे बेलकर लंबी पट्टी बनाई जा सकती है'],
        ['Water passes through very slowly', 'पानी बहुत धीरे निकलता है']
      ],
      why: ['Tiny clay particles cling together. So clayey soil can be shaped, and water moves through it slowly.', 'चिकनी मिट्टी के नन्हे कण आपस में चिपके रहते हैं। इसलिए इसे आकार दिया जा सकता है, और पानी इसमें से धीरे गुज़रता है।']
    },
    {
      id: 'loamy',
      clues: [
        ['Feels soft and crumbly', 'नरम और भुरभुरी लगती है'],
        ['Makes a ball that breaks when pressed', 'गोला बन जाता है, जो दबाने पर टूट जाता है'],
        ['Holds water but lets the extra drain', 'पानी रोकती है, पर फालतू पानी निकल जाने देती है']
      ],
      why: ['Loam is a mix of sand, silt and clay with humus. It holds water yet still drains, so most crops grow well in it.', 'दोमट में रेत, गाद, चिकनी मिट्टी और ह्यूमस का मेल होता है। यह पानी रोकती भी है और निकलने भी देती है, इसलिए इसमें अधिकतर फ़सलें अच्छी होती हैं।']
    }
  ];

  // ------------------------------------------------------------------
  // Detective quiz. kind says what the options are:
  //   soil   ids of soils        tex   sandy / clayey / loamy
  //   tf     true / false        text  options written out in `opts`
  // ------------------------------------------------------------------
  D.questions = [
    { id: 'img-black', type: 'image', kind: 'soil', image: 'black', q: ['Which soil is this?', 'यह कौन-सी मिट्टी है?'], opts: ['black', 'arid', 'alluvial'], answer: 'black', why: ['Dark clay that cracks widely as it dries is black soil.', 'गहरे रंग की चिकनी मिट्टी, जो सूखने पर चौड़ी दरारों में फटती है, काली मिट्टी है।'] },
    { id: 'img-laterite', type: 'image', kind: 'soil', image: 'laterite', q: ['Which soil is this?', 'यह कौन-सी मिट्टी है?'], opts: ['forest', 'laterite', 'alluvial'], answer: 'laterite', why: ['Rusty colour, small holes and hard lumps are signs of laterite soil.', 'ज़ंग जैसा रंग, छोटे छिद्र और कठोर गाँठें लैटेराइट मिट्टी की पहचान हैं।'] },
    { id: 'img-arid', type: 'image', kind: 'soil', image: 'arid', q: ['Which soil is this?', 'यह कौन-सी मिट्टी है?'], opts: ['black', 'forest', 'arid'], answer: 'arid', why: ['Pale loose sand with wind ripples is arid soil.', 'हवा की लहरों वाली हल्के रंग की ढीली रेत शुष्क मिट्टी है।'] },
    { id: 'img-forest', type: 'image', kind: 'soil', image: 'forest', q: ['Which soil is this?', 'यह कौन-सी मिट्टी है?'], opts: ['arid', 'forest', 'red'], answer: 'forest', why: ['A dark top layer with leaves, twigs and stones is forest soil.', 'पत्तियों, टहनियों और पत्थरों वाली गहरी ऊपरी परत वन मिट्टी है।'] },

    { id: 'tf-colour', type: 'tf', kind: 'tf', q: ['A darker soil is always more fertile than a lighter one.', 'गहरे रंग की मिट्टी हमेशा हल्के रंग की मिट्टी से अधिक उपजाऊ होती है।'], opts: ['true', 'false'], answer: 'false', why: ['Colour alone cannot tell us. Fertility depends on nutrients, humus, water and more.', 'केवल रंग से पता नहीं चलता। उपजाऊपन पोषक तत्वों, ह्यूमस, पानी और दूसरी बातों पर निर्भर है।'] },
    { id: 'tf-alluvial', type: 'tf', kind: 'tf', q: ['Alluvial soil is the same mix of sand, silt and clay everywhere.', 'जलोढ़ मिट्टी में रेत, गाद और चिकनी मिट्टी का मेल हर जगह एक जैसा होता है।'], opts: ['true', 'false'], answer: 'false', why: ['The mix changes from place to place, depending on what the river dropped there.', 'यह मेल जगह-जगह बदलता है, इस पर निर्भर कि नदी ने वहाँ क्या छोड़ा।'] },
    { id: 'tf-clay', type: 'tf', kind: 'tf', q: ['Clay particles are smaller than sand grains.', 'चिकनी मिट्टी के कण रेत के दानों से छोटे होते हैं।'], opts: ['true', 'false'], answer: 'true', why: ['Clay is the smallest soil particle. Sand is the largest.', 'चिकनी मिट्टी का कण सबसे छोटा होता है। रेत का दाना सबसे बड़ा।'] },
    { id: 'tf-mountain', type: 'tf', kind: 'tf', q: ['Mountain soil is the same on every slope.', 'पर्वतीय मिट्टी हर ढलान पर एक जैसी होती है।'], opts: ['true', 'false'], answer: 'false', why: ['It changes with height and slope: loamy in valleys, coarse and stony higher up.', 'यह ऊँचाई और ढलान के साथ बदलती है: घाटियों में दोमट, ऊपर मोटी और पथरीली।'] },
    { id: 'tf-nutrient', type: 'tf', kind: 'tf', q: ['Every mineral found in soil is food for plants.', 'मिट्टी में मिलने वाला हर खनिज पौधों का भोजन है।'], opts: ['true', 'false'], answer: 'false', why: ['Soil holds many minerals. Nutrients are only the part that plants can take in with water.', 'मिट्टी में कई खनिज होते हैं। पोषक तत्व केवल वह भाग हैं जिसे पौधे पानी के साथ ले सकते हैं।'] },

    { id: 'prop-water', type: 'property', kind: 'soil', q: ['Which soil holds the most water and cracks as it dries?', 'कौन-सी मिट्टी सबसे अधिक पानी रोकती है और सूखने पर फट जाती है?'], opts: ['arid', 'black', 'red'], answer: 'black', why: ['Black soil is rich in clay, which swells when wet and shrinks when dry.', 'काली मिट्टी में चिकनी मिट्टी भरपूर होती है, जो गीली होने पर फूलती और सूखने पर सिकुड़ती है।'] },
    { id: 'prop-leach', type: 'property', kind: 'soil', q: ['Which soil forms by strong leaching where it is hot and very rainy?', 'कौन-सी मिट्टी गरम और बहुत वर्षा वाली जगहों पर तेज़ निक्षालन से बनती है?'], opts: ['laterite', 'alluvial', 'arid'], answer: 'laterite', why: ['Heavy rain washes minerals down, leaving iron and aluminium oxides behind.', 'भारी वर्षा खनिजों को नीचे बहा देती है, और आयरन व एल्युमिनियम ऑक्साइड बचे रह जाते हैं।'] },
    { id: 'prop-river', type: 'property', kind: 'soil', q: ['Which soil is laid down, layer by layer, by rivers?', 'कौन-सी मिट्टी नदियों द्वारा परत-दर-परत बिछाई जाती है?'], opts: ['forest', 'red', 'alluvial'], answer: 'alluvial', why: ['Rivers drop sand, silt and clay on their plains and deltas.', 'नदियाँ अपने मैदानों और डेल्टाओं में रेत, गाद और चिकनी मिट्टी छोड़ती हैं।'] },
    { id: 'prop-oxides', type: 'property', kind: 'text', q: ['What is left behind in laterite soil after leaching?', 'निक्षालन के बाद लैटेराइट मिट्टी में क्या बचा रहता है?'], opts: [{ id: 'a', label: ['Iron and aluminium oxides', 'आयरन और एल्युमिनियम ऑक्साइड'] }, { id: 'b', label: ['Humus and leaves', 'ह्यूमस और पत्तियाँ'] }, { id: 'c', label: ['Salt and lime', 'नमक और चूना'] }], answer: 'a', why: ['Iron and aluminium oxides do not wash away easily, so they stay and give the rusty colour.', 'आयरन और एल्युमिनियम ऑक्साइड आसानी से नहीं बहते, इसलिए बचे रहते हैं और ज़ंग जैसा रंग देते हैं।'] },

    { id: 'sit-ganga', type: 'situation', kind: 'soil', q: ['A farmer beside the Ganga grows rice and wheat. Which soil is most likely in the fields?', 'गंगा के किनारे एक किसान धान और गेहूँ उगाता है। खेतों में कौन-सी मिट्टी होने की सबसे अधिक संभावना है?'], opts: ['alluvial', 'laterite', 'arid'], answer: 'alluvial', why: ['The Ganga has built a wide alluvial plain that suits rice and wheat.', 'गंगा ने चौड़ा जलोढ़ मैदान बनाया है, जो धान और गेहूँ के लिए उपयुक्त है।'] },
    { id: 'sit-dry', type: 'situation', kind: 'soil', q: ["Reena's village gets very little rain. The soil is pale, loose and sandy. Which soil is it most likely to be?", 'रीना के गाँव में बहुत कम वर्षा होती है। मिट्टी हल्के रंग की, ढीली और रेतीली है। यह कौन-सी मिट्टी हो सकती है?'], opts: ['black', 'arid', 'forest'], answer: 'arid', why: ['Dry weather and loose sand point to arid soil.', 'सूखा मौसम और ढीली रेत शुष्क मिट्टी की ओर इशारा करते हैं।'] },
    { id: 'sit-loam', type: 'situation', kind: 'tex', q: ['A gardener wants soil that holds water but does not stay flooded. Which texture is best?', 'एक माली को ऐसी मिट्टी चाहिए जो पानी रोके पर जलभराव न हो। कौन-सी बनावट सबसे अच्छी है?'], opts: ['sandy', 'clayey', 'loamy'], answer: 'loamy', why: ['Loam holds water and still drains, because it mixes sand, silt and clay.', 'दोमट पानी रोकती है और निकलने भी देती है, क्योंकि इसमें रेत, गाद और चिकनी मिट्टी का मेल है।'] },
    { id: 'sit-tea', type: 'situation', kind: 'soil', q: ['A tea garden stands on a hot, very rainy hillside in the Western Ghats. The soil is rusty red and full of holes. Which soil is it?', 'पश्चिमी घाट की गरम, बहुत वर्षा वाली ढलान पर चाय का बागान है। मिट्टी ज़ंग जैसी लाल और छिद्रों से भरी है। यह कौन-सी मिट्टी है?'], opts: ['alluvial', 'black', 'laterite'], answer: 'laterite', why: ['Heat and heavy rain cause leaching, which forms laterite soil.', 'गरमी और भारी वर्षा से निक्षालन होता है, जिससे लैटेराइट मिट्टी बनती है।'] },

    { id: 'mys-black', type: 'mystery', kind: 'soil', q: ['Who am I?', 'मैं कौन हूँ?'], clues: [['I formed from lava rock.', 'मैं लावा चट्टान से बनी हूँ।'], ['I am sticky when wet.', 'गीली होने पर मैं चिपचिपी हो जाती हूँ।'], ['Farmers grow cotton on me.', 'किसान मुझ पर कपास उगाते हैं।']], opts: ['red', 'black', 'laterite'], answer: 'black', why: ['Black soil formed from Deccan lava. It is clay-rich and well known for cotton.', 'काली मिट्टी दक्कन के लावा से बनी। इसमें चिकनी मिट्टी भरपूर है और यह कपास के लिए जानी जाती है।'] },
    { id: 'mys-forest', type: 'mystery', kind: 'soil', q: ['Who am I?', 'मैं कौन हूँ?'], clues: [['I am found on hills, under trees.', 'मैं पहाड़ियों पर, पेड़ों के नीचे मिलती हूँ।'], ['My top layer is dark with rotted leaves.', 'मेरी ऊपरी परत सड़ी पत्तियों से गहरे रंग की है।'], ['I change with height and slope.', 'मैं ऊँचाई और ढलान के साथ बदलती हूँ।']], opts: ['forest', 'arid', 'alluvial'], answer: 'forest', why: ['Forest and mountain soil has a humus-rich top layer and differs from slope to slope.', 'वन और पर्वतीय मिट्टी की ऊपरी परत ह्यूमस से भरपूर होती है और यह ढलान-ढलान पर अलग होती है।'] },
    { id: 'mys-red', type: 'mystery', kind: 'soil', q: ['Who am I?', 'मैं कौन हूँ?'], clues: [['I formed from very old, hard rocks.', 'मैं बहुत पुरानी, कठोर चट्टानों से बनी हूँ।'], ['Iron oxides give me my colour.', 'आयरन ऑक्साइड मुझे मेरा रंग देते हैं।'], ['Where I hold water in my iron, I look yellow.', 'जहाँ मेरे लोहे में पानी जुड़ा हो, वहाँ मैं पीली दिखती हूँ।']], opts: ['black', 'alluvial', 'red'], answer: 'red', why: ['Red and yellow soil gets its colour from iron oxides.', 'लाल और पीली मिट्टी को उसका रंग आयरन ऑक्साइड से मिलता है।'] },

    { id: 'map-arid', type: 'map', kind: 'soil', map: ['RJ'], q: ['Which soil covers the largest area in the highlighted state?', 'उभारे गए राज्य में कौन-सी मिट्टी सबसे बड़े क्षेत्र में फैली है?'], opts: ['arid', 'laterite', 'forest'], answer: 'arid', why: ['This is Rajasthan, home of the Thar Desert.', 'यह राजस्थान है, थार मरुस्थल का घर।'] },
    { id: 'map-alluvial', type: 'map', kind: 'soil', map: ['PB', 'HR', 'UP', 'BR', 'WB'], q: ['Which soil covers wide areas across these highlighted states?', 'इन उभारे गए राज्यों में कौन-सी मिट्टी बड़े भाग में फैली है?'], opts: ['red', 'alluvial', 'laterite'], answer: 'alluvial', why: ['These states lie on the northern plains, built by rivers from the Himalaya.', 'ये राज्य उत्तरी मैदानों में हैं, जिन्हें हिमालय से आने वाली नदियों ने बनाया है।'] },
    { id: 'map-black', type: 'map', kind: 'soil', map: ['MH', 'MP', 'GJ'], q: ['Which soil covers wide areas across these highlighted states?', 'इन उभारे गए राज्यों में कौन-सी मिट्टी बड़े भाग में फैली है?'], opts: ['black', 'forest', 'arid'], answer: 'black', why: ['These states lie on the Deccan lava plateau, the home of black soil.', 'ये राज्य दक्कन के लावा पठार पर हैं, जो काली मिट्टी का घर है।'] },
    { id: 'map-forest', type: 'map', kind: 'soil', map: ['JK', 'LA', 'HP', 'UK', 'SK', 'AR'], q: ['Which soil is found across these highlighted regions?', 'इन उभारे गए क्षेत्रों में कौन-सी मिट्टी मिलती है?'], opts: ['arid', 'black', 'forest'], answer: 'forest', why: ['These regions lie in the Himalaya, where forest and mountain soils are found.', 'ये क्षेत्र हिमालय में हैं, जहाँ वन और पर्वतीय मिट्टी मिलती है।'] }
  ];

  /** The order of question styles in one quiz, so that every quiz is varied. */
  D.quizPattern = ['image', 'tf', 'property', 'map', 'situation', 'mystery', 'tf', 'image'];
})();
