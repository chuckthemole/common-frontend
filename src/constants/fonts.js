// Google Fonts with stylesheet URLs
export const google_fonts = [
    { name: "Nunito", value: "'Nunito', sans-serif", url: "https://fonts.googleapis.com/css?family=Nunito:400,700" },
    { name: "Roboto", value: "'Roboto', sans-serif", url: "https://fonts.googleapis.com/css?family=Roboto:400,700" },
    { name: "Lato", value: "'Lato', sans-serif", url: "https://fonts.googleapis.com/css?family=Lato:400,700" },
    { name: "Montserrat", value: "'Montserrat', sans-serif", url: "https://fonts.googleapis.com/css?family=Montserrat:400,700" },
    { name: "Open Sans", value: "'Open Sans', sans-serif", url: "https://fonts.googleapis.com/css?family=Open+Sans:400,700" },
    { name: "Poppins", value: "'Poppins', sans-serif", url: "https://fonts.googleapis.com/css?family=Poppins:400,700" },
    { name: "Raleway", value: "'Raleway', sans-serif", url: "https://fonts.googleapis.com/css?family=Raleway:400,700" },
    { name: "Merriweather", value: "'Merriweather', serif", url: "https://fonts.googleapis.com/css?family=Merriweather:400,700" },
    { name: "Playfair Display", value: "'Playfair Display', serif", url: "https://fonts.googleapis.com/css?family=Playfair+Display:400,700" },
    { name: "Source Sans Pro", value: "'Source Sans Pro', sans-serif", url: "https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700" },
    { name: "Ubuntu", value: "'Ubuntu', sans-serif", url: "https://fonts.googleapis.com/css?family=Ubuntu:400,700" },
    { name: "Work Sans", value: "'Work Sans', sans-serif", url: "https://fonts.googleapis.com/css?family=Work+Sans:400,700" },
    { name: "Inter", value: "'Inter', sans-serif", url: "https://fonts.googleapis.com/css?family=Inter:400,700" },
    { name: "Fira Sans", value: "'Fira Sans', sans-serif", url: "https://fonts.googleapis.com/css?family=Fira+Sans:400,700" },
    { name: "Inconsolata", value: "'Inconsolata', monospace", url: "https://fonts.googleapis.com/css?family=Inconsolata:400,700" },
    { name: "Courier Prime", value: "'Courier Prime', monospace", url: "https://fonts.googleapis.com/css?family=Courier+Prime:400,700" },
    { name: "PT Sans", value: "'PT Sans', sans-serif", url: "https://fonts.googleapis.com/css?family=PT+Sans:400,700" },
    { name: "PT Serif", value: "'PT Serif', serif", url: "https://fonts.googleapis.com/css?family=PT+Serif:400,700" },
    { name: "Oswald", value: "'Oswald', sans-serif", url: "https://fonts.googleapis.com/css?family=Oswald:400,700" },
    { name: "Zilla Slab", value: "'Zilla Slab', serif", url: "https://fonts.googleapis.com/css?family=Zilla+Slab:400,700" },
    {
        name: "Roboto Mono",
        value: "'Roboto Mono', monospace",
        url: "https://fonts.googleapis.com/css?family=Roboto+Mono:400,700"
    },
    {
        name: "Source Code Pro",
        value: "'Source Code Pro', monospace",
        url: "https://fonts.googleapis.com/css?family=Source+Code+Pro:400,700"
    },

];

// System fonts (pre-installed on most OS, no external URL needed)
export const system_fonts = [
    { name: "Arial", value: "Arial, Helvetica, sans-serif" },
    { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
    { name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
    { name: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
    { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Palatino", value: "'Palatino Linotype', Palatino, serif" },
    { name: "Courier New", value: "'Courier New', Courier, monospace" },
    { name: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
    { name: "Impact", value: "Impact, Charcoal, sans-serif" },
];

// Custom fonts
export const custom_fonts = [
    // Example: self-hosted font
    { name: "My Custom Font", value: "'MyCustomFont', sans-serif", url: "/fonts/mycustomfont.css" }
];

// Unified list for dropdowns (you can merge in your UI)
export const all_fonts = [
    ...google_fonts,
    ...system_fonts,
    ...custom_fonts,
];
