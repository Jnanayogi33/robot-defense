// tutorial.ts — 5-step guided tutorial for Map 1-1
import { s } from './state';

const TUTORIAL_KEY = 'rd_tutorial_done_v1';

export function isTutorialDone(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) === 'true';
}

export function markTutorialDone(): void {
  localStorage.setItem(TUTORIAL_KEY, 'true');
}

// Tutorial steps
const STEPS = [
  {
    target: '#shop',
    title: 'Choose a Tower',
    text: 'Click a tower in the shop to select it. Try the Laser Turret — it\'s fast and accurate!',
    arrow: 'right',
    waitFor: 'tower_selected',
  },
  {
    target: '#c',
    title: 'Place Your Tower',
    text: 'Click an empty grey tile on the map to place the tower. Avoid the amber path!',
    arrow: 'left',
    waitFor: 'tower_placed',
  },
  {
    target: '#c',
    title: 'Tap to Upgrade',
    text: 'Click any placed tower to open the upgrade panel. Upgrades make towers much stronger!',
    arrow: 'left',
    waitFor: 'upgrade_opened',
  },
  {
    target: '#controls button:first-child',
    title: 'Start the Wave',
    text: 'Ready? Click ▶ Next Wave to send the robots! Place more towers before you click.',
    arrow: 'right',
    waitFor: 'wave_started',
  },
  {
    target: '#msg',
    title: 'Wave Cleared!',
    text: 'You survived! Earn gold by clearing waves. Spend it on more towers and upgrades.',
    arrow: 'right',
    waitFor: 'wave_cleared',
  },
];

let currentStep = 0;
let tutorialActive = false;
let tooltipEl: HTMLElement | null = null;

export function startTutorial(): void {
  if (isTutorialDone()) return;
  tutorialActive = true;
  currentStep = 0;
  createTooltip();
  showStep(0);
}

function createTooltip(): void {
  if (tooltipEl) return;
  tooltipEl = document.createElement('div');
  tooltipEl.id = 'tutorial-tooltip';
  tooltipEl.innerHTML = `
    <div class="tut-header">
      <span class="tut-step">1/5</span>
      <span class="tut-title"></span>
      <button class="tut-skip" id="tut-skip">Skip Tutorial</button>
    </div>
    <div class="tut-body"></div>
    <div class="tut-arrow"></div>
  `;
  document.body.appendChild(tooltipEl);
  
  const skipBtn = document.getElementById('tut-skip');
  if (skipBtn) {
    skipBtn.onclick = () => endTutorial();
  }
}

function showStep(idx: number): void {
  if (!tooltipEl || idx >= STEPS.length) return;
  const step = STEPS[idx];
  
  const stepEl = tooltipEl.querySelector('.tut-step') as HTMLElement;
  const titleEl = tooltipEl.querySelector('.tut-title') as HTMLElement;
  const bodyEl = tooltipEl.querySelector('.tut-body') as HTMLElement;
  
  if (stepEl) stepEl.textContent = `${idx + 1}/${STEPS.length}`;
  if (titleEl) titleEl.textContent = step.title;
  if (bodyEl) bodyEl.textContent = step.text;
  
  // Position tooltip near target
  const target = document.querySelector(step.target);
  if (target) {
    const rect = target.getBoundingClientRect();
    if (step.arrow === 'right') {
      tooltipEl.style.left = (rect.left - 260 - 10) + 'px';
      tooltipEl.style.top = (rect.top + rect.height / 2 - 60) + 'px';
    } else {
      tooltipEl.style.left = (rect.right + 10) + 'px';
      tooltipEl.style.top = (rect.top + rect.height / 2 - 60) + 'px';
    }
  }
  tooltipEl.style.display = 'block';
  tooltipEl.className = `tutorial-tooltip arrow-${step.arrow}`;
}

export function advanceTutorial(event: string): void {
  if (!tutorialActive || currentStep >= STEPS.length) return;
  const step = STEPS[currentStep];
  if (step.waitFor === event) {
    currentStep++;
    if (currentStep >= STEPS.length) {
      endTutorial();
    } else {
      showStep(currentStep);
    }
  }
}

function endTutorial(): void {
  tutorialActive = false;
  markTutorialDone();
  if (tooltipEl) {
    tooltipEl.style.display = 'none';
    tooltipEl.remove();
    tooltipEl = null;
  }
}

export function isTutorialActive(): boolean { return tutorialActive; }

export function cleanupTutorial(): void {
  if (tooltipEl) {
    tooltipEl.style.display = 'none';
    tooltipEl.remove();
    tooltipEl = null;
  }
  tutorialActive = false;
}
