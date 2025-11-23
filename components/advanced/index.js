/**
 * Advanced Components Index
 * Export all advanced feature components
 */

export { TimeStretchPanel } from './TimeStretchPanel';
export { HumanizationPanel } from './HumanizationPanel';
export { ArrangementPanel } from './ArrangementPanel';

// Default export for convenience
export default {
  TimeStretchPanel: require('./TimeStretchPanel').TimeStretchPanel,
  HumanizationPanel: require('./HumanizationPanel').HumanizationPanel,
  ArrangementPanel: require('./ArrangementPanel').ArrangementPanel
};

