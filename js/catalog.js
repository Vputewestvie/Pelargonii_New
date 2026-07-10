document.addEventListener('alpine:init', () => {
    Alpine.data('catalogApp', () => ({
        plants: [], 
        groups: ['all'], 
        activeGroup: 'all', 
        searchQuery: '', // Поиск
        onlyInStock: false, 
        selectionList: [],
        
        async init() {
            try {
                const id = '1tr_vl_q8yh4grAmJkaD7QvmueQQvbJGojm7C_otpyd4';
                const res = await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json`);
                const text = await res.text();
                
                // ВОТ ИСПРАВЛЕНИЕ: Правильная очистка ответа Google
                const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                const json = JSON.parse(jsonString);

                this.plants = json.table.rows.slice(1).map((row, i) => {
                    const cells = row.c;
                    const getVal = (idx) => cells[idx] ? cells[idx].v : '';
                    return {
                        id: i,
                        number: getVal(0),
                        title: getVal(1),
                        stock: Number(getVal(2)) || 0,
                        latinTitle: getVal(3),
                        group: (getVal(4) || 'all').toLowerCase().trim(),
                        flowerSize: getVal(6),
                        inflorescenceSize: getVal(7),
                        price: Number(getVal(8)) || 0,
                        // Разбиваем ссылки на фото через символ |
                        media: (getVal(12) || '').split('|').map(s => s.trim()).filter(s => s)
                    };
                }).filter(p => p.title); // Загружаем только заполненные строки

                this.groups = ['all', ...new Set(this.plants.map(p => p.group))];
                
                // Включаем PhotoSwipe для слайдера (после загрузки карточек)
                this.$nextTick(async () => {
                    const module = await import('https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.3/photoswipe-lightbox.esm.min.js');
                    const PhotoSwipeLightbox = module.default;
                    const lightbox = new PhotoSwipeLightbox({
                        gallery: '.pswp-gallery',
                        children: 'a',
                        pswpModule: () => import('https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.3/photoswipe.esm.min.js')
                    });
                    lightbox.init();
                });

            } catch (e) {
                console.error("Ошибка загрузки данных:", e);
            }
        },

        // Возвращаем полноценные фильтры
        filteredPlants() {
            return this.plants.filter(p => {
                const mGroup = this.activeGroup === 'all' || p.group === this.activeGroup;
                const mStock = !this.onlyInStock || p.stock > 0;
                const mSearch = p.title.toLowerCase().includes(this.searchQuery.toLowerCase());
                return mGroup && mStock && mSearch;
            });
        },
        toggleSelection(p) { 
            const idx = this.selectionList.findIndex(item => item.id === p.id);
            idx > -1 ? this.selectionList.splice(idx, 1) : this.selectionList.push(p);
        },
        isSelected(p) { return this.selectionList.some(item => item.id === p.id); },
        
        // Корзина Авито
        copyForAvito() {
            let text = "Здравствуйте! Хочу заказать:\n\n";
            let sum = 0;
            this.selectionList.forEach(p => {
                text += `• №${p.number} ${p.title} (${p.price} ₽)\n`;
                sum += p.price;
            });
            text += `\nИтого: ${sum} ₽.`;
            navigator.clipboard.writeText(text).then(() => alert('Список скопирован! Вставьте его в Авито.'));
        }
    }));
});
