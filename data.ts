/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppConfig, PracticeStep, Task, EventItem, ProjectItem, DeadlineItem } from './types';

export const APP_CONFIGS: AppConfig[] = [
  {
    id: 'companion',
    name: 'Second thought companion',
    workspaceTitle: 'Today',
    aboutDescription: 'A gentle workspace designed to support your daily flow. Organize your day, track commitments, and handle projects without the anxiety of aggressive productivity benchmarks.',
    capabilities: [
      'Engage in enhanced by artificial intelligence conversational reflection with the Practice Engine',
      'Manage daily schedule events with gentle reminders',
      'Track tasks and priorities in a calm, focused list',
      'Outline projects and breaking down next actions',
      'Observe upcoming deadlines on a visual countdown timeline'
    ],
    modules: ['Practice Engine', 'Schedule', 'Calendar', 'Tasks', 'Projects', 'Deadlines']
  },
  {
    id: 'still-becoming',
    name: 'Still becoming',
    workspaceTitle: 'Journal and reflection',
    aboutDescription: 'A dedicated sanctuary for personal growth and self-discovery. Capture your raw thoughts, respond to mindful prompts, and reflect on your continuous personal journey.',
    capabilities: [
      'Write personal journal entries without pressure',
      'Reflect on targeted daily growth prompts',
      'Explore deep questions for gentle self-discovery',
      'Track your milestone timeline of personal growth'
    ],
    modules: ['Journal', 'Reflections', 'Prompts', 'Saved entries', 'Personal journey']
  },
  {
    id: 'learning',
    name: 'Second thought learning',
    workspaceTitle: 'Learning and practice',
    aboutDescription: 'Acquire knowledge at your own comfortable pace. Engage with bite-sized lessons, explore concepts thoroughly, and test your understanding without exam anxiety.',
    capabilities: [
      'Browse through structured, self-paced courses',
      'Read bite-sized lessons focused on mindful development',
      'Practice with non-punitive interactive flashcards',
      'Observe your completed milestones in real-time'
    ],
    modules: ['Courses', 'Lessons', 'Practice', 'Progress']
  },
  {
    id: 'research',
    name: 'Second thought research',
    workspaceTitle: 'Research and synthesis',
    aboutDescription: 'A calm space to gather ideas, organize primary sources, and connect insights. Synthesize information cleanly without clutter or digital noise.',
    capabilities: [
      'Create and coordinate research folders',
      'Draft and organize searchable notes with tags',
      'Document and index external sources and citations',
      'Track research tasks using a serene, focused board'
    ],
    modules: ['Projects', 'Notes', 'Sources', 'Research tasks']
  },
  {
    id: 'publishing',
    name: 'Second thought publishing',
    workspaceTitle: 'Manuscript and production',
    aboutDescription: 'Bring your creative works and written thoughts into the world. Refine manuscripts, review collaborative feedback, and prepare files for publication.',
    capabilities: [
      'Write and edit manuscript sections with draft stats',
      'Follow production steps through a serene linear pipeline',
      'Review editorial comments and supportive feedback',
      'Export final content to standard markdown or HTML files'
    ],
    modules: ['Manuscripts', 'Production', 'Reviews', 'Export']
  }
];

export const BREATHING_TECHNIQUES = [
  {
    id: 'equal',
    name: 'Equal breathing (calm focus)',
    breatheIn: 4,
    holdIn: 4,
    breatheOut: 4,
    holdOut: 4,
    description: 'A balanced practice that harmonizes the nervous system and creates steady, calm awareness.'
  },
  {
    id: 'relax',
    name: '4-7-8 breathing (deep relaxation)',
    breatheIn: 4,
    holdIn: 7,
    breatheOut: 8,
    holdOut: 0,
    description: 'Acts as a natural tranquilizer for the nervous system, helping to ease anxiety and assist sleep.'
  },
  {
    id: 'box',
    name: 'Box breathing (reset and center)',
    breatheIn: 4,
    holdIn: 4,
    breatheOut: 4,
    holdOut: 4,
    description: 'Used to clear the mind, settle energy levels, and regain intentional concentration.'
  }
];

export const PRESENCE_EXERCISES = [
  {
    title: 'Touch three textures',
    instruction: 'Identify three distinct textures surrounding you right now. Touch them gently one by one. Notice the temperature, the roughness, the soft details. Allow your focus to rest entirely on the sensation under your fingertips.'
  },
  {
    title: 'Listen for distance',
    instruction: 'Close your eyes. Listen closely. Search for the most distant sound you can hear. Do not judge it, just note its presence. Now, search for the closest sound. Feel the auditory space around you.'
  },
  {
    title: 'Acknowledge your breath',
    instruction: 'Do not change how you are breathing. Simply notice where the breath enters your body. Is it cold at the nostrils? Do you feel it more in your chest or your abdomen? Follow one full cycle from beginning to end.'
  },
  {
    title: 'Release the shoulders',
    instruction: 'Notice your posture. Bring your awareness to your shoulders. Are they tense? Gently let them drop. Roll them backward once, very slowly. Allow the weight to be carried by the ground underneath.'
  }
];

