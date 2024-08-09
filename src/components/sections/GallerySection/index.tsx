import * as React from 'react';
import type * as types from 'types';
import MuiGrid from '@mui/material/Grid';
import MuiBox from '@mui/material/Box';
import MuiCard from '@mui/material/Card';
import MuiCardMedia from '@mui/material/CardMedia';
import MuiTypography from '@mui/material/Typography';

export type GalleryProps = types.StackbitFieldPath & {
    images: Array<{
        url: string;
        alt: string;
        title?: string;
        description?: string;
    }>;
    title?: string;
    description?: string;
};

export const Gallery: React.FC<GalleryProps> = (props) => {
    const { images, title, description, 'data-sb-field-path': fieldPath } = props;

    return (
        <MuiBox sx={{ py: 6 }} data-sb-field-path={fieldPath}>
            {title && (
                <MuiTypography component="h2" variant="h4" align="center" sx={{ mb: 4 }} data-sb-field-path=".title">
                    {title}
                </MuiTypography>
            )}
            {description && (
                <MuiTypography component="p" variant="h6" align="center" sx={{ mb: 6 }} data-sb-field-path=".description">
                    {description}
                </MuiTypography>
            )}
            <MuiGrid container spacing={4} data-sb-field-path=".images">
                {images.map((image, index) => (
                    <MuiGrid item xs={12} sm={6} md={4} key={index} data-sb-field-path={`.${index}`}>
                        <MuiCard sx={{ height: '100%' }}>
                            <MuiCardMedia
                                component="img"
                                height="200"
                                image={image.url}
                                alt={image.alt}
                                data-sb-field-path=".url#@src .alt#@alt"
                            />
                            {image.title && (
                                <MuiBox sx={{ p: 2 }}>
                                    <MuiTypography variant="h6" component="p" data-sb-field-path=".title">
                                        {image.title}
                                    </MuiTypography>
                                    {image.description && (
                                        <MuiTypography variant="body2" color="text.secondary" data-sb-field-path=".description">
                                            {image.description}
                                        </MuiTypography>
                                    )}
                                </MuiBox>
                            )}
                        </MuiCard>
                    </MuiGrid>
                ))}
            </MuiGrid>
        </MuiBox>
    );
};
