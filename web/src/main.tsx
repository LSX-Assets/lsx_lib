import '@mantine/carousel/styles.css';
import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';
import './scrollBar.css';
// After App, which pulls in dirk-cfx-react's stylesheet: the LSX faces have to
// be declared after the kit's Akrobat ones to take their place.
import './fonts/lsx.css';

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { useSettings } from 'dirk-cfx-react';
import type { MantineColorsTuple } from '@mantine/core';
import { lsxPalette } from './theme/lsx';
library.add(fas, far, fab);

// The kit starts on its own palette until GET_SETTINGS answers, and in a
// browser nothing answers at all. Start on the LSX defaults instead, the same
// values lsx_lib's settings ship with.
useSettings.setState({
  primaryColor: 'custom',
  primaryShade: 5,
  customTheme: [...lsxPalette] as unknown as MantineColorsTuple,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);