export const GROUNDING_STEPS = [
  { id: 5, label: 'things you can see in your environment' },
  { id: 4, label: 'physical sensations you can feel right now' },
  { id: 3, label: 'distinct sounds you can hear around you' },
  { id: 2, label: 'scents or aromatic elements you can smell' },
  { id: 1, label: 'flavor, texture, or trace you can taste' }
];

export const MEDITATION_SCRIPTS = [
  {
    id: 'letting-go',
    title: 'Letting go of expectations',
    duration: '3 min',
    text: 'Find a comfortable sitting position. Let your hands rest lightly on your lap. Close your eyes if that feels safe, or let your gaze rest softly on the floor. Take a deep, slow breath in... and let it out with a gentle sigh. Realize that in this moment, you do not have to perform. You do not have to achieve anything. You are already enough, exactly as you are. Breathe in ease... breathe out expectations. Let the weight of doing dissolve into simply being. When you are ready, gently open your eyes.'
  },
  {
    id: 'grounding-earth',
    title: 'Grounding in the present moment',
    duration: '5 min',
    text: 'Settle your feet firmly on the ground. Feel the steady support of the chair and the floor beneath you. You are held. You are secure. As you breathe in, imagine pulling stability up from the earth. As you breathe out, release any racing thoughts or future worries down into the ground. Feel your connection to the present space. This moment is your home. There is nowhere else you need to be. Let yourself rest in this steady foundation for a few quiet breaths.'
  }
];

export const PRACTICE_STEPS: PracticeStep[] = [
  {
    id: 'notice',
    title: 'Notice',
    instruction: 'Begin by recognizing your current mental state. What triggered this reaction, feeling, or tension? Write it down plainly, without judgment.',
    placeholder: 'I noticed that my heart raced when...'
  },
  {
    id: 'pause',
    title: 'Pause',
    instruction: 'Allow yourself to step back. Let us take a short pause together before responding. Follow the brief countdown below.',
    placeholder: ''
  },
  {
    id: 'question',
    title: 'Question',
    instruction: 'Examine the automatic thoughts or assumptions underlying this trigger. Is this thought absolutely true, or is it one possible interpretation?',
    placeholder: 'The automatic thought I am telling myself is...'
  },
  {
    id: 'listen',
    title: 'Listen',
    instruction: 'Check in with your body and your physical sensations. What does your physical self feel? What is your inner voice trying to say?',
    placeholder: 'My shoulders feel tight, and I feel a sensation of...'
  },
  {
    id: 'reconsider',
    title: 'Reconsider',
    instruction: 'Formulate an alternative, more supportive perspective. How would you view this trigger if you spoke to yourself with pure kindness?',
    placeholder: 'Another way to look at this is...'
  },
  {
    id: 'choose',
    title: 'Choose',
    instruction: 'Now, move forward with conscious intention. How do you choose to respond to this situation, honoring your wellbeing?',
    placeholder: 'I choose to move forward by...'
  }
];

// Initial Companion Data
export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Review today schedule for upcoming breaks', completed: false, priority: 'medium' },
  { id: 't2', title: 'Complete reflection entry for the week', completed: true, priority: 'low' },
  { id: 't3', title: 'Draft outline for the research project', completed: false, priority: 'high' },
  { id: 't4', title: 'Organize workspace desk for comfort', completed: false, priority: 'low' }
];

export const INITIAL_EVENTS: EventItem[] = [
  { id: 'e1', title: 'Morning grounding coffee', time: '09:00', duration: '30 min', category: 'Wellbeing' },
  { id: 'e2', title: 'Collaborative team check-in', time: '10:30', duration: '45 min', category: 'Project' },
  { id: 'e3', title: 'Quiet afternoon deep focus', time: '13:30', duration: '90 min', category: 'Work' },
  { id: 'e4', title: 'Mindful evening check-out', time: '16:30', duration: '30 min', category: 'Wellbeing' }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    title: 'Ecosystem research draft',
    description: 'Gathering feedback and compiling secondary resources for the Second Thought publishing workflow.',
    progress: 40,
    tasks: [
      { id: 'pt1', title: 'Gather primary sources', completed: true },
      { id: 'pt2', title: 'Outline core chapters', completed: false },
      { id: 'pt3', title: 'Draft the introduction', completed: false }
    ]
  },
  {
    id: 'p2',
    title: 'Workspace transition planner',
    description: 'Designing structured workflows for shifting work processes toward lower cognitive load models.',
    progress: 75,
    tasks: [
      { id: 'pt4', title: 'Conduct user feedback loops', completed: true },
      { id: 'pt5', title: 'Draft interface density specs', completed: true },
      { id: 'pt6', title: 'Implement accessible settings panel', completed: false }
    ]
  }
];

