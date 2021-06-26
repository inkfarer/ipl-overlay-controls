import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';

library.add(faChevronLeft, faChevronRight);
dom.watch();

import './scores';
import './scoreboardData';
import './colorEditor';
import './nextTeams';
import './colorToggles';

import '../styles/globalStyles.css';
import './scoring.css';
