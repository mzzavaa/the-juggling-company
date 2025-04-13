import * as React from 'react';
import type * as types from 'types';
import { Button } from '../../atoms/Button';
import { Markdown } from '../../atoms/Markdown';

import MuiBox from '@mui/material/Box';
import MuiGrid from '@mui/material/Grid';
import MuiTypography from '@mui/material/Typography';

export type Props = types.BlogPostsSection & types.StackbitFieldPath;

export const BlogPostsSection: React.FC<Props> = (props) => {
    const { title, posts, 'data-sb-field-path': fieldPath } = props;

    return (
        <MuiBox sx={{ py: { xs: 6, sm: 10 } }} data-sb-field-path={fieldPath}>
            {title && (
                <MuiTypography component="h2" variant="h4" color="text.primary" data-sb-field-path=".title" gutterBottom>
                    {title}
                </MuiTypography>
            )}
            {Array.isArray(posts) && posts.map((post, index) => (
                <MuiGrid item xs={12} sm={6} md={4} key={index}>
                    <MuiBox>
                    <MuiTypography variant="h6" color="text.primary">
                        {post.title}
                    </MuiTypography>
                    </MuiBox>
                </MuiGrid>
            ))}

            {/* <MuiGrid container spacing={4} data-sb-field-path=".posts">
                {posts.map((post, index) => (
                    <MuiGrid item xs={12} sm={6} md={4} key={index} data-sb-field-path={`.${index}`}>
                        <MuiBox>
                            <MuiTypography variant="h6" color="text.primary" component="div">
                                {post.title}
                            </MuiTypography>
                            <MuiTypography variant="subtitle2" color="text.secondary">
                                {post.date}
                            </MuiTypography>
                            {post.content && (
                                <MuiTypography component="div" color="text.secondary" mt={1}>
                                    <Markdown text={post.content.slice(0, 100) + '...'} data-sb-field-path=".content" />
                                </MuiTypography>
                            )}
                            <Button
                                type="Button" 
                                label="Read More"
                                url={post.__url || '/default-url'}
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                data-sb-field-path={`.${index}.url`}
                            />
                        </MuiBox>
                    </MuiGrid>
                ))}
            </MuiGrid> */}
        </MuiBox>
    );
};
