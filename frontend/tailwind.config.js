/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'ioc-orange': '#F37021',
                'ioc-blue': '#003366',
            }
        },
    },
    plugins: [],
}
