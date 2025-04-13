import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'nextjs',
  nodeVersion: '18',
  contentSources: [],
  presetSource: {
    type: 'files',
    presetDirs: ['.stackbit/presets'],
  },
  styleObjectModelName: 'ThemeStyle',
});
