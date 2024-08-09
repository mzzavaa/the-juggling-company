import { Model } from '@stackbit/types';

export const AboutSection: Model = {
    type: 'object',
    name: 'AboutSection',
    label: 'About Section',
    fields: [
        { type: 'string', name: 'title', label: 'Title', required: true },
        { type: 'markdown', name: 'content', label: 'Content', required: true },
        { type: 'image', name: 'image', label: 'Image', required: false }
    ]
};
