import { WEBSITE_NAV_HIERARCHY } from '../components/SecondThoughtWebsite';

export type CmsFieldType = 'shortText' | 'longText';

export interface CmsField {
  key: string;
  label: string;
  type: CmsFieldType;
  defaultValue: string;
}

export interface CmsGroup {
  id: string;
  title: string;
  description?: string;
  fields: CmsField[];
}

const field = (key: string, label: string, defaultValue: string, type: CmsFieldType = 'shortText'): CmsField => ({
  key,
  label,
  type,
  defaultValue
});

const navGroups: CmsGroup[] = WEBSITE_NAV_HIERARCHY.map((category) => ({
  id: `nav-${category.id}`,
  title: `Website menu — ${category.title}`,
  description: 'Page titles, menu labels, introductions, and expandable section text.',
  fields: [
    field(`nav.category.${category.id}.title`, 'Menu category title', category.title),
    field(`nav.category.${category.id}.summary`, 'Category summary', category.summary, 'longText'),
    ...(category.subItems || []).flatMap((subItem) => [
      field(`nav.subitem.${subItem.id}.title`, `${subItem.title} — title`, subItem.title),
      field(`nav.subitem.${subItem.id}.headline`, `${subItem.title} — headline`, subItem.layer1.headline),
      field(`nav.subitem.${subItem.id}.orientation`, `${subItem.title} — introductory text`, subItem.layer1.orientation, 'longText'),
      field(`nav.subitem.${subItem.id}.layer2.title`, `${subItem.title} — second layer intro`, subItem.layer2.title, 'longText'),
      ...subItem.layer2.sections.flatMap((section, index) => [
        field(`nav.subitem.${subItem.id}.section.${index}.heading`, `${subItem.title} — section ${index + 1} heading`, section.heading),
        field(`nav.subitem.${subItem.id}.section.${index}.body`, `${subItem.title} — section ${index + 1} body`, section.body, 'longText')
      ])
    ])
  ]
}));

