import * as React from 'react';
import type * as types from 'types';
import { Markdown } from '../../atoms/Markdown';
import MuiBox from '@mui/material/Box';
import MuiGrid from '@mui/material/Grid';
import MuiTypography from '@mui/material/Typography';

export type Props = types.AboutSection & types.StackbitFieldPath;

export const AboutSection: React.FC<Props> = (props) => {
    const { title, text, image, 'data-sb-field-path': fieldPath } = props;

    return (
        <MuiBox sx={{ py: { xs: 6, sm: 10 } }} data-sb-field-path={fieldPath}>
            <MuiGrid container spacing={4}>
                {title && (
                    <MuiGrid item xs={12}>
                        <MuiTypography component="h2" variant="h4" color="text.primary" data-sb-field-path=".title" gutterBottom>
                            {title}
                        </MuiTypography>
                    </MuiGrid>
                )}
                {text && (
                    <MuiGrid item xs={12} md={image?.url ? 6 : 12}>
                        <MuiTypography component="div" color="text.secondary">
                            <Markdown text={text} data-sb-field-path=".text" />
                        </MuiTypography>
                    </MuiGrid>
                )}
                {image?.url && (
                    <MuiGrid item xs={12} md={text ? 6 : 12}>
                        <MuiBox
                            component="img"
                            sx={{
                                height: 'auto',
                                maxWidth: '100%',
                                width: '100%'
                            }}
                            alt={image?.altText}
                            src={image?.url}
                            data-sb-field-path=".image .image.url#@src .image.altText#@alt"
                        />
                    </MuiGrid>
                )}
            </MuiGrid>
        </MuiBox>
    );
};
