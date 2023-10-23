/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'apollo-blue-600': '#172038',
        'apollo-blue-500': '#253a5e',
        'apollo-blue-400': '#3c5e8b',
        'apollo-blue-300': '#4f8fba',
        'apollo-blue-200': '#73bed3',
        'apollo-blue-100': '#a4dddb',

        'apollo-green-600': '#19332d',
        'apollo-green-500': '#25562e',
        'apollo-green-400': '#468232',
        'apollo-green-300': '#75a743',
        'apollo-green-200': '#a8ca58',
        'apollo-green-100': '#d0da91',

        'apollo-brown-600': '#4d2b32',
        'apollo-brown-500': '#7a4841',
        'apollo-brown-400': '#ad7757',
        'apollo-brown-300': '#c09473',
        'apollo-brown-200': '#d7b594',
        'apollo-brown-100': '#e7d5b3',

        'apollo-yellow-600': '#341c27',
        'apollo-yellow-500': '#602c2c',
        'apollo-yellow-400': '#884b2b',
        'apollo-yellow-300': '#be772b',
        'apollo-yellow-200': '#de9e41',
        'apollo-yellow-100': '#e8c170',

        'apollo-red-600': '#241527',
        'apollo-red-500': '#411d31',
        'apollo-red-400': '#752438',
        'apollo-red-300': '#a53030',
        'apollo-red-200': '#cf573c',
        'apollo-red-100': '#da863e',

        'apollo-pink-600': '#1e1d39',
        'apollo-pink-500': '#402751',
        'apollo-pink-400': '#7a367b',
        'apollo-pink-300': '#a23e8c',
        'apollo-pink-200': '#c65197',
        'apollo-pink-100': '#df84a5',

        'apollo-grey-900': '#090a14',
        'apollo-grey-800': '#10141f',
        'apollo-grey-700': '#151d28',
        'apollo-grey-600': '#202e37',
        'apollo-grey-500': '#394a50',
        'apollo-grey-400': '#577277',
        'apollo-grey-300': '#819796',
        'apollo-grey-200': '#a8b5b2',
        'apollo-grey-100': '#c7cfcc',
        'apollo-grey-000': '#ebede9'
      }
    },
  },
  plugins: [],
}