export const CMS_GROUPS: CmsGroup[] = [
  {
    id: 'arrival',
    title: 'Arrival screen',
    fields: [
      field('arrival.line1', 'First arrival line', 'You have arrived.'),
      field('arrival.line2', 'Second arrival line', 'You belong here.'),
      field('arrival.continue', 'Continue button', 'Continue'),
      field('arrival.accessibility', 'Accessibility button', 'Accessibility Settings'),
      field('arrival.settingsTitle', 'Settings panel title', 'Customise Experience'),
      field('arrival.close', 'Close settings button', 'Close')
    ]
  },
  {
    id: 'choice',
    title: 'Where would you like to begin?',
    fields: [
      field('choice.title', 'Choice page heading', 'Where would you like to begin?'),
      field('choice.wellbeing.title', 'Pause & Breathe card title', 'Pause & Breathe'),
      field('choice.wellbeing.description', 'Pause & Breathe card description', 'Breathing exercises and presence exercises to help you pause and ground before action.', 'longText'),
      field('choice.about.title', 'Explore card title', 'Explore'),
      field('choice.about.description', 'Explore card description', 'Discover what Second Thought is, why it matters, and who it is for.', 'longText'),
      field('choice.workspace.title', 'I’m ready card title', 'I’m ready'),
      field('choice.workspace.description', 'I’m ready card description', 'How to begin and put Second Thought into practice with guided reflective tools.', 'longText'),
      field('choice.enter', 'Card hover/entry label', 'Enter'),
      field('choice.backToArrival', 'Back button label', 'Back to Arrival'),
      field('choice.accessibility', 'Accessibility button label', 'Accessibility Settings')
    ]
  },
  {
    id: 'ready',
    title: 'I’m ready landing page',
    fields: [
      field('ready.heading', 'Page heading', 'I’m ready'),
      field('ready.intro', 'Page intro', 'Choose where you would like to begin putting Second Thought into practice.', 'longText'),
      field('ready.begin.title', 'How do I begin card title', 'How do I begin?'),
      field('ready.begin.description', 'How do I begin card description', 'Simple entry points to pause, reflect, and deepen understanding.', 'longText'),
      field('ready.begin.button', 'How do I begin button', 'Open How do I begin?'),
      field('ready.ecosystem.title', 'Ecosystem card title', 'The Second Thought Ecosystem'),
      field('ready.ecosystem.description', 'Ecosystem card description', 'Practice Framework, Apps, Publications, and Research for Second Thought.', 'longText'),
      field('ready.ecosystem.button', 'Ecosystem card button', 'Open The Second Thought Ecosystem')
    ]
  },
  {
    id: 'home-intro',
    title: 'Explore home / intro page',
    fields: [
      field('home.question', 'Central question', 'How can human beings respond with reverence for life when frightened, angry, hurt, under peer pressure, or when their identity and relationships feel at risk?', 'longText'),
      field('home.imageCaption', 'Homepage hero image caption', 'Performance installation at Ramsay Art Prize, Art Gallery of South Australia', 'longText'),
      field('home.statement', 'Intro statement', 'This is the central question of Second Thought.', 'longText'),
      field('home.paragraph1', 'Intro paragraph 1', 'Fear, hurt and misunderstanding are part of the human experience. So is the ability to pause and reconsider.', 'longText'),
      field('home.paragraph2', 'Intro paragraph 2', 'Research shows that we naturally protect our existing beliefs, especially when they are shaped by experience, identity or fear. Yet transformation begins when we reconsider. This is where we create space for other perspectives, examining what we think we know before choosing how to respond.', 'longText'),
      field('home.paragraph3', 'Intro question', 'How can we change our responses before they become harm?', 'longText'),
      field('home.paragraph4', 'Intro paragraph 4', 'Second Thought invites us into that space — a practice of noticing, listening and choosing with greater awareness.', 'longText'),
      field('home.whatIsButton', 'What is Second Thought button', 'What is Second Thought?')
    ]
  },
  {
    id: 'ecosystem-map',
    title: 'Ecosystem map labels',
    fields: [
      field('ecosystem.map.help', 'Map help text', 'Click any area to explore 1st layer & details'),
      field('ecosystem.map.center.title', 'Centre title', 'Second thought'),
      field('ecosystem.map.center.description', 'Centre description', 'A reflective practice centred on human dignity'),
      field('ecosystem.map.framework.title', 'Framework map title', 'Framework'),
      field('ecosystem.map.framework.subtitle', 'Framework map subtitle', 'Reflective practice'),
      field('ecosystem.map.framework.line1', 'Framework line 1', 'Notice → Pause → Question'),
      field('ecosystem.map.framework.line2', 'Framework line 2', 'Listen → Reconsider → Choose'),
      field('ecosystem.map.publications.title', 'Publications map title', 'Publications'),
      field('ecosystem.map.publications.subtitle', 'Publications map subtitle', 'Reflective journals'),
      field('ecosystem.map.publications.description', 'Publications description', 'For belonging and self-trust'),
      field('ecosystem.map.apps.title', 'Apps map title', 'Apps'),
      field('ecosystem.map.apps.subtitle', 'Apps map subtitle', 'Digital tools'),
      field('ecosystem.map.apps.description', 'Apps description', 'Calm, accessible and privacy-conscious'),
      field('ecosystem.map.research.title', 'Research map title', 'Research'),
      field('ecosystem.map.research.subtitle', 'Research map subtitle', 'Deep in thought'),
      field('ecosystem.map.research.description', 'Research description', 'Understanding dignity, trust and belonging')
    ]
  },
  {
    id: 'footer',
    title: 'Footer',
    fields: [
      field('footer.accessibility', 'Accessibility link', 'Accessibility'),
      field('footer.privacy', 'Privacy link', 'Privacy'),
      field('footer.contact', 'Contact link', 'Contact'),
      field('footer.copyright', 'Copyright statement', '© 2026 Second Thought. Designed with dignity, accessibility, and human clarity.', 'longText'),
      field('footer.wcag', 'Accessibility statement', 'Wcag aaa accessible design • zero tracking cookies', 'longText')
    ]
  },
  ...navGroups
];

export const CMS_DEFAULT_VALUES = Object.fromEntries(
  CMS_GROUPS.flatMap((group) => group.fields.map((item) => [item.key, item.defaultValue]))
);
