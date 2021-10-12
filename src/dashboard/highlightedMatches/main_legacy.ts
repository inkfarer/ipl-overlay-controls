import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';

library.add(faExclamationTriangle, faInfoCircle);
dom.watch();

import '../components/multiSelect';

import '../styles/globalStyles_legacy.css';
import '../styles/statusDisplay.css';

import './matchData';
