/**
 * IT Giant Simulator — Localization (i18n) RU+EN
 */
(function(){'use strict';window.ITG=window.ITG||{};
const dict={
en:{
'hud.week':'WEEK','hud.cash':'CASH','hud.rep':'REP','hud.nextWeek':'Next Week','hud.settings':'Settings',
'nav.dashboard':'Dashboard','nav.products':'Products','nav.rnd':'R&D','nav.hr':'HR','nav.market':'Market','nav.finance':'Finance','nav.achievements':'Achievements',
'ach.title':'Achievements','ach.unlocked':'Unlocked','ach.locked':'Locked','ach.reward':'Reward',
'settings.title':'Settings','settings.sound':'Sound Effects','settings.graphics':'Graphics Quality','settings.graphicsLow':'Low','settings.graphicsMedium':'Medium','settings.graphicsHigh':'High',
'start.kicker':'BUSINESS SIMULATOR','start.title':'IT Giant','start.subtitle':'Build the next technology empire.','start.continue':'Continue Game','start.new':'New Game','start.settings':'Settings',
'settings.music':'Background Music','settings.volume':'Volume','settings.language':'Language','settings.close':'Close','settings.saveNow':'Save Now','settings.resetGame':'Reset Game','settings.howToPlay':'How to Play',
'settings.confirmReset':'Are you sure? This deletes your save and starts a new game.','settings.saved':'Game saved!','settings.reset':'Game reset. Starting fresh...',
'howto.title':'How to Play','howto.step1':'1. Design a PC in Products using the 3D Constructor.','howto.step2':'2. Launch it to the market.','howto.step3':'3. Invest in R&D to unlock components.','howto.step4':'4. Hire staff to grow your company.','howto.step5':'5. Press Next Week to simulate.','howto.step6':'6. Win: reach 60% market share + $50M. Avoid bankruptcy!',
'game.victory':'VICTORY!','game.victoryDesc':'You dominate the PC market. Congratulations!','game.continue':'Continue Playing','game.defeat':'GAME OVER','game.defeatDesc':'Your company went bankrupt. Try again!','game.newGame':'New Game',
'game.bankruptWarn':'WARNING: Running out of money! {weeks} weeks to recover.','game.bankruptWarnCritical':'CRITICAL: Bankruptcy imminent!',
'toast.welcome':'Welcome to IT Giant Simulator! Design your first PC in Products.','toast.deviceSaved':'Device saved! Go to Products to launch it.',
// ── Dashboard ──
'dash.companyValuation':'Company Valuation','dash.assetsPotential':'▲ Assets & Potential','dash.weeklyProfit':'Weekly Profit / Loss','dash.weeklyIncome':'Weekly Income','dash.weeklyExpenses':'Weekly Expenses',
'dash.marketShare':'Market Share','dash.brandAwareness':'Brand Awareness','dash.in':'In:','dash.ex':'Ex:',
'dash.activeProducts':'Active Products','dash.live':'Live','dash.newProduct':'+ New Product','dash.noActiveProducts':'No active products','dash.designFirst':'Design and assemble your first computer to start generating revenue.','dash.launchFirst':'Launch First Product',
'dash.onMarket':'🟢 On Market','dash.inDev':'🟡 In Dev','dash.declining':'🔴 Declining','dash.sales':'Sales:','dash.unitsWk':'units/wk','dash.price':'Price:','dash.progressToPeak':'Progress to Peak Sales',
'dash.competitorIntel':'Competitor Intelligence','dash.liveAI':'Live AI','dash.share':'% Share','dash.techNews':'Tech Industry News & Events','dash.chronological':'Chronological','dash.noNews':'No recent news events. Advance the week to view industry updates.','dash.recent':'Recent',
// ── Products ──
'prod.portfolio':'Products Portfolio','prod.portfolioDesc':'Manage pricing, marketing campaigns, life cycles, and design new computers.','prod.newProduct':'✨ + New Product',
'prod.noProducts':'No Products in Catalog','prod.noProductsDesc':'Your engineering and design team is ready. Launch the 3D PC Constructor to combine motherboards, processors, graphics, and chassis into your debut flagship.','prod.designFirst':'+ Design Your First PC',
'prod.discontinued':'🔴 Discontinued','prod.development':'🟡 Development','prod.overallQuality':'Overall Quality','prod.score':'% Score','prod.totalSold':'Total Sold:','prod.units':'units','prod.weeklySales':'Weekly Sales:','prod.wk':'/wk','prod.totalRevenue':'Total Revenue:','prod.retailPrice':'Retail Price:',
'prod.viewDetails':'👁️ View Details','prod.discontinue':'🛑 Discontinue','prod.desktopGaming':'Desktop Gaming','prod.pc':'PC',
// ── 3D Editor ──
'editor.title':'🛠️ 3D Device Architect','editor.pcBuild':'PC Build','editor.architecture':'Architecture','editor.close':'Close Editor',
'editor.dragRotate':'🖱️ Drag: Rotate','editor.rightPan':'🖱️ Right-drag: Pan','editor.scrollZoom':'⚙️ Scroll: Zoom','editor.clickDrag':'📦 Click or Drag parts to slots',
'editor.saveLaunch':'Save & Launch Device','editor.assemblyAnalysis':'Assembly Analysis','editor.performance':'Performance','editor.thermal':'Thermal','editor.buildQuality':'Build Quality',
'editor.cogs':'COGS:','editor.defectRate':'Defect Rate:','editor.pressScore':'Est. Press Score:',
'editor.housing':'Housing','editor.aluminum':'Aluminum','editor.carbonFiber':'Carbon Fiber','editor.mattePlastic':'Matte Plastic',
'editor.color':'Color','editor.metalness':'Metalness','editor.roughness':'Roughness','editor.rgbLighting':'RGB Lighting',
'editor.type':'Type','editor.tdp':'TDP','editor.cost':'Cost','editor.socket':'Socket','editor.coolerRating':'Cooler Rating','editor.psuCapacity':'PSU Capacity',
'editor.slotType':'Slot Type','editor.emptySlot':'Empty slot. Click an item in the catalog to install it here.','editor.systemArch':'System Architecture','editor.partsInstalled':'Parts Installed',
'editor.clickToInspect':'Click any 3D component or snap slot to inspect specifications.','editor.allCompatible':'✅ All components compatible',
'editor.uninstall':'Uninstall','editor.installed':'Installed','editor.install':'Install','editor.missingComponents':'Missing essential components: ','editor.mustInstall':' must be installed!',
'editor.socketCompat':'Socket {socket}: Compatible','editor.socketMismatch':'CPU socket ({cpu}) ≠ Motherboard ({mb})','editor.tdpExceeds':'Total TDP {total}W exceeds cooler capacity {max}W','editor.tdpNearLimit':'Cooling near limit ({percent}%)','editor.tdpWithin':'TDP: Within cooling capacity ({total}W / {max}W)',
'editor.psuInsufficient':'PSU {wattage}W insufficient for system TDP {total}W','editor.psuLoad':'PSU {wattage}W (Est. Load: {percent}%)','editor.noMotherboard':'Motherboard: No motherboard installed','editor.noCpu':'CPU: No CPU installed','editor.noRam':'RAM: No RAM installed yet',
'editor.cpuSocket':'CPU Socket','editor.pcieSlot':'PCIe x16','editor.ddrSlot1':'DDR5 Slot 1','editor.ddrSlot2':'DDR5 Slot 2','editor.nvmeSlot':'M.2 NVMe','editor.cpuCooler':'CPU Cooler','editor.psuBay':'PSU Bay','editor.motherboard':'Motherboard',
'editor.tier':'Tier','editor.watts':'W'
},
ru:{
'hud.week':'НЕДЕЛЯ','hud.cash':'КАССА','hud.rep':'РЕП','hud.nextWeek':'След. неделя','hud.settings':'Настройки',
'nav.dashboard':'Панель','nav.products':'Продукты','nav.rnd':'НИОКР','nav.hr':'Кадры','nav.market':'Рынок','nav.finance':'Финансы','nav.achievements':'Достижения',
'ach.title':'Достижения','ach.unlocked':'Получено','ach.locked':'Заблокировано','ach.reward':'Награда',
'settings.title':'Настройки','settings.sound':'Звуковые эффекты','settings.graphics':'Качество графики','settings.graphicsLow':'Низкое','settings.graphicsMedium':'Среднее','settings.graphicsHigh':'Высокое',
'start.kicker':'БИЗНЕС-СИМУЛЯТОР','start.title':'IT Giant','start.subtitle':'Постройте следующую технологическую империю.','start.continue':'Продолжить игру','start.new':'Новая игра','start.settings':'Настройки',
'settings.music':'Фоновая музыка','settings.volume':'Громкость','settings.language':'Язык','settings.close':'Закрыть','settings.saveNow':'Сохранить','settings.resetGame':'Сбросить игру','settings.howToPlay':'Как играть',
'settings.confirmReset':'Вы уверены? Это удалит сохранение и начнёт новую игру.','settings.saved':'Игра сохранена!','settings.reset':'Игра сброшена. Начинаем заново...',
'howto.title':'Как играть','howto.step1':'1. Спроектируйте ПК в разделе «Продукты» через 3D-конструктор.','howto.step2':'2. Выпустите продукт на рынок.','howto.step3':'3. Инвестируйте в НИОКР для открытия компонентов.','howto.step4':'4. Нанимайте сотрудников.','howto.step5':'5. Нажимайте «След. неделя» для симуляции.','howto.step6':'6. Победа: 60% рынка + $50 млн. Не обанкротиться!',
'game.victory':'ПОБЕДА!','game.victoryDesc':'Вы доминируете на рынке ПК. Поздравляем!','game.continue':'Продолжить игру','game.defeat':'КОНЕЦ ИГРЫ','game.defeatDesc':'Ваша компания обанкротилась. Попробуйте снова!','game.newGame':'Новая игра',
'game.bankruptWarn':'ВНИМАНИЕ: деньги заканчиваются! Осталось {weeks} недель.','game.bankruptWarnCritical':'КРИТИЧНО: банкротство неизбежно!',
'toast.welcome':'Добро пожаловать в IT Giant Simulator! Спроектируйте первый ПК в «Продукты».','toast.deviceSaved':'Устройство сохранено! Перейдите в «Продукты» для запуска.',
// ── Панель ──
'dash.companyValuation':'Оценка компании','dash.assetsPotential':'▲ Активы и потенциал','dash.weeklyProfit':'Прибыль / Убыток за неделю','dash.weeklyIncome':'Еженедельный доход','dash.weeklyExpenses':'Еженедельные расходы',
'dash.marketShare':'Доля рынка','dash.brandAwareness':'Узнаваемость бренда','dash.in':'Доход:','dash.ex':'Расход:',
'dash.activeProducts':'Активные продукты','dash.live':'Активны','dash.newProduct':'+ Новый продукт','dash.noActiveProducts':'Нет активных продуктов','dash.designFirst':'Спроектируйте и соберите первый компьютер, чтобы начать зарабатывать.','dash.launchFirst':'Запустить первый продукт',
'dash.onMarket':'🟢 В продаже','dash.inDev':'🟡 В разработке','dash.declining':'🔴 Падение спроса','dash.sales':'Продажи:','dash.unitsWk':'шт/нед','dash.price':'Цена:','dash.progressToPeak':'Прогресс до пика продаж',
'dash.competitorIntel':'Разведка конкурентов','dash.liveAI':'ИИ в реальном времени','dash.share':'% доля','dash.techNews':'Новости и события индустрии','dash.chronological':'Хронология','dash.noNews':'Нет свежих новостей. Перейдите к следующей неделе, чтобы увидеть обновления.','dash.recent':'Недавно',
// ── Продукты ──
'prod.portfolio':'Портфель продуктов','prod.portfolioDesc':'Управляйте ценами, маркетингом, жизненным циклом и создавайте новые компьютеры.','prod.newProduct':'✨ + Новый продукт',
'prod.noProducts':'Нет продуктов в каталоге','prod.noProductsDesc':'Ваша команда инженеров и дизайнеров готова. Запустите 3D-конструктор ПК, чтобы объединить материнские платы, процессоры, видеокарты и корпуса в ваш первый флагман.','prod.designFirst':'+ Спроектировать первый ПК',
'prod.discontinued':'🔴 Снят с производства','prod.development':'🟡 В разработке','prod.overallQuality':'Общее качество','prod.score':'% оценка','prod.totalSold':'Всего продано:','prod.units':'шт','prod.weeklySales':'Продажи в неделю:','prod.wk':'/нед','prod.totalRevenue':'Общая выручка:','prod.retailPrice':'Розничная цена:',
'prod.viewDetails':'👁️ Подробности','prod.discontinue':'🛑 Снять с продажи','prod.desktopGaming':'Игровой десктоп','prod.pc':'ПК',
// ── 3D-редактор ──
'editor.title':'🛠️ 3D-конструктор ПК','editor.pcBuild':'Сборка ПК','editor.architecture':'Архитектура','editor.close':'Закрыть редактор',
'editor.dragRotate':'🖱️ Тащить: вращение','editor.rightPan':'🖱️ ПКМ-тащить: панорама','editor.scrollZoom':'⚙️ Колесо: масштаб','editor.clickDrag':'📦 Кликните или перетащите детали в слоты',
'editor.saveLaunch':'Сохранить и запустить','editor.assemblyAnalysis':'Анализ сборки','editor.performance':'Производительность','editor.thermal':'Охлаждение','editor.buildQuality':'Качество сборки',
'editor.cogs':'СЕБЕСТ.:','editor.defectRate':'Уровень брака:','editor.pressScore':'Оценка прессы:',
'editor.housing':'Корпус','editor.aluminum':'Алюминий','editor.carbonFiber':'Карбон','editor.mattePlastic':'Матовый пластик',
'editor.color':'Цвет','editor.metalness':'Металличность','editor.roughness':'Шероховатость','editor.rgbLighting':'RGB-подсветка',
'editor.type':'Тип','editor.tdp':'TDP','editor.cost':'Цена','editor.socket':'Сокет','editor.coolerRating':'Мощность кулера','editor.psuCapacity':'Мощность БП',
'editor.slotType':'Тип слота','editor.emptySlot':'Пустой слот. Кликните элемент в каталоге, чтобы установить его сюда.','editor.systemArch':'Архитектура системы','editor.partsInstalled':'Установлено деталей',
'editor.clickToInspect':'Кликните любую 3D-деталь или слот, чтобы посмотреть характеристики.','editor.allCompatible':'✅ Все компоненты совместимы',
'editor.uninstall':'Убрать','editor.installed':'Установлено','editor.install':'Установить','editor.missingComponents':'Не хватает обязательных компонентов: ','editor.mustInstall':' должны быть установлены!',
'editor.socketCompat':'Сокет {socket}: совместим','editor.socketMismatch':'Сокет CPU ({cpu}) ≠ материнская плата ({mb})','editor.tdpExceeds':'Суммарный TDP {total}Вт превышает мощность кулера {max}Вт','editor.tdpNearLimit':'Охлаждение на пределе ({percent}%)','editor.tdpWithin':'TDP: в пределах мощности кулера ({total}Вт / {max}Вт)',
'editor.psuInsufficient':'БП {wattage}Вт недостаточен для TDP системы {total}Вт','editor.psuLoad':'БП {wattage}Вт (нагрузка: {percent}%)','editor.noMotherboard':'Материнская плата: не установлена','editor.noCpu':'CPU: процессор не установлен','editor.noRam':'RAM: память не установлена',
'editor.cpuSocket':'Сокет CPU','editor.pcieSlot':'PCIe x16','editor.ddrSlot1':'DDR5 слот 1','editor.ddrSlot2':'DDR5 слот 2','editor.nvmeSlot':'M.2 NVMe','editor.cpuCooler':'Кулер CPU','editor.psuBay':'Отсек БП','editor.motherboard':'Материнская плата',
'editor.tier':'Уровень','editor.watts':'Вт'
}};
let cl='en';
function dl(){try{const s=localStorage.getItem('itg_lang');if(s&&dict[s])return s;}catch(e){}return(navigator.language||'en').toLowerCase().startsWith('ru')?'ru':'en';}
function init(){cl=dl();if(typeof document!=='undefined')applyTranslations();}
function setLanguage(l){if(!dict[l])return;cl=l;try{localStorage.setItem('itg_lang',l);}catch(e){}if(typeof document!=='undefined')applyTranslations();}
function getLanguage(){return cl;}
function getAvailableLanguages(){return Object.keys(dict);}
function applyTranslations(){
  const root=document;
  root.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(key) el.textContent=t(key);
  });
  root.querySelectorAll('[data-start-text]').forEach(el=>{
    const key=el.getAttribute('data-start-text');
    if(key) el.textContent=t('start.'+key);
  });
}
function t(k,p){const d=dict[cl]||dict.en;let r=d[k]||dict.en[k]||k;if(p)Object.keys(p).forEach(x=>{r=r.replace('{'+x+'}',p[x]);});return r;}
window.ITG.I18n={init,t,setLanguage,getLanguage,getAvailableLanguages,applyTranslations};
})();
