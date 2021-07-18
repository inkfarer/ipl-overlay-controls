import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';

library.add(faChevronLeft, faChevronRight, faPlus, faMinus);
dom.watch();

import './scores';
import './scoreboardData';
import './colorEditor';
import './colorToggles';
import './teamSelectors';

import '../styles/globalStyles.css';
import './scoring.css';
