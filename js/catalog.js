import PhotoSwipeLightbox from 'https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.3/photoswipe-lightbox.esm.min.js';

document.addEventListener('alpine:init', () => {
    Alpine.data('catalogApp', () => ({
        plants: [], groups: ['all'], activeGroup: 'all', 
        onlyInStock: false, selectionList: [],
        
        async init() {
            const id = '1tr_vl_q8yh4grAmJkaD7QvmueQQvbJGojm7C_otpyd4';
            const res = await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json`);
            const json = await res.json();
            this.plants = json.table.rows.slice(1).map((row, i) => ({
                id: i, title: row.c[1]?.v, price: row.c[8]?.v,
                stock: row.c[2]?.v, group: (row.c[4]?.v || 'all').toLowerCase(),
                media: (row.c[12]?.v || 'https://via.placeholder.com/300').split('|')
            }));
            this.groups = ['all', ...new Set(this.plants.map(p => p.group))];
            
            // Инициализация PhotoSwipe после отрисовки
            this.$nextTick(() => {
                const lightbox = new PhotoSwipeLightbox({
                    gallery: '.pswp-gallery', children: 'a',
                    pswpModule: () => import('https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.3/photoswipe.esm.min.js')
                });
                lightbox.init();
            });
        },
        filteredPlants() {
            return this.plants.filter(p => (this.activeGroup === 'all' || p.group === this.activeGroup) && (!this.onlyInStock || p.stock > 0));
        },
        toggleSelection(p) { 
            const idx = this.selectionList.findIndex(item => item.id === p.id);
            idx > -1 ? this.selectionList.splice(idx, 1) : this.selectionList.push(p);
        },
        isSelected(p) { return this.selectionList.some(item => item.id === p.id); },
        copyForAvito() {
            const text = "Здравствуйте! Хочу заказать: " + this.selectionList.map(p => p.title).join(', ');
            navigator.clipboard.writeText(text).then(() => alert('Список скопирован!'));
        }
    }));
});