export const INITIAL_DEADLINES: DeadlineItem[] = [
  { id: 'd1', title: 'Ecosystem draft submission', date: '2026-07-22', daysLeft: 6 },
  { id: 'd2', title: 'Personal reflection compilation', date: '2026-07-30', daysLeft: 14 }
];

// Initial Still Becoming Data
export const INITIAL_JOURNAL: { id: string; timestamp: string; title: string; content: string }[] = [
  {
    id: 'j1',
    timestamp: '2026-07-15 09:30',
    title: 'A morning of quiet observation',
    content: 'Today I woke up feeling slightly overwhelmed by the tasks ahead. Instead of rushing to my desk, I stood by the window for five minutes and watched the rain fall. It helped me realize that time moves at its own pace, and I can too.'
  }
];

export const GROW_PROMPTS = [
  'What is one small thing that brought you comfort today?',
  'Where in your body are you holding onto tension, and how can you support it?',
  'What is a belief about yourself that you are ready to gently reconsider?',
  'How did you show yourself kindness during a difficult moment recently?'
];

// Initial Learning Data
export const LEARNING_COURSES = [
  {
    id: 'c1',
    title: 'Practicing pause',
    lessonsCount: 4,
    completedCount: 2,
    description: 'Learn how to integrate small, intentional pauses into highly active days to reduce stress.',
    lessons: [
      { id: 'l1', title: 'The anatomy of a trigger', content: 'Triggers are automatic responses programmed by history. By noticing them, we create space.', completed: true },
      { id: 'l2', title: 'Five seconds of space', content: 'A simple five-second pause can quiet the amygdala and allow the prefrontal cortex to respond intentionally.', completed: true },
      { id: 'l3', title: 'Deep body check-in', content: 'Scanning physical sensations gives us unedited information about our true state.', completed: false },
      { id: 'l4', title: 'Formulating supportive views', content: 'Re-authoring our automatic thoughts using compassionate self-talk.', completed: false }
    ]
  },
  {
    id: 'c2',
    title: 'Mindful communication',
    lessonsCount: 3,
    completedCount: 0,
    description: 'Guidelines for expressing feelings and active listening without defensive posturing.',
    lessons: [
      { id: 'l5', title: 'Observing without evaluating', content: 'Stating pure observations rather than judgmental conclusions.', completed: false },
      { id: 'l6', title: 'Identifying underlying needs', content: 'Behind every strong emotional reaction lies an unmet human need.', completed: false },
      { id: 'l7', title: 'Requesting with clarity', content: 'Formulating clear, actionable, positive requests for others.', completed: false }
    ]
  }
];

// Initial Research Data
export const RESEARCH_NOTES = [
  {
    id: 'rn1',
    title: 'Cognitive load theories',
    tags: ['psychology', 'ux'],
    content: 'Cognitive load is the total amount of mental effort being used in the working memory. Designing for low cognitive load means minimizing extraneous load (the way information or tasks are presented).'
  },
  {
    id: 'rn2',
    title: 'Attention restoration benefits',
    tags: ['wellbeing', 'nature'],
    content: 'Nature environments or micro-pauses restore the voluntary attention system. Non-demanding stimulation (such as watching a breeze or listening to a sound) restores cognitive capacity.'
  }
];

export const RESEARCH_SOURCES = [
  { id: 's1', title: 'Cognitive load theory in UX design', type: 'Article', citation: 'Sweller, J. (1988). Cognitive Science.' },
  { id: 's2', title: 'The restorative benefits of natural environments', type: 'Journal', citation: 'Kaplan, S. (1995). Journal of Environmental Psychology.' }
];

// Initial Publishing Data
export const MANUSCRIPT_SECTIONS = [
  { id: 'ms1', section: 'Introduction: The space between', wordCount: 1250, status: 'Completed' },
  { id: 'ms2', section: 'Chapter 1: The pressure of productivity', wordCount: 3400, status: 'In review' },
  { id: 'ms3', section: 'Chapter 2: Restoring the human perspective', wordCount: 1800, status: 'Drafting' }
];

export const EDITORIAL_REVIEWS = [
  { author: 'Sarah Jenkins', comment: 'The transition from the historical context to the modern workplace in Chapter 1 is very smooth. Consider expanding on the role of digital notifications.' },
  { author: 'Michael Chang', comment: 'Loved the personal anecdotes in Chapter 2. They make the theoretical frameworks feel grounded and actionable.' }
];
