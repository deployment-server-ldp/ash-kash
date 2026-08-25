import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.vue',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
                serif: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                ink: '#1b1815',
                cream: '#faf7f2',
                sand: '#f1e9dd',
                gold: {
                    50: '#faf6ec',
                    100: '#f2e8cf',
                    200: '#e4cd9b',
                    300: '#d5b06a',
                    400: '#c69847',
                    500: '#a8834f',
                    600: '#8a6a3d',
                    700: '#6c5230',
                    800: '#4f3b23',
                    900: '#332616',
                },
            },
            letterSpacing: {
                widest2: '0.2em',
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
