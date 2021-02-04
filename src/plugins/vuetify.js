import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify)

const vuetify = new Vuetify({
    theme: {
        themes: {
            options: {
                customProperties: true,
            },
            light: {
                primary: '#4A90E2',
                secondary: '#676686',
                light: '#F4FAFF',
                dark: '#000034',
                bg: '#ffffff',
            },
        },
    },
})

export default vuetify
