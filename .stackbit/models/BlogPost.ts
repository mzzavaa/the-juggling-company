import { Model } from '@stackbit/types';

export const BlogPost: Model = {
    type: 'object',
    name: 'BlogPost',
    label: 'Blog Post',
    fields: [
        { type: 'string', name: 'title', label: 'Title', required: true },
        { type: 'date', name: 'date', label: 'Publication Date', required: true },
        { type: 'markdown', name: 'content', label: 'Content', required: true },
    ]
};
