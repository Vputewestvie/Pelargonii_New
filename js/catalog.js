document.addEventListener('alpine:init', () => {
    Alpine.data('catalogApp', () => ({
        spreadsheetId: '1tr_vl_q8yh4grAmJkaD7QvmueQQvbJGojm7C_otpyd4',
        plants: [],
        async init() {
            const res = await fetch(`https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:json`);
            const text = await res.text();
            const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
            this.plants = json.table.rows.slice(1).map((row, index) => ({
                id: index,
                title: row.c[1]?.v || 'Без названия',
                price: row.c[8]?.v || 0,
                media: (row.c[12]?.v || 'https://via.placeholder.com/300').split('|')
            }));
        }
    }));
});