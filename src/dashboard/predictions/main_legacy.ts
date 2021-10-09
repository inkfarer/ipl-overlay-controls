import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';

library.add(faExclamationTriangle, faInfoCircle);
dom.watch();

import '../styles/globalStyles.css';
import '../styles/statusDisplay.css';

import '../helpers/buttonConfirm';

import './predictions.css';
import './predictions';
import './cancelPrediction';
import './lockPrediction';
