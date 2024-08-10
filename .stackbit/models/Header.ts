import { Model } from '@stackbit/types';

export const Header: Model = {
    type: 'object',
    name: 'Header',
    label: 'Header',
    labelField: 'title',
    readOnly: true,
    fields: [
        { type: 'string', name: 'title', label: 'Title', default: 'Your Brand' },
        {
            type: 'list',
            name: 'navLinks',
            label: 'Navigation links',
            items: { type: 'model', models: ['Link'] },
            default: [
                { type: 'Link', label: 'Home', url: '/' },
                { type: 'Link', label: 'About', url: '/' }
            ]
        },
        {
            type: 'image',
            name: 'logoSrc',
            label: 'Logo Image',
            description: 'Upload a logo image to display next to the title'
        },
        {
            type: 'string',
            name: 'logoAlt',
            label: 'Logo Image Alt Text',
            description: 'Alt text for the logo image'
        },
        {
            type: 'string',
            name: 'height',
            label: 'Header Height',
            default: 'auto',
            description: 'Adjust the height of the header (e.g., "60px", "10vh", "auto")'
        }
    ]
};
