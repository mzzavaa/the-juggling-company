import { Model } from '@stackbit/types';

export const BlogPostsSection: Model = {
    type: 'object',
    name: 'BlogPostsSection',
    label: 'Blog Posts',
    labelField: 'title',
    thumbnail: 'https://assets.stackbit.com/components/models/thumbnails/default.png',
    groups: ['sectionComponent'],
    fields: [
        { type: 'string', name: 'title', label: 'Title', default: 'Latest Blog Posts' },
        {
            type: 'list',
            name: 'posts',
            label: 'Posts',
            items: { type: 'model', models: ['BlogPost'] }
        }
    ]
};
