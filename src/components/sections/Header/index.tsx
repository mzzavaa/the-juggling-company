import * as React from 'react';
import type * as types from 'types';
import { Link } from '../../atoms/Link';
import MuiAppBar from '@mui/material/AppBar';
import MuiBox from '@mui/material/Box';
import MuiToolbar from '@mui/material/Toolbar';
import MuiTypography from '@mui/material/Typography';

export type Props = types.Header & types.StackbitObjectId & {
    logoSrc?: string;
    logoAlt?: string;
    headerImageSrc?: string;  // New prop for additional image
    headerImageAlt?: string;  // Alt text for the additional image
};

export const Header: React.FC<Props> = (props) => {
    const { title, navLinks = [], 'data-sb-object-id': objectId, logoSrc, logoAlt, headerImageSrc, headerImageAlt } = props;
    const fieldPath = objectId ? `${objectId}:header` : null;
    return (
        <MuiAppBar position="static" color="transparent" elevation={0} data-sb-field-path={fieldPath}>
            <MuiToolbar disableGutters={true} sx={{ flexWrap: 'wrap' }}>
                {logoSrc && (
                    <MuiBox sx={{ mb: 1, mr: 2 }}>
                        <img src={logoSrc} alt={logoAlt} style={{ height: '40px' }} data-sb-field-path=".logo" />
                    </MuiBox>
                )}
                {headerImageSrc && (
                    <MuiBox sx={{ mb: 1, mr: 2 }}>
                        <img src={headerImageSrc} alt={headerImageAlt} style={{ height: '40px' }} data-sb-field-path=".headerImage" />
                    </MuiBox>
                )}
                {title && (
                    <MuiBox sx={{ mb: 1, mr: 2, flexGrow: 1 }}>
                        <MuiTypography component="p" variant="h6" color="text.primary" noWrap data-sb-field-path=".title">
                            {title}
                        </MuiTypography>
                    </MuiBox>
                )}
                {navLinks.length > 0 && (
                    <MuiBox component="nav" sx={{ display: 'flex', flexWrap: 'wrap' }} data-sb-field-path=".navLinks">
                        {navLinks.map((link, index) => (
                            <Link
                                key={index}
                                {...link}
                                sx={{
                                    ...(index !== navLinks.length - 1 && { mr: 2 }),
                                    mb: 1
                                }}
                                data-sb-field-path={`.${index}`}
                            />
                        ))}
                    </MuiBox>
                )}
            </MuiToolbar>
        </MuiAppBar>
    );
};
